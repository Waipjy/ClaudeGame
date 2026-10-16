# 專案基礎設定（與玩法無關）

> 建立：2026-10-16（Unity 技術負責人 session）。Unity 6000.3.11f1、URP 2D、目標 Windows x64 Steam（之後考慮 Steam Deck）。
> 標記說明：**暫定** = 之後可能改；**待決定** = 需要另外拍板；**未驗證** = 還沒實際跑過確認。

## 1. Player Settings

| 項目 | 值 | 理由 / 備註 |
|---|---|---|
| Company Name | `ClaudeGame Studio` | **暫定**。注意：會影響存檔路徑 `%USERPROFILE%/AppData/LocalLow/<Company>/<Product>`，上架前定案後就不要再改（否則玩家存檔與 Steam Auto-Cloud 路徑會斷） |
| Product Name | `ClaudeGame` | **暫定**，遊戲名稱定案後改 |
| Version (bundleVersion) | `0.1.0` | 之後由 build 腳本從 `git describe` 寫入 |
| Default Screen | 1920×1080，`defaultIsNativeResolution = true` | 全螢幕時用顯示器原生解析度（Steam Deck 1280×800 才不會被縮放）；1920×1080 只在視窗模式時當預設 |
| Fullscreen Mode | Fullscreen Window（無邊框） | PC 慣例、Alt-Tab 友善；Exclusive 不必要 |
| Resizable Window | 開 | 視窗模式可拖曳大小，CameraFit / Canvas Scaler 會處理任何比例 |
| Allow Fullscreen Switch | 開 | Alt+Enter |
| Run In Background | 開 | 避免失焦時暫停造成音樂/計時中斷；之後可在設定加「失焦時暫停」選項 |
| Splash Screen | 關（Show Splash / Unity Logo 都關） | Unity 6 Personal 允許關閉，已實際設定成功 |
| Color Space | Linear | URP 預設，顏色混合正確 |
| Scripting Backend | IL2CPP | 效能較好、較難反編譯。**需要 Visual Studio 的「使用 C++ 的桌面開發」工作負載才能 build（未驗證是否已安裝）** |
| API Compatibility | .NET Standard 2.1（Unity 列舉值 `NET_Standard`=6；舊名 `NET_Standard_2_0` 同值） | 體積小、跨平台 |
| 架構 | x86_64（Windows `UserBuildSettings.architecture = x64`） | Steam Windows 主流；Steam Deck 經 Proton 跑 Windows build |
| Active Input Handling | Input System Package (New) only | 範本已是這個值（`activeInputHandler=1`）；舊 Input Manager 不用 |
| Graphics APIs (Win64) | Direct3D11, Direct3D12（關閉自動） | D3D11 優先：舊顯卡與 Proton/DXVK 相容性最穩；D3D12 作備援。**暫定**，可在 Steam Deck 實測後調整 |
| Aspect Ratio 勾選 | 不適用 | Unity 6 已移除此功能（API 標為 obsolete，所有比例都支援），比例改由 CameraFit 處理 |
| Build Target | Standalone Windows 64（原本就是，不需切換） | |

「關閉不需要的平台設定」：此專案只裝 Windows Standalone 模組，Build Profiles 只有 Windows；沒有其他平台設定需要關。**待決定**：範本附帶的 `com.unity.visualscripting`、`com.unity.multiplayer.center`、`com.unity.collab-proxy`（Plastic SCM，我們用 git）可在之後移除以縮短編譯時間；這次沒動，避免影響其他職能。

## 2. Quality / Graphics

- Quality 等級從 6 個縮成 3 個：`Low(0) / Medium(1) / High(2)`，全部 **VSync = 1**（Every V Blank）。Standalone 預設 High，Android/iOS 殘留項設 Low（不會用到）。
- 三個等級目前共用同一個 URP 資產 `Assets/_Project/Settings/UniversalRP.asset`，實際差異**待決定**（等美術方向：可能是 render scale、後處理、粒子數量）。
- GraphicsSettings 的 Default Render Pipeline 原本是空的（只有 Quality 有指定），已補上 `UniversalRP.asset`；其 Renderer List 只有 `Renderer2D.asset`（Renderer2DData），確認是 URP 2D Renderer。
- 幀率：VSync 開時 `Application.targetFrameRate = -1`（桌面平台 VSync 下 Unity 忽略 targetFrameRate）；VSync 關時由 `GameBootstrap.ApplyFramePacing()` 設成 max(60, 螢幕更新率)。之後設定選單要能切 VSync 與上限。

## 3. 目錄與組件（Assembly Definitions）

```
Assets/
  _Project/                       自有內容（第三方一律放外面）
    Scripts/
      Core/   ClaudeGame.Core     noEngineReferences=true、autoReferenced=false：純 C#，可 EditMode 測、可給 dotnet 主控台用
      Game/   ClaudeGame.Game     refs Core, Unity.InputSystem, URP Runtime：MonoBehaviour 層（GameBootstrap, CameraFit）
      UI/     ClaudeGame.UI       refs Core, Game, UnityEngine.UI, Unity.TextMeshPro, Unity.InputSystem
      Editor/ ClaudeGame.Editor   Editor-only：產生器、build 腳本（BootSceneBuilder）
    Tests/EditMode/ ClaudeGame.Tests.EditMode   refs Core + nunit，UNITY_INCLUDE_TESTS
    Scenes/ Boot.unity
    Settings/  UniversalRP, Renderer2D, URP Global Settings, DefaultVolumeProfile, scene template
    Input/     InputSystem_Actions.inputactions（範本附的，仍是 project-wide actions）
    Art/ Audio/ Data/ Fonts/ Prefabs/   （目前空，各放 .gitkeep）
  TextMesh Pro/                   TMP Essential Resources（第三方，Unity 匯入）
```

- 命名空間 `ClaudeGame.*` 跟著暫定產品名；改名時**不一定**要改命名空間（玩家看不到），可以留著。
- `unity-architecture` skill 裡的目錄（`Game/`、`PourDecisions.Sim/Run/...`）是舊玩法的規劃：實際 Unity 專案資料夾是 `ClaudeGame/`；玩法重新設計後再依新玩法在 Core 下細分（例如 Sim/Rules），保留「規則層純 C#、單向依賴」原則。
- 範例測試 `AspectFitTests`（6 個）用 `run_tests` 驗證全過。

## 4. Boot 場景

`Assets/_Project/Scenes/Boot.unity`，Build index 0，是目前唯一的 build 場景（SampleScene 已刪除）。
**由 `ClaudeGame.EditorTools.BootSceneBuilder.Build()` 產生**（選單 `ClaudeGame/Rebuild Boot Scene`，或 eval 呼叫），冪等可重跑。不要手改場景，改產生器再重跑。

| 物件 | 內容 |
|---|---|
| GameRoot | `GameBootstrap`（`DefaultExecutionOrder(-1000)`、DontDestroyOnLoad、單例；設定幀率、Log 版本/平台/解析度/品質） |
| Main Camera | Orthographic，背景 `#1A1B1D`（深色中性），URP `UniversalAdditionalCameraData`（後處理關），`CameraFit` |
| UICanvas | Screen Space - Overlay；Canvas Scaler = Scale With Screen Size、Reference 1920×1080、Match 0.5；GraphicRaycaster |
| UICanvas/BootStatus | TextMeshProUGUI「Boot OK」＋版本號（`BootStatusText`，暫時用，主選單出現後刪） |
| EventSystem | `InputSystemUIInputModule`（AssignDefaultActions） |

### CameraFit（不依賴 Pixel Perfect）
- 參考世界區域 **19.2 × 10.8 單位（16:9；1080p 下 1 單位 = 100 px）**，**暫定**，等美術定 PPU 後調整。
- 數學在 `ClaudeGame.Core.AspectFit`（純 C#、有測試），MonoBehaviour 只負責套用。
- `FitMode.Expand`（預設）：參考區域永遠完整顯示，多出的地方顯示更多背景/世界（16:10 上下多、21:9 左右多）。遊戲重要內容必須放在參考區域內＝安全區。
- `FitMode.Letterbox`：camera viewport 縮成 16:9 置中，外圍由一個自動生成的 `LetterboxBars` 相機（cullingMask=0）清成黑色。
- 實測（play mode）：1920×1080 → ortho 5.4；1280×800 → ortho 6.0、可見寬正好 19.2；2560×1080 Letterbox → viewport x=0.125、w=0.75，左右黑邊正確。
- 注意：Overlay Canvas 不受 camera viewport 影響，21:9 時 UI 會延伸到全寬（Match 0.5）。如果要 UI 也限制在 16:9 內，之後加 SafeArea/AspectContainer 元件。**待決定**。
- **待決定：Pixel Perfect**。美術風格未定，所以先不用 Pixel Perfect Camera；若之後選像素風，改用 `PixelPerfectCamera`（URP 2D 內建）並把 CameraFit 換成 PPC 的 crop/stretch 設定，參考 `unity:2d-pixel-perfect` skill。

### 截圖觀察（Editor play mode，capture_game_view）
- 1920×1080：深灰背景正中央「Boot OK」＋「v0.1.0」，字清楚，無錯誤。
- 2560×1080（Letterbox）：左右各 12.5% 黑邊，字置中。1280×800（Expand）：全畫面背景、字置中。
- Console：只有 `[Boot] ClaudeGame v0.1.0 | Unity 6000.3.11f1 | WindowsEditor | Direct3D12 | ... vSync=1`，0 error / 0 warning。（Editor 用 D3D12 是編輯器自己的設定，不影響 player 的 API 順序。）
- 小技巧：Editor 的 Game view 原本是很小的自訂尺寸（90×160）；截圖前用 `UnityEditor.PlayModeWindow.SetCustomRenderingResolution(w, h, name)` 設好解析度。

## 5. 字型
- 目前用 TMP 預設 `LiberationSans SDF`（OFL，TMP Essential Resources，已匯入 `Assets/TextMesh Pro/`）。
- **待決定：CJK 字型**。預計 Noto Sans TC/SC/JP/KR（OFL）做 TMP fallback，static atlas 由 editor 腳本從字串表收集字元產生 + dynamic fallback 防漏字；參考 `unity:optimize-text-mesh-pro`、`unity:localization`。素材授權要記到 `docs/art/ASSET_LICENSES.md`。

## 6. 之後要回頭決定 / 處理的事
1. **Pixel Perfect 與否**、參考世界尺寸與 PPU（等美術方向）。
2. **CJK 字型**與在地化套件（`com.unity.localization`）。
3. **Steamworks.NET**（UPM git URL，包在 `IPlatformServices` 後；需要 HSU 的 Steam App ID，`steam_appid.txt` 只放開發環境）。
4. **Steam Deck 實測**：1280×800、手把操作、字高 ≥ 12px（1280×800 下）、D3D11/D3D12 經 Proton 的表現。
5. IL2CPP build 實測（需 VS C++ 工具）與 `BuildScript`（Editor 組件）+ 版本號自動化。
6. Quality 三級的實際差異、設定選單（解析度/全螢幕/VSync/幀率上限）。
7. 移除範本附帶但用不到的套件（visualscripting、multiplayer.center、collab-proxy）。
8. 公司名/產品名定案（影響存檔路徑與 Steam Auto-Cloud 設定）。
9. 21:9 時 UI 是否也限制在 16:9 安全區。
10. PlayMode smoke test（載入 Boot 跑 N 幀無 error）。
