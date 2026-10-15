# 在地化、輸入、Steamworks、Steam Deck、測試與 CI

## 1. 在地化（Unity Localization + TMP）

套件：`com.unity.localization`、`com.unity.textmeshpro`（Unity 6 內含於 uGUI）、`com.unity.nuget.newtonsoft-json`。安裝方式見 `unity:unity-package-management`；設定細節見 `unity:localization`。

**Locale 清單（首發候選，最終以 steam-marketing 決定）**：`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `de`, `fr`, `es`, `pt-BR`, `ru`, `pl`, `tr`。

**工作流（全文字檔）**
1. String Table Collection：`UI`, `Content`（材料/瓶/催化劑名稱與說明）, `Tutorial`, `Store`（只供行銷參考，不進遊戲）。
2. 主檔是 `Assets/_Project/Localization/csv/<collection>.csv`（欄：`Key,Id,en,zh-Hans,zh-Hant,...`）。AI 改 CSV → editor 腳本 `LocImporter.ImportAll()` 用 Localization 的 CSV extension（`UnityEditor.Localization.Plugins.CSV.Csv.ImportInto`）匯入。
3. EditMode test `LocalizationCoverageTests`：每個 key 每個 locale 都非空；Smart String 參數（`{0}`、`{score}`）在各語言一致；文字長度不超過英文 ×1.6（德文、俄文常爆框）。
4. 數字/百分比格式：Smart String 依 locale 格式化；分數用 `N0`。
5. 語言切換：`LocalizationSettings.SelectedLocale = ...`；需等 `LocalizationSettings.InitializationOperation` 完成再建 UI。

**CJK 字型**
- 字型（OFL，可商用）：Noto Sans SC / TC / JP / KR，或 Source Han Sans；像素風可評估 Fusion Pixel / Ark Pixel（皆 OFL，需確認授權並記入 `docs/art/ASSET_LICENSES.md`）。**不要用 zpix**（見 03_assets_legal 黑名單）。
- TMP fallback chain：`Latin_Main` → `SC_Static` → `TC_Static` → `JP_Static` → `KR_Static` → `CJK_Dynamic`（保險）。
- Static atlas 由產生器建立：從所有 CSV 收集各語言實際用到的字元 → `TMP_FontAsset.CreateFontAsset(font, samplingPointSize: 48, atlasPadding: 5, GlyphRenderMode.SDFAA, 2048, 2048, AtlasPopulationMode.Dynamic)` → `TryAddCharacters(chars)` → 轉 Static 並存檔。每次 CSV 變更後重跑。
- 簡繁中、日文漢字字形不同：zh-Hant 不要讓 SC 字型先命中 → **依 locale 切換 fallback 順序**（`LocaleFontSwitcher` 在語言變更時改 `TMP_Settings.fallbackFontAssets`／主字型的 fallback 表）。
- Steam Deck 最小字高 9px（目標 12px）at 1280×800；提供文字縮放設定（100/125/150%）。

## 2. 輸入（Input System）
- `Assets/_Project/Input/Controls.inputactions`（JSON，可直接編輯）＋啟用「Generate C# Class」。Action maps：`Gameplay`（Aim: Vector2, Pour: Button, CycleVial, Confirm, Cancel, SpeedUp）、`UI`。
- 滑鼠＝直接指向落點；手把＝左搖桿移動游標（加速曲線）、肩鍵切換瓶子、A 倒、B 取消。**每個操作都要能只用手把完成**。
- 裝置偵測：`InputUser.onChange` 或最後輸入裝置 → `GlyphService` 切換提示圖示（Xbox / PlayStation / Steam Deck / 鍵鼠）。Steam Input 開啟時手把通常呈現為 Xbox 型；可用 `SteamInput.GetInputTypeForHandle` 取得實際類型（選用）。
- 按鍵重設：`InputActionRebindingExtensions`，綁定覆蓋存 profile（`SaveBindingOverridesAsJson`）。

## 3. Steamworks.NET

安裝（Packages/manifest.json）：
```json
"com.rlabrecque.steamworks.net": "https://github.com/rlabrecque/Steamworks.NET.git?path=/com.rlabrecque.steamworks.net"
```
（可在 URL 尾加 `#<tag>` 鎖版本；鎖版本是必須的，避免 CI 拉到新版。）

```csharp
public interface IPlatformServices {
    bool IsAvailable { get; } string PlayerName { get; } string LanguageCode { get; }
    void UnlockAchievement(string id); void SetStat(string id, int value); void StoreStats();
    void ShowTextInput(string prompt, int maxLen, Action<string> done); // Steam Deck on-screen keyboard
    void Tick(); void Shutdown();
}

public sealed class SteamPlatform : IPlatformServices {
    public const uint AppId = 0; // TODO: HSU 取得 App ID 後填入（Steamworks 後台）
    public bool IsAvailable { get; private set; }
    public static SteamPlatform TryCreate() {
#if UNITY_EDITOR
        // Editor 中不做 RestartAppIfNecessary
#else
        if (SteamAPI.RestartAppIfNecessary(new AppId_t(AppId))) { Application.Quit(); return null; }
#endif
        var p = new SteamPlatform();
        try { p.IsAvailable = SteamAPI.Init(); } catch (DllNotFoundException e) { Debug.LogError(e); }
        return p.IsAvailable ? p : null;
    }
    public string PlayerName => SteamFriends.GetPersonaName();
    public string LanguageCode => SteamApps.GetCurrentGameLanguage(); // "schinese","tchinese","japanese"... → 對應 locale
    public void UnlockAchievement(string id) { SteamUserStats.SetAchievement(id); _dirty = true; }
    public void SetStat(string id, int v) { SteamUserStats.SetStat(id, v); _dirty = true; }
    public void StoreStats() { if (_dirty) { SteamUserStats.StoreStats(); _dirty = false; } } // 回合結束/退出時呼叫，不要每幀
    public void ShowTextInput(string prompt, int maxLen, Action<string> done) { /* SteamUtils.ShowGamepadTextInput + GamepadTextInputDismissed_t callback */ }
    public void Tick() => SteamAPI.RunCallbacks();
    public void Shutdown() { StoreStats(); SteamAPI.Shutdown(); }
    bool _dirty;
}
public static class PlatformFactory {
    public static IPlatformServices Create() => (IPlatformServices)SteamPlatform.TryCreate() ?? new NullPlatform();
}
```
- Steam 新版 SDK 已不需要先 `RequestCurrentStats`（SDK 1.61 起自動同步）；若使用的 Steamworks.NET 版本較舊，需在 Init 後呼叫並等 `UserStatsReceived_t`（**依實際版本確認**）。
- 成就 id 對照：`Data/achievements.json`（`id`, `stat?`, `threshold?`, `locKey`），`AchievementTracker` 依事件判斷。成就名稱/圖示在 Steamworks 後台設定，需 HSU 操作；AI 產出 CSV 讓他貼。成就名稱也要在地化（後台可填多語）。
- Steam Cloud：用 Auto-Cloud（後台設定，不寫程式）。設定範例：Root `WinAppDataLocalLow`、Subdirectory `<CompanyName>/<ProductName>/saves`、Pattern `*.json`、OS Windows；Linux/Deck 經 Proton 時使用相同 Windows 路徑。配額先設 1 MB × 20 檔。
- 開發時 repo 根放 `steam_appid.txt`（內容為 App ID）；Build 後處理腳本確保 **不** 複製到發佈資料夾。
- 不要在 headless/SimRunner/EditMode test 初始化 Steam：Factory 只在 `GameRoot` 呼叫。

## 4. Steam Deck Verified 檢查表（Valve 文件 2026）
| 類別 | 要求 | 我們的做法 |
|---|---|---|
| Input | 預設控制器設定可存取全部內容；不需改遊戲內設定 | 手把為一等公民；啟動即可用 |
| Input | 按鍵圖示符合目前輸入；手把模式下不出現鍵鼠圖示 | `GlyphService` |
| Input | 需要文字輸入時叫出 on-screen keyboard | 目前無需文字輸入；若有（命名存檔/種子輸入）用 `ShowGamepadTextInput` |
| Performance | 預設設定在 800p 達 30fps | 目標 60fps、模擬預算見 SKILL.md §11 |
| Display | 支援 1280×800（或 720p） | 16:10 UI 版面；像素網格整數縮放、留邊 |
| Display | 最小字高 ≥ 9px @1280×800（建議 12px） | 文字縮放設定 |
| Seamlessness | 不顯示「不支援」警告、不需要啟動器 | 直接進遊戲 |
| Proton | 無 Proton 阻斷性 bug | Windows build 在 Proton 測；或另出 Linux build（Unity 支援 StandaloneLinux64） |

## 5. 測試

```
Tests/EditMode/  SimRulesTests, DeterminismTests, ContentValidationTests, LocalizationCoverageTests,
                 SaveMigrationTests, ScoringTests, ReactionCompilerTests
Tests/PlayMode/  BootSmokeTest（載入 Boot，跑 600 幀，LogAssert.NoUnexpectedReceived()）
                 AutoRunTest（bot 打完 3 回合，分數 > 0，無 error）
                 PerfWorstCaseTest（com.unity.test-framework.performance）
```
- Golden 值放 `Tests/EditMode/Golden/*.json`；規則變更時以 `UPDATE_GOLDEN=1` 環境變數重產並在 commit 說明原因。
- 測試命名：`方法_情境_預期`。

## 6. Build 腳本與 CLI

```csharp
public static class BuildScript {
    public static void BuildWindows() => Build(BuildTarget.StandaloneWindows64, "Builds/Win64/PourDecisions.exe");
    public static void BuildLinux()   => Build(BuildTarget.StandaloneLinux64, "Builds/Linux/PourDecisions.x86_64");
    static void Build(BuildTarget target, string path) {
        PlayerSettings.SetScriptingBackend(NamedBuildTarget.Standalone, ScriptingImplementation.IL2CPP);
        PlayerSettings.bundleVersion = Environment.GetEnvironmentVariable("GAME_VERSION") ?? PlayerSettings.bundleVersion;
        var report = BuildPipeline.BuildPlayer(new BuildPlayerOptions {
            scenes = new[] { "Assets/_Project/Scenes/Boot.unity" }, locationPathName = path, target = target,
            options = BuildOptions.None });
        if (report.summary.result != BuildResult.Succeeded) EditorApplication.Exit(1);
    }
}
```

```bash
unity status                                                     # 有無連線 Editor
unity test Game --mode EditMode --report-format junit --output out/edit.xml --timeout 600
unity test Game --mode PlayMode --report-format junit --output out/play.xml --timeout 1200
GAME_VERSION=$(git describe --tags --always) unity build Game --target StandaloneWindows64 \
  --execute-method PourDecisions.EditorTools.BuildScript.BuildWindows
```
- 目前環境限制：使用者電腦沒有可用的命令列（見 HANDOFF）。在取得之前，程式碼先寫在雲端 repo，以 SimRunner（dotnet）驗證純 C# 部分。
- Steam 上傳（SteamPipe `steamcmd +run_app_build`）需要 HSU 的帳號與 Steam Guard，由 HSU 執行；AI 準備 `app_build_<appid>.vdf` 與 depot vdf。分支：`default`（正式）、`beta`（測試者）、`demo` 為獨立 App ID。

## 7. SimRunner（headless 平衡模擬）
```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework><AllowUnsafeBlocks>true</AllowUnsafeBlocks><LangVersion>9.0</LangVersion></PropertyGroup>
  <ItemGroup>
    <Compile Include="../../Game/Assets/_Project/Scripts/Sim/**/*.cs" />
    <Compile Include="../../Game/Assets/_Project/Scripts/Run/**/*.cs" />
    <Compile Include="../../Game/Assets/_Project/Scripts/Content/**/*.cs" />
    <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
  </ItemGroup>
</Project>
```
- `LangVersion 9.0`：Unity 6 的 C# 版本是 9，SimRunner 鎖同版本，避免寫出 Unity 編不過的語法。
- 輸出：每局一列 CSV（seed, deck, catalysts, 每回合分數, 是否過關），交給 `game-design` 分析。
- 跑法：`dotnet run -c Release --project tools/SimRunner -- --runs 10000 --seed 1 --out sim/out/run.csv`。
