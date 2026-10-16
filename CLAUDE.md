# ClaudeGame — 專案工作規則（每個 session 開工前必讀）

這是一款由 Claude 自主開發、目標上架 Steam 並至少回本的商業遊戲。人類負責人：HSU（擁有者、試玩者、付款與帳號操作者）。

## 開工流程
1. 讀 `docs/handoff/HANDOFF.md`：目前階段、上一個 session 做到哪、下一步。
2. 讀 `docs/handoff/TASKS.md`：任務板，挑自己職能的項目。
3. 需要時讀 `docs/handoff/DECISIONS.md`：已拍板的決策與理由，**不要推翻已拍板的決策**，有異議就在該檔加「異議」條目並回報。
4. 依職能讀對應 skill（`.claude/skills/`）。

## 收工流程（每完成一個可交付的小段就做，不要等到最後）
1. 更新 `HANDOFF.md`（做了什麼、卡在哪、下一步具體指令）。
2. 更新 `TASKS.md` 勾選狀態。
3. 新決策寫進 `DECISIONS.md`（日期、決策、理由、替代方案）。
4. `git add -A && git commit && git push`。未推送的工作視同不存在。

## 硬性規則
- **獨立思考**：不讀取使用者其他對話或個人記憶來找創意（不呼叫 conversation_search / memory 讀取工具）。創意只來自本 repo 的研究與自己的推理。
- **零花費**：只用免費、可商用素材與工具。素材白名單見 `docs/research/03_assets_legal.md`，每個引入的素材都記錄在 `docs/art/ASSET_LICENSES.md`。
- **不用生成式 AI 美術/音樂**（避免 Steam 揭露帶來的負面效應）。程式繪製、程序生成、shader、CC0 素材都可以。
- **小步交付**：任何 session 可能隨時因額度中斷。一次只做一個可驗證的小目標，做完就提交。
- **不確定就寫下來**：猜測要標「假設」，研究數據沒驗證要標「未驗證」。

## 職能分工（各自的 skill 在 `.claude/skills/`）
| 職能 | 負責 | skill |
|---|---|---|
| 製作人/統籌 | 範圍、排程、決策、交接 | `producer` |
| 遊戲設計 | 規則、數值、關卡、平衡模擬 | `game-design` |
| 程式 | Unity C# 架構、系統、工具 | `unity-architecture` |
| 美術 | 視覺規範、素材處理、shader | `art-direction` |
| 音效 | SFX、音樂、混音 | `audio` |
| 行銷/上架 | 商店頁、試玩版、社群、在地化 | `steam-marketing` |

## 目錄
- `docs/research/` 市場、競品、法規研究
- `docs/design/` GDD、數值表、平衡模擬報告
- `docs/art/` 美術規範、素材授權清單
- `docs/tech/` 程式架構、命名規則
- `docs/audio/` 音效規範
- `docs/marketing/` 商店頁文案、行銷計畫
- `docs/handoff/` HANDOFF / TASKS / DECISIONS
- `sim/` 平衡模擬（Python，離線跑）
- `ClaudeGame/` Unity 專案（Unity 6000.3.11f1，Universal 2D 範本，已裝 com.unity.pipeline 0.8.0-exp.1）

## 環境
- 雲端工作區：`/home/claude/claudegame`（git clone），推送到 GitHub `Waipjy/ClaudeGame`。
- 使用者電腦（Windows）：`C:\Users\waipj\Documents\ClaudeGame` 是本 repo 的 git clone；Unity 專案在 `C:\Users\waipj\Documents\ClaudeGame\ClaudeGame`（注意：專案資料夾名稱是 ClaudeGame，不是 Game）。
- 雲端 session 透過桌面橋接讀寫一般檔案（不能寫 `.claude`、不能執行指令），透過 Unity MCP（`unity mcp`）操作編輯器。
