# 資料格式、Bootstrap、Editor 腳本、存檔、事件匯流排

## 1. JSON 資料範例（`Assets/_Project/Data/`）

`materials.json`
```json
{ "schemaVersion": 1,
  "materials": [
    { "id": "empty", "kind": "Empty", "density": 0, "palette": ["#00000000"] },
    { "id": "sand",  "kind": "Powder", "density": 30, "palette": ["#d8b56a","#cfa95c","#e2c07a","#c9a356"], "tags": ["solid"] },
    { "id": "water", "kind": "Liquid", "density": 10, "dispersion": 5, "palette": ["#2f6fdb","#3577e6","#2a66cc","#3a7ff0"] },
    { "id": "fire",  "kind": "Fire",   "density": 1, "lifetime": 40, "decayTo": "smoke", "palette": ["#ff7a1a","#ffb03a","#ff4d00","#ffd060"], "emissive": true },
    { "id": "steam", "kind": "Gas",    "density": 2, "dispersion": 3, "lifetime": 90, "decayTo": "empty", "palette": ["#cfd8e3"] },
    { "id": "stone", "kind": "Static", "density": 100, "palette": ["#6b6b73"] }
  ] }
```

`reactions.json`
```json
{ "schemaVersion": 1,
  "reactions": [
    { "id": "quench",   "a": "water", "b": "fire",  "outA": "steam", "outB": "empty", "chance": 0.8,  "score": 5,  "event": "sfx_hiss" },
    { "id": "obsidian", "a": "water", "b": "lava",  "outA": "steam", "outB": "stone", "chance": 1.0,  "score": 12, "event": "sfx_crack" },
    { "id": "ignite",   "a": "fire",  "b": "oil",   "outA": "fire",  "outB": "fire",  "chance": 0.35, "score": 2,  "event": "sfx_whoosh", "chainable": true }
  ] }
```
- JSON 中 `chance` 用 0–1 小數方便人讀；**載入時轉成 0–65535 整數**，模擬內不出現浮點。
- `catalysts.json` 的 modifier 是有限的 op 集合（`AddReaction`, `RemoveReaction`, `ScaleScore{rule|tag, num, den}`, `OverrideChance`, `ConvertMaterial`, `ChainMultiplierBonus`），不允許任意腳本 → 好驗證、好平衡模擬。數值用分數 `num/den` 而非浮點。

## 2. 載入與驗證（純 C#，`PourDecisions.Content`）

```csharp
public sealed class ContentDb {
    public MaterialTable Materials; public ReactionTable BaseReactions;
    public IReadOnlyDictionary<string, ushort> MatIndex;  // 只在載入/存檔邊界使用
    public IReadOnlyList<VialDef> Vials; public IReadOnlyList<CatalystDef> Catalysts;
    public string ContentHash;                             // 所有 JSON 原文 SHA-256 → 回放相容性

    public static ContentDb Load(IContentSource src, List<string> errors) { /* parse → validate → compile */ }
}
public interface IContentSource { string Read(string fileName); }  // Unity: TextAsset / Resources；dotnet: File.ReadAllText
```
- Unity 端：`Data/` 放在 `Assets/_Project/Resources/Data/`（或 Addressables，日後再換），`Resources.Load<TextAsset>("Data/materials").text`。
- 驗證錯誤收集成清單一次報完，**不要第一個錯就 throw**（AI 修資料時一次看到全部問題）。
- 催化劑：`ReactionCompiler.Compile(baseDefs, activeCatalysts)` → 新的 `ReactionTable`，於回合開始 `world.SetReactions(...)`。

## 3. Bootstrap（`PourDecisions.Boot`）

```csharp
public sealed class GameRoot : MonoBehaviour {
    IPlatformServices _platform; ContentDb _content; SaveService _saves; GameStateMachine _fsm; EventBus _bus;

    void Awake() {
        DontDestroyOnLoad(gameObject);
        Application.targetFrameRate = -1; QualitySettings.vSyncCount = 1;
        var errors = new List<string>();
        _content = ContentDb.Load(new ResourcesContentSource(), errors);
        if (errors.Count > 0) { foreach (var e in errors) Debug.LogError(e); }   // CI smoke test 會抓 error log
        _platform = PlatformFactory.Create();                                    // Steam 或 Null
        _saves = new SaveService(Application.persistentDataPath, _platform);
        _bus = new EventBus();
        var view = ViewFactory.CreateAll(transform, _content, _bus);             // Camera、GridRenderer、UI root，全程式生成
        _fsm = new GameStateMachine(_content, _saves, _platform, _bus, view);
        _fsm.Enter(new MainMenuState());
    }
    void Update() { _platform.Tick(); _fsm.Tick(Time.unscaledDeltaTime); }
    void OnApplicationQuit() { _saves.FlushProfile(); _platform.Shutdown(); }
}
```

- 遊戲狀態：`MainMenuState`, `RunMapState`, `PourState`（玩家選瓶與落點）, `SettleState`（模擬直到 Settled）, `ScoreState`, `ShopState`, `ResultState`。每個 state 只做 Enter/Tick/Exit，UI 由 state 建立與銷毀。
- 模擬步進在 `SettleState.Tick`：`accum += dt * speed; while (accum >= 1/60f && ticksThisFrame < cap) { world.Step(); accum -= 1/60f; }`。這裡的 float 只決定「這一幀跑幾個 tick」，不進入模擬 → 不破壞決定性。
- UI 選型：UI Toolkit（UXML/USS 都是文字，AI 好編輯）做選單/商店；計分飄字等 juice 可用 TMP world-space。見 `unity:ui-uitk`。

## 4. Editor 產生器（`PourDecisions.Editor`）

```csharp
namespace PourDecisions.EditorTools {
public static class ProjectGenerator {
    const string Scenes = "Assets/_Project/Scenes", Prefabs = "Assets/_Project/Prefabs";

    [MenuItem("PourDecisions/Generate All")]
    public static void GenerateAll() { EnsureFolders(); GenerateBootScene(); GeneratePrefabs(); GenerateFontAtlases(); AssetDatabase.SaveAssets(); Debug.Log("[Gen] done"); }

    public static void GenerateBootScene() {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        new GameObject("GameRoot").AddComponent<GameRoot>();
        var path = $"{Scenes}/Boot.unity";
        EditorSceneManager.SaveScene(scene, path);
        EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(path, true) };
    }

    public static void GeneratePrefabs() {
        // 例：計分飄字 prefab
        var go = new GameObject("ScorePopup");
        var tmp = go.AddComponent<TMPro.TextMeshPro>(); tmp.fontSize = 6; tmp.alignment = TMPro.TextAlignmentOptions.Center;
        go.AddComponent<ScorePopupView>();
        PrefabUtility.SaveAsPrefabAsset(go, $"{Prefabs}/ScorePopup.prefab");
        Object.DestroyImmediate(go);
    }

    static void EnsureFolders() { foreach (var p in new[] { Scenes, Prefabs }) if (!AssetDatabase.IsValidFolder(p)) { var parent = System.IO.Path.GetDirectoryName(p).Replace('\\','/'); AssetDatabase.CreateFolder(parent, System.IO.Path.GetFileName(p)); } }
    static void GenerateFontAtlases() { /* 見 platform-ci.md §1 */ }
}}
```
- 冪等：重跑會覆蓋同路徑資產，**保持 GUID**（`SaveAsPrefabAsset` 對既有路徑會更新而不換 GUID；scene 同理）。
- 也可把產生器註冊成 Pipeline 自訂 `[CliCommand]`，讓 `unity command gen_all` 直接呼叫（見 `unity:unity-cli` 的 integration-advanced）。
- ScriptableObject（Unity 資產參照表）：`PresentationCatalog : ScriptableObject { List<Entry{string id; Sprite icon; AudioClip clip; GameObject vfx;}> }`，由產生器掃描 `Art/Icons/<id>.png`、`Audio/Sfx/<id>.wav` 依命名慣例自動填入 → 加新卡只需放對檔名的圖。

## 5. 事件匯流排（Presentation 層）

```csharp
public sealed class EventBus {
    readonly Dictionary<Type, Delegate> _map = new();
    public void Subscribe<T>(Action<T> h) where T : struct => _map[typeof(T)] = _map.TryGetValue(typeof(T), out var d) ? Delegate.Combine(d, h) : h;
    public void Unsubscribe<T>(Action<T> h) where T : struct { if (_map.TryGetValue(typeof(T), out var d)) _map[typeof(T)] = Delegate.Remove(d, h); }
    public void Publish<T>(in T e) where T : struct { if (_map.TryGetValue(typeof(T), out var d)) ((Action<T>)d)?.Invoke(e); }
}
public readonly struct ReactionBurst { public readonly ushort RuleId; public readonly int Count; public readonly Vector2 Centroid; /* ctor */ }
public readonly struct ChainStep { public readonly int Depth; public readonly long Multiplier; }
public readonly struct ScoreChanged { public readonly long Total, Delta; }
```
- 每幀流程：`SettleState` 跑完本幀 tick → `ScoringSystem`（Run 層，純 C#）讀 `RuleCounts` 更新分數/連鎖 → `EventAggregator` 把 `world.Events` 依 RuleId 合併成 `ReactionBurst` → `Publish` → `world.Events.Clear()`。
- 訂閱者：`AudioDirector`（同 rule 每 80 ms 最多 1 次，音高隨 chain depth 上升）、`VfxDirector`（粒子池）、`ScoreHud`、`CameraShake`、`AchievementTracker`（再呼叫 `IPlatformServices`）。
- `Publish` 不配置記憶體（struct + 快取 delegate）；訂閱在 state Enter/Exit 成對。

## 6. 存檔服務

```csharp
public sealed class SaveService {
    public const int ProfileVersion = 1, RunVersion = 1;
    readonly string _dir;
    public SaveService(string root, IPlatformServices p) { _dir = Path.Combine(root, "saves"); Directory.CreateDirectory(_dir); }

    public void Write<T>(string name, T dto) {
        var path = Path.Combine(_dir, name + ".json"); var tmp = path + ".tmp";
        File.WriteAllText(tmp, JsonConvert.SerializeObject(dto, Formatting.Indented));
        if (File.Exists(path)) File.Replace(tmp, path, path + ".bak"); else File.Move(tmp, path);
    }
    public T Read<T>(string name, Func<JObject, JObject> migrate) where T : new() {
        foreach (var p in new[] { name + ".json", name + ".json.bak" }) {
            try { var j = JObject.Parse(File.ReadAllText(Path.Combine(_dir, p))); return migrate(j).ToObject<T>(); }
            catch (Exception e) when (e is IOException || e is JsonException) { Debug.LogWarning($"[Save] {p}: {e.Message}"); }
        }
        return new T();
    }
}
public static class ProfileMigrator {
    public static JObject Migrate(JObject j) {
        int v = j.Value<int?>("schemaVersion") ?? 0;
        if (v < 1) { /* 0→1 */ j["schemaVersion"] = 1; }
        // if (v < 2) { j["settings"]["textScale"] = 1.0; j["schemaVersion"] = 2; }
        return j;
    }
}
```
- DTO 放 Run（純 C#），SaveService 放 Presentation/Boot（用 Unity 路徑）。SimRunner 不需要存檔。
- 存 material/vial/catalyst 一律用字串 id。
- 設定（音量、語言、文字大小、色盲模式）存 profile；**語言預設跟隨 `SteamApps.GetCurrentGameLanguage()`**，其次系統語言。
- 每個 migration 配 fixture：`Tests/EditMode/Fixtures/profile_v0.json`。

## 7. Run 層（牌組、商店、計分）要點
- `RunState { ulong Seed; int Turn; List<string> Deck; List<string> Catalysts; long Score; int Gold; ... }`，全部可序列化。
- `RunRng = new Pcg32(Hash.Mix(seed, turn, StreamId.Shop, 0))` 等多串流，避免「看了商店再回頭」改變物理結果。
- 計分公式在 `ScoringSystem`，數值來自 `run_config.json`；設計細節由 `game-design` skill 決定，這裡只保證它是純函數＋決定性。
