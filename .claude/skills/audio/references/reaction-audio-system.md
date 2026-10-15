# ReactionAudioDirector — 架構與 C# 骨架

> 目標：模擬每幀可能產生數百個反應事件，音訊系統只做 O(類型數) 的工作。

## 資料流
```
Simulation (每 tick)
  └─ reactionCounts[ReactionType]++   // 只計數，不呼叫音訊
ScoreSystem
  └─ 排程計分音事件（序列、音階 index）
ReactionAudioDirector.Update()（每 render frame）
  ├─ 讀 reactionCounts → 平滑 rate[type]
  ├─ 驅動音床（volume / lowpass / pitch）
  ├─ 依規則播「代表性」單發（cooldown + per-type cap）
  └─ 清零 reactionCounts
```
Simulation 只寫一個 `int[]`，不知道音訊存在 → 可以在 headless 平衡模擬中跑。

## 設定資料（ScriptableObject）
```csharp
[CreateAssetMenu(menuName = "Audio/ReactionSound")]
public class ReactionSoundSO : ScriptableObject {
    public ReactionType type;
    public AudioClip[] variants;          // 3–5 個
    public float cooldown = 0.05f;        // retrigger time (s)
    public int maxVoices = 3;             // per-type cap
    public Vector2 pitchRange = new(0.94f, 1.06f);
    public Vector2 volumeDbRange = new(-1.5f, 1.5f);
    public float rateForMaxBed = 400f;    // events/s → 音床滿音量
    public AudioClip bedLoop;             // 可為 null
}
```

## 核心邏輯（骨架，未編譯驗證）
```csharp
public class ReactionAudioDirector : MonoBehaviour {
    [SerializeField] ReactionSoundSO[] sounds;
    [SerializeField] AudioMixerGroup reactionGroup, bedGroup;
    [SerializeField] int poolSize = 16;
    [SerializeField] float rateSmoothing = 0.15f; // 秒

    public static int[] Counts; // simulation 寫入

    AudioSource[] pool; float[] poolStartTime; int[] poolType;
    AudioSource[] beds; AudioLowPassFilter[] bedLpf;
    float[] rate, lastPlay; int[] lastVariant;

    void Awake() {
        int n = System.Enum.GetValues(typeof(ReactionType)).Length;
        Counts = new int[n]; rate = new float[n]; lastPlay = new float[n]; lastVariant = new int[n];
        pool = new AudioSource[poolSize]; poolStartTime = new float[poolSize]; poolType = new int[poolSize];
        for (int i = 0; i < poolSize; i++) {
            pool[i] = gameObject.AddComponent<AudioSource>();
            pool[i].playOnAwake = false; pool[i].outputAudioMixerGroup = reactionGroup; pool[i].spatialBlend = 0;
        }
        beds = new AudioSource[n]; bedLpf = new AudioLowPassFilter[n];
        foreach (var s in sounds) if (s.bedLoop) {
            var go = new GameObject("Bed_" + s.type); go.transform.SetParent(transform);
            var src = go.AddComponent<AudioSource>();
            src.clip = s.bedLoop; src.loop = true; src.volume = 0; src.priority = 200;
            src.outputAudioMixerGroup = bedGroup; src.Play();
            beds[(int)s.type] = src; bedLpf[(int)s.type] = go.AddComponent<AudioLowPassFilter>();
        }
    }

    void Update() {
        float dt = Time.unscaledDeltaTime, now = Time.unscaledTime;
        float k = 1f - Mathf.Exp(-dt / rateSmoothing);
        foreach (var s in sounds) {
            int t = (int)s.type; int c = Counts[t]; Counts[t] = 0;
            rate[t] = Mathf.Lerp(rate[t], c / Mathf.Max(dt, 1e-4f), k);

            // 音床：log 映射
            if (beds[t]) {
                float x = Mathf.Clamp01(Mathf.Log10(1 + rate[t]) / Mathf.Log10(1 + s.rateForMaxBed));
                beds[t].volume = Mathf.MoveTowards(beds[t].volume, x, dt * 4f);
                bedLpf[t].cutoffFrequency = Mathf.Lerp(800f, 8000f, x);
                beds[t].pitch = Mathf.Lerp(1f, 1.08f, x);
            }

            // 單發：只有本幀有事件、過了 cooldown、未超過 per-type cap
            if (c == 0 || now - lastPlay[t] < CooldownFor(s, rate[t])) continue;
            if (ActiveVoices(t) >= s.maxVoices) continue;               // Prevent New
            float boostDb = Mathf.Min(6f, 3f * Mathf.Log10(c));          // 數量多 → 稍大聲，上限 +6dB
            PlayOneShot(s, t, boostDb); lastPlay[t] = now;
        }
    }

    // 反應越密，代表性單發越稀疏（30ms → 120ms）
    float CooldownFor(ReactionSoundSO s, float r) => Mathf.Lerp(s.cooldown, 0.12f, Mathf.Clamp01(r / s.rateForMaxBed));

    int ActiveVoices(int t) { int n = 0; for (int i = 0; i < pool.Length; i++) if (pool[i].isPlaying && poolType[i] == t) n++; return n; }

    void PlayOneShot(ReactionSoundSO s, int t, float boostDb) {
        int idx = FreeOrOldest();
        int v = Random.Range(0, s.variants.Length);
        if (s.variants.Length > 1 && v == lastVariant[t]) v = (v + 1) % s.variants.Length; // no repeat
        lastVariant[t] = v;
        var src = pool[idx];
        src.clip = s.variants[v];
        src.pitch = Random.Range(s.pitchRange.x, s.pitchRange.y);
        src.volume = DbToLin(Random.Range(s.volumeDbRange.x, s.volumeDbRange.y) + boostDb);
        src.Play(); poolStartTime[idx] = Time.unscaledTime; poolType[idx] = t;
    }

    int FreeOrOldest() {
        int oldest = 0;
        for (int i = 0; i < pool.Length; i++) { if (!pool[i].isPlaying) return i; if (poolStartTime[i] < poolStartTime[oldest]) oldest = i; }
        return oldest; // Stop Oldest；正式版加 50–100ms fade-out 避免 click
    }

    static float DbToLin(float db) => Mathf.Pow(10f, db / 20f);
}
```

## 計分音（A 層）
```csharp
// 依序排程：每個計分事件間隔 step 秒，音高沿音階上升
static readonly int[] Major = { 0, 2, 4, 5, 7, 9, 11 };
double t0 = AudioSettings.dspTime + 0.05;
for (int i = 0; i < events.Count; i++) {
    var src = scorePool.Get();
    int deg = i % Major.Length, oct = Mathf.Min(i / Major.Length, 2);
    src.pitch = Mathf.Pow(2f, (Major[deg] + 12 * oct) / 12f);
    src.clip = events[i].isMult ? multClip : chipsClip;
    src.PlayScheduled(t0 + i * step);   // step 起始 0.09–0.12s，事件多時壓縮到 0.04s
    // 對應的 UI number pop 在同一時間觸發
}
```
- pitch 用 `AudioSource.pitch` 會同時改長度；計分音很短，可接受。若要更準確，預先在 jfxr 產生 12 個半音版本。
- 事件 > 30 個：合併成群組（「+N chips」一聲），避免結算拖太久。

## 驗證方法
- 寫 Editor 測試場景：按鍵一次注入 `Counts[type] += 500` 持續 3 秒，觀察 Profiler（Audio：Playing sources、Total CPU）、聽有無爆音。
- 錄音後用 Audacity 看波形：不應有方波狀削波。
