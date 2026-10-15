# Adaptive 音樂（自製 → stems → Unity）

## 為什麼自製
- 音樂是 Content ID 風險最高的素材。自製且不註冊 CID → 實況主安全（見 03_assets_legal.md §1.6）。
- 決策：BeepBox 為主（不主張歌曲所有權），FamiStudio 備用（產出授權未驗證，使用前再查並記錄）。

## 作曲規格（每首）
- BPM 固定（建議 100–120；回合中氛圍專注但有推進感），4/4。
- 長度：16 或 32 小節的完整 loop，開頭與結尾在同一和弦/能量上 → 無縫。
- 調性：每首一個調；同一場景的 stems 必須同調同 BPM 同長度。
- 層的編排（vertical layering 的關鍵）：**每一層單獨聽也成立、疊加也不打架**。
  | 層 | 內容 | 頻段 |
  |---|---|---|
  | L0 | pad、低音持續音 | 低、中低 |
  | L1 | 輕鼓（kick + 輕 hat） | 低、高 |
  | L2 | 主旋律 | 中 |
  | L3 | 高音 arpeggio、加密打擊 | 中高、高 |
  | L4 | 高潮：反拍和聲、銅管式 lead、更重的鼓 | 全頻（小心蓋過計分音 → 避開計分音所在的 1–3 kHz 音域） |
- 計分音（chips/mult 的音階）要與音樂**同調**，最好用音樂的五聲音階 → 計分聲聽起來像音樂的一部分（Balatro 的感覺）。如果音樂會換調，計分音的基準音由 MusicDirector 提供。

## BeepBox 匯出流程
1. 每層放在不同 channel；匯出時用 **mute 其他 channel** 分次匯出 WAV（或用 BeepBox 的 per-channel export，若可用）。
2. 檔名：`<song>_L0.wav` … `<song>_L4.wav`，48 kHz 16-bit。
3. 歌曲原始資料（BeepBox URL / JSON）存在 `docs/audio/music/<song>.json`，可版控、日後修改。
4. Audacity 檢查每條 stem 長度完全相同（sample 數一致）、loop 點無 click。

## Unity 實作
```csharp
public class MusicDirector : MonoBehaviour {
    [SerializeField] AudioSource[] stems;      // L0..L4，loop = true，outputs → Music group
    [SerializeField] float fadeUp = 0.8f, fadeDown = 2.0f;
    float[] target;

    public void StartSong() {
        double t = AudioSettings.dspTime + 0.2;
        foreach (var s in stems) { s.volume = 0; s.PlayScheduled(t); }   // sample-accurate 同步
        target = new float[stems.Length]; target[0] = 1;
    }

    // intensity 0..1：由 mult、分數進度、連鎖反應數計算
    public void SetIntensity(float x) {
        float[] up   = { 0f, 0.05f, 0.25f, 0.55f, 0.85f };
        for (int i = 1; i < stems.Length; i++) {
            float down = up[i] * 0.8f;            // hysteresis：降層門檻低 20%
            if (x >= up[i]) target[i] = 1; else if (x < down) target[i] = 0;
        }
    }

    void Update() {
        for (int i = 0; i < stems.Length; i++) {
            float rate = (target[i] > stems[i].volume ? 1f / fadeUp : 1f / fadeDown) * Time.unscaledDeltaTime;
            stems[i].volume = Mathf.MoveTowards(stems[i].volume, target[i], rate);
        }
    }
}
```
- intensity 範例：`x = max(log10(mult)/log10(50), projectedScore/target)`，clamp 到 0..1，再做 0.5s 平滑。
- 換曲（商店 ↔ 回合）：在下一個小節線（`barLength = 60/BPM*4`，以 dspTime 計算）排程新曲 `PlayScheduled`，舊曲 0.5s fade out。
- Import：stems 用 Compressed In Memory（Vorbis q60）比 Streaming 更穩（5 條同時 streaming 可能有 I/O 抖動）；記憶體每首約數 MB，可接受。若曲目多再改 Streaming 並測試。
- Volume 0 的 AudioSource 仍在播放並占 voice；Music 的 priority 設 0（最高）以免被 SFX 搶走。

## 曲目數量（起始規劃）
- 主選單 1、回合 2–3（隨 ante 進程更緊張）、商店 1、Boss 回合 1、勝利/失敗 jingle 各 1。
- 先做 1 首回合曲＋ 5 層驗證系統，試玩通過後再擴充。

## 檢查
- [ ] 所有 stems 同長度、同 BPM、loop 無 click
- [ ] 任意層組合都好聽（至少試 L0、L0+L1、L0–L2、全開）
- [ ] 計分音與音樂同調
- [ ] intensity 在門檻附近抖動時，層不會頻繁切換
- [ ] 曲子原始檔已存入 docs/audio/music/
