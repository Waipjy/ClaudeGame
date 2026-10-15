---
name: unity-architecture
description: Pour Decisions（落沙模擬 × 牌組構築 roguelite）的 Unity 6 URP 2D 程式架構知識包。寫任何 C#、建立場景/prefab、設計資料格式、實作落沙模擬核心、存檔、在地化、Steamworks、測試或 CI build 之前先讀。所有東西以 code-first、data-driven、可 headless 執行為原則，因為 AI 不能順手點 Unity GUI。
---

# Unity 架構（Pour Decisions）

> 職能：程式。上游決策見 `docs/handoff/DECISIONS.md`；不要推翻已拍板決策。
> 詳細內容：`references/sim-core.md`（模擬核心完整程式骨架、效能、決定性）、`references/data-bootstrap.md`（資料格式、bootstrap、編輯器腳本、存檔、事件）、`references/platform-ci.md`（在地化、輸入、Steamworks、Steam Deck、測試、CI）。
> 相關 Unity skill：`unity:unity-cli`（CLI 指令）、`unity:localization`、`unity:optimize-text-mesh-pro`、`unity:unity-package-management`、`unity:2d-pixel-perfect`。

## 0. 五條鐵律

1. **模擬與規則是純 C#**：`PourDecisions.Sim` 與 `PourDecisions.Run` 兩個 assembly 設 `noEngineReferences: true`，不得 `using UnityEngine`。能在 EditMode test 和 `dotnet` 主控台程式裡跑，平衡模擬就靠它。
2. **決定性（determinism）**：模擬只用整數運算＋自有 seeded RNG＋固定 tick＋固定更新順序。同 seed + 同玩家操作序列 → 每 tick 的 grid hash 完全相同。計分屬於規則層，不屬於表現層。
3. **資料是文字檔**：材料、反應、瓶子（vials）、催化劑（catalysts）、敵人/關卡目標都是 `Assets/_Project/Data/*.json`，AI 直接改文字、git diff 看得懂、headless 模擬讀同一份。ScriptableObject 只拿來掛 Unity 資產參照（sprite、AudioClip、VFX prefab），以字串 id 對應。
4. **場景近乎空的**：只有 `Boot.unity`（一個 `GameRoot` 物件），其餘全部由程式生成；prefab 由 editor 腳本產生（`PrefabUtility.SaveAsPrefabAsset`）。禁止手改 `.unity/.prefab/.asset` YAML；Editor 有連線時用 `unity command`，沒有時用 `-executeMethod` 跑 editor 腳本。
5. **單向依賴**：Presentation → Run → Sim。Sim 只輸出「狀態 + 事件緩衝區」，從不回呼表現層。

## 1. 專案目錄與 assembly definitions

Unity 專案在 repo 的 `Game/`（使用者電腦 `C:\Users\waipj\Documents\ClaudeGame\Game`）。所有自有內容放 `Assets/_Project/` 與第三方隔開。

```
Game/Assets/_Project/
  Data/            materials.json reactions.json vials.json catalysts.json run_config.json achievements.json
  Scripts/
    Sim/           PourDecisions.Sim.asmdef      (noEngineReferences, allowUnsafeCode) 網格、材料、反應、RNG、事件
    Run/           PourDecisions.Run.asmdef      (noEngineReferences) 牌組、商店、回合、計分、存檔 DTO；refs: Sim
    Content/       PourDecisions.Content.asmdef  (noEngineReferences) JSON → 定義物件、驗證；refs: Sim, Run + Newtonsoft.Json.dll（precompiled reference）
    Presentation/  PourDecisions.Presentation.asmdef  渲染、UI、音效、VFX、輸入；refs: Sim, Run, Content, Unity.InputSystem, Unity.TextMeshPro, Unity.Localization
    Platform/      PourDecisions.Platform.asmdef IPlatformServices + SteamPlatform + NullPlatform；refs: Run, com.rlabrecque.steamworks.net
    Boot/          PourDecisions.Boot.asmdef     GameRoot 組裝根（composition root）；refs: 全部
    Editor/        PourDecisions.Editor.asmdef   (Editor only) 場景/prefab/字型/資料產生器、Build 腳本
  Tests/
    EditMode/      PourDecisions.Tests.EditMode.asmdef (Editor, refs: Sim, Run, Content, nunit)
    PlayMode/      PourDecisions.Tests.PlayMode.asmdef
  Art/ Audio/ Fonts/ Localization/ Prefabs/(產生物) Scenes/Boot.unity
tools/SimRunner/   SimRunner.csproj（dotnet 主控台，<Compile Include> 引入 Sim/Run/Content 原始碼，見 platform-ci.md §7）
```

asmdef 範例（Sim）：

```json
{ "name": "PourDecisions.Sim", "rootNamespace": "PourDecisions.Sim",
  "references": [], "noEngineReferences": true, "allowUnsafeCode": true,
  "autoReferenced": false, "overrideReferences": false }
```

`autoReferenced: false` 讓 Assembly-CSharp 不能偷用它，強迫走依賴圖。

## 2. Code-first 場景

- `Boot.unity` 只有一個 `GameRoot`（MonoBehaviour），`Awake()` 依序：讀 JSON → 建 `ContentDb` → 建 `PlatformServices` → 載存檔 → 建 Camera/Renderer/UI → 進主選單狀態。
- 狀態機（MainMenu / Run / Shop / Results）用純 C# 類別；畫面切換＝建/毀 UI root，而非切 scene（快、無 GUI 依賴）。
- 場景與 prefab 由 `Editor/ProjectGenerator.cs` 產生，可重跑、冪等（先刪後建）。執行：
  - 有連線 Editor：`unity command eval 'PourDecisions.EditorTools.ProjectGenerator.GenerateAll();'`（先 `unity status` 確認 ready；`unity command` 查可用指令）。
  - 無 Editor：`unity run Game -- -executeMethod PourDecisions.EditorTools.ProjectGenerator.GenerateAll -logFile gen.log`。
- 程式碼見 `references/data-bootstrap.md` §2。

## 3. Data-driven 內容

| 檔案 | 內容 | 重點欄位 |
|---|---|---|
| `materials.json` | 沙、水、油、火、酸、熔岩、冰、火藥、種子、鹽… | `id`, `kind`(Empty/Static/Powder/Liquid/Gas/Fire), `density`(int), `dispersion`(int, ≤8), `lifetime`, `palette`[hex], `flammable`, `tags` |
| `reactions.json` | 兩材料相鄰時的反應 | `a`, `b`, `outA`, `outB`, `chance`(0–65535), `score`, `event`(音效/VFX id), `requiresCatalyst?` |
| `vials.json` | 手牌（一瓶材料） | `id`, `material`, `amount`, `pourShape`, `cost`, `rarity`, `locKey` |
| `catalysts.json` | 改寫規則的遺物 | `id`, `modifiers`[{`op`: AddReaction/ScaleScore/OverrideChance…, 參數}] |

- 載入後 **編譯成扁平查表**：`ReactionTable` 是 `[matCount * matCount]` 陣列，查一次 O(1)。催化劑在回合開始時以 modifiers 重編譯表，模擬迴圈內不做任何字典查詢或字串比較。
- material id 在 JSON 用字串，執行期對應 `ushort` 索引（按檔案順序固定，**索引進存檔/回放前一律存字串**，防止改資料後錯位）。
- 必須有 EditMode test `ContentValidationTests`：所有參照的 id 存在、chance 範圍、dispersion ≤ chunk/2、每個 `locKey` 在 String Table 存在、反應不產生無限循環（A+B→A+B）。

## 4. 落沙模擬：選型結論

| 選項 | 優點 | 缺點 | 結論 |
|---|---|---|---|
| A. 單執行緒純 C# + flat array + chunk dirty rect | 最簡單、完全決定性、headless/dotnet 可跑、易除錯 | 大網格吃 CPU | **預設**。燒杯網格約 256×192–320×240（5–8 萬格），dirty rect 讓靜止區域免費 |
| B. 同一套 kernel 用 Burst + Jobs（`NativeArray`，checkerboard 4-pass 平行） | 5–20 倍加速（Burst 文獻常見量級，未在本專案驗證） | Burst 編譯限制、需要 NativeArray 生命週期管理 | **只有 profiler 證明 A 超出預算才升級**；kernel 寫成吃指標的 static 方法，兩邊共用 |
| C. Compute Shader（GPU） | 百萬格級 | 跨 GPU 決定性難保證、計分事件要 readback、Steam Deck/內顯風險、無法 headless 平衡 | **不採用**於模擬；GPU 只做渲染與發光後處理 |

**Noita 做法（GDC 2019 "Exploring the Tech and Design of Noita"）**：世界切成 64×64 chunk，每個 chunk 記一個 dirty rect，只模擬 rect 內像素；多執行緒以 checkerboard 方式分 4 批更新互不相鄰的 chunk（像素一 tick 移動不得超過半個 chunk），由下往上掃描。我們燒杯小，用 **32×32 chunk**。

核心迴圈骨架（完整版見 `references/sim-core.md`）。下方為易讀的單迴圈版；**正式實作從第一天就用 checkerboard 4-pass 的 chunk 順序**（sim-core.md §6），日後換 Burst 才不必重產 golden hash：

```csharp
namespace PourDecisions.Sim {
public struct Cell { public ushort Mat; public byte Aux; public byte Stamp; } // Stamp=最後更新的 tick(低 8 bit)

public sealed class SimWorld {
    public readonly int W, H; public readonly Cell[] Cells;       // index = y*W + x, y=0 在底部
    readonly ChunkGrid _chunks; readonly ReactionTable _rx; readonly MaterialTable _mt;
    public readonly EventBuffer Events = new(4096);
    public uint Tick; Pcg32 _rng;

    public void Step() {                       // 一個固定 tick；永遠不吃 deltaTime
        Tick++; byte stamp = (byte)Tick; bool leftToRight = (Tick & 1) == 0;
        _chunks.SwapDirty();                   // 本 tick 處理上 tick 標記的 rect
        for (int cy = 0; cy < _chunks.CountY; cy++)          // 由下往上
        for (int i = 0; i < _chunks.CountX; i++) {
            int cx = leftToRight ? i : _chunks.CountX - 1 - i;
            if (!_chunks.TryGetRect(cx, cy, out var r)) continue; // 睡眠中的 chunk
            _rng = Pcg32.ForChunk(Seed, Tick, cx, cy);            // 每 chunk 獨立 RNG 串流 → 可平行、可重現
            for (int y = r.MinY; y <= r.MaxY; y++)
            for (int k = 0; k <= r.MaxX - r.MinX; k++) {
                int x = leftToRight ? r.MinX + k : r.MaxX - k;
                int idx = y * W + x;
                if (Cells[idx].Stamp == stamp) continue;          // 本 tick 已動過
                UpdateCell(x, y, idx, stamp);
            }
        }
    }
    // UpdateCell: 依 kind 分派 → 先反應(查 _rx 相鄰 4 格) → 再移動(粉體下/斜下, 液體+側向 dispersion, 氣體上)
    // 每次寫入格子都呼叫 _chunks.MarkDirty(x,y) 並 Stamp=stamp；反應寫入 Events.Push(...)
}}
```

## 5. 決定性與回放

- 禁用：`float/double`（模擬內）、`UnityEngine.Random`、`System.Random`（實作跨版本不保證）、`Dictionary` 走訪順序、`DateTime`、多執行緒非固定分批。
- RNG：自寫 `Pcg32`（或 xorshift128+）。run seed → `Hash(seed, turn)` 給規則層（商店、抽牌），`Hash(seed, tick, cx, cy)` 給模擬層。兩邊串流分開，商店重抽不影響物理。
- 回合制：倒料後模擬「結算」直到所有 chunk 睡眠或達 `maxSettleTicks`（例：900 tick），表現層可 1×/4×/即時跳過——同一結果，只是每幀跑幾個 tick。
- 回放檔＝`{ gameVersion, contentHash, seed, actions:[{turn, vialId, x, tick}] }`。`contentHash` 是所有 Data JSON 的 SHA-256；不同就拒播。
- 測試：`DeterminismTests` 跑固定 seed 的 10 回合，比對每回合 `GridHash()` 與 golden 值；Burst 版與純 C# 版必須同 hash。

## 6. 表現層分離與事件匯流排

- Sim 產生 `ReactionEvent { int X, Y; ushort RuleId; uint Tick; }` 到預先配置的 ring buffer（零 GC），**不用 C# event/delegate**。
- 計分（score、chain multiplier）由 `Run` 層在消費事件時算，屬決定性部分。
- Presentation 每幀 `Drain` 一次，彙整成 `GameEvent`（`ReactionBurst{ruleId, count, centroid}`、`ChainStep{n}`、`ScoreChanged`），經 `EventBus`（`Dictionary<Type, List<Action<T>>>`，只在表現層用）派給 Audio/VFX/UI。同一幀同規則 50 次反應 → 1 個音效 + 數量參數，避免爆音。
- 渲染：每幀把 `Cells` 的 material id（+Aux 變化）寫進 `Texture2D`（`R16` id 貼圖 + palette shader，或 `RGBA32` 直接上色），`GetPixelData<T>(0)` 拿 NativeArray 直接寫、`Apply(false)`，`FilterMode.Point`。只上傳 dirty rect 的列也可以但先別優化。細節見 sim-core.md §5。

## 7. 存檔

- JSON（Newtonsoft：`com.unity.nuget.newtonsoft-json`），`Application.persistentDataPath/saves/`：`profile.json`（解鎖、設定、統計）與 `run.json`（進行中的 run，只在回合邊界寫）。
- 每檔頂層 `"schemaVersion": n`；`SaveMigrator` 依序執行 `Migrate_1_to_2`…；每次 schema 變更加一個 migration + 一個 EditMode test（舊檔 fixture → 新版）。
- 原子寫入：寫 `*.tmp` → `File.Replace`（或 Move），保留 `*.bak`。讀失敗 → 用 bak → 再失敗才重置並記錄。
- run 存檔＝seed + 已執行動作 + 牌組狀態；網格不必存（重播回合即可重建，前提是決定性）。
- Steam Cloud 用 **Auto-Cloud**（Steamworks 後台設定路徑，Windows root `WinAppDataLocalLow`，子路徑 `<CompanyName>/<ProductName>/saves`，pattern `*.json`），程式不必呼叫 Remote Storage API。

## 8. 在地化、字型、輸入

- Unity Localization（`com.unity.localization`）String Tables；**CSV 匯入/匯出是 AI 的工作介面**（CSV extension），翻譯在文字檔中修改後由 editor 腳本匯入。玩法文字一律 `locKey`，數字用 Smart String 參數。
- 首發 10+ 語言：en, zh-Hans, zh-Hant, ja, ko, de, fr, es, pt-BR, ru, pl（依行銷 skill 調整）。
- CJK 字型：Noto Sans SC/TC/JP/KR（OFL）做 TMP fallback chain；主字型拉丁 + 各 CJK 的 **static atlas 由 editor 腳本從 String Table 收集字元產生**，另加 dynamic fallback 防漏字。細節：`unity:optimize-text-mesh-pro`。
- 輸入：Input System，`.inputactions` 是 JSON 可直接編輯；滑鼠為主，**完整手把支援**（Steam Deck Verified 要求）；依目前裝置切換按鍵圖示。
- 遊戲內文字與翻譯由 AI 撰寫 → 上架必須揭露（見 `steam-marketing`）。所以文字量壓到最低。

## 9. Steamworks 與 Steam Deck

- Steamworks.NET（UPM git URL：`https://github.com/rlabrecque/Steamworks.NET.git?path=/com.rlabrecque.steamworks.net`），包在 `IPlatformServices`（`UnlockAchievement`, `SetStat`, `StoreStats`, `IsOverlayActive`…）後面；headless/測試/非 Steam build 用 `NullPlatform`。
- 啟動：`SteamAPI.RestartAppIfNecessary(appId)` → `SteamAPI.Init()`；每幀 `SteamAPI.RunCallbacks()`；退出 `SteamAPI.Shutdown()`。`steam_appid.txt` 只在開發時放專案根，不進 build。
- 成就/統計 id 定義在 `Data/achievements.json`，與 Steamworks 後台一致（後台由 HSU 手動建立；AI 產生對照表給他）。
- Steam Deck Verified：1280×800 預設可玩 ≥30fps（我們目標 60）、全手把操作且預設設定即可、手把圖示正確、最小字高 ≥9px（目標 12px）、需要文字輸入時叫出 on-screen keyboard、不顯示「不支援」警告、無啟動器。程式碼與檢查表：`references/platform-ci.md`。

## 10. 測試與 CI

- EditMode（快、無場景）：Sim 規則單元測試（「水+火→蒸氣」）、決定性 golden hash、內容驗證、存檔 migration、計分。
- PlayMode：Boot 場景 smoke test（跑 600 幀無 error log、記憶體不暴衝）、一場自動 run（bot 隨機出牌）。
- 指令：
  ```bash
  unity test Game --mode EditMode --report-format junit --output results-edit.xml --timeout 600
  unity test Game --mode PlayMode --report-format junit --output results-play.xml --timeout 1200
  unity build Game --target StandaloneWindows64 --execute-method PourDecisions.EditorTools.BuildScript.BuildWindows
  ```
  exit code 0 才算過；6 = 測試失敗。`BuildScript` 用 `BuildPipeline.BuildPlayer`，IL2CPP、版本號從 `git describe` 寫入 `PlayerSettings.bundleVersion`。
- 平衡模擬：`dotnet run --project tools/SimRunner -- --runs 10000 --seed 1` 輸出 CSV 到 `sim/out/`。注意：`sim/` 的 Python 原型只用於早期探索；C# 核心出來後以 SimRunner 為唯一真相，避免兩套規則分歧。

## 11. 效能預算（目標機：Steam Deck，1280×800）

| 項目 | 預算 |
|---|---|
| 幀時間 | 16.6 ms（60 fps），最差不低於 30 fps |
| 模擬 | ≤ 4 ms/幀（含每幀多個 tick；4× 快轉時允許降到 30 fps） |
| 網格上傳 + 渲染 | ≤ 2 ms |
| GC 配置 | 遊玩中 **0 B/幀**（模擬與事件全預先配置；UI 字串用 TMP `SetText` 數字格式） |
| 記憶體 | < 1 GB；build 大小 < 300 MB |
| 冷啟動到主選單 | < 5 s |
| headless 平衡 | ≥ 200 回合/秒（單核，純 C#） |

量測：Unity Profiler + `ProfilerMarker`（`Sim.Step`, `Sim.Upload`）；PlayMode 效能測試可用 `com.unity.test-framework.performance`。超預算的順序：先檢查 dirty rect 是否過大 → 降網格解析度 → 才上 Burst。

## 12. 交付檢查（每個程式 PR）

- [ ] Sim/Run 沒有 `UnityEngine` 參照；新規則有 EditMode test。
- [ ] 決定性 golden hash 測試仍過（改了規則就更新 golden，並在 commit 說明）。
- [ ] 新內容只改 JSON；`ContentValidationTests` 過。
- [ ] 新文字都有 `locKey` 且 CSV 已更新所有語言。
- [ ] 沒有手改 scene/prefab YAML；產生器可重跑。
- [ ] 遊玩中無 GC alloc（Profiler 抽查）。
- [ ] 更新 `docs/tech/` 相關文件與 HANDOFF。

## Sources
- Noita GDC 2019 talk（YouTube）：https://www.youtube.com/watch?v=prXuyMCgbTc ；摘要：https://braindump.jethro.dev/posts/gdc_vault_exploring_the_tech_and_design_of_noita/ ；https://80.lv/articles/noita-a-game-based-on-falling-sand-simulation
- Unity Texture2D.GetPixelData / SetPixelData：https://docs.unity3d.com/ScriptReference/Texture2D.SetPixelData.html
- Unity Burst：https://docs.unity3d.com/Packages/com.unity.burst@latest ；Jobs：https://docs.unity3d.com/Manual/job-system.html
- Assembly definitions：https://docs.unity3d.com/Manual/assembly-definition-files.html
- Unity Localization：https://docs.unity3d.com/Packages/com.unity.localization@latest
- Steamworks.NET：https://github.com/rlabrecque/Steamworks.NET ；https://steamworks.github.io/
- Steam Auto-Cloud：https://partner.steamgames.com/doc/features/cloud
- Steam Deck compatibility：https://partner.steamgames.com/doc/steamdeck/compat
- Unity 6 releases：https://unity.com/releases/unity-6
