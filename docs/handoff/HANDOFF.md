# 交接檔（新 session 從這裡開始，只需讀本檔）

> 舊紀錄已移到 `HANDOFF_ARCHIVE.md`，需要追溯時才讀。

## 目前狀態（2026-10-17 05:00）
- **遊戲**：爆鍋煉金（暫名，Pour Decisions）— 落沙模擬 × 構築 roguelite，「把一杯泥巴煉成金」。
- **最新原型 v0.3a**：直屏、零文字、拖曳倒料預覽、無字教學。`prototype/web/`（`python3 build.py` 產生 index.html）。
  - 試玩頁（artifact，同一網址持續更新）：https://claude.ai/artifact/N1XXKpDss5yvo4H8ejCRry
  - 發布方式：把 index.html 去掉 doctype/html/head/body 標籤後，用 Artifact 工具帶 `url` 參數發布到上面網址。
- **設計文件**：`docs/design/DEPTH_v1.md`（構築與局外）、`docs/design/UI_NO_TEXT.md`（無字 UI 規範）、`GDD_v1.md`（舊，部分術語已廢）。
- **Unity**：專案已設定好 PC Steam（`docs/tech/PROJECT_SETUP.md`），尚無玩法。透過 Unity MCP 操作，電腦端 git 用 eval（規則 `docs/tech/PC_BRIDGE.md`）。

## 等待中
- **HSU 正在試玩 v0.3a，會給回饋**。新 session 第一步：收回饋 → 寫進下方「HSU 回饋」→ 依回饋規劃。

## 主 session 已知的 v0.3a 問題（還沒修）
- 手牌兩瓶沙圖示一模一樣；有一張卡圖示看不懂。
- 燒杯上方留白過多。
- 藍焰與燃燒圖示灰階下難分。
- 符文、商店圖示意義不明。
- 第 2 回合以後平衡、真機手感、音效未驗證。

## 下一步候選（依 HSU 回饋排序）
1. v0.3a 修正（上方問題＋HSU 回饋）。
2. v0.3b 構築版：`DEPTH_v1.md` §6（殘渣地層、杯格符文、瓶性、一局 4 幕×4 回合）。
3. 之後才移植 Unity（Unity 版動畫/質感約為原型 2–3 倍，但每次迭代較貴）。

## 工作方式（HSU 要求，務必遵守）
- **使用者體驗第一、自主迭代**：交付前自己試玩、截圖、找問題、修正至少一輪；只有大方向才問 HSU。
- **遊戲內不出現文字**（只留數字）；去 AI 感；原型用直屏。
- **省 token**：主 session 只負責溝通與決策，保持上下文短；實作交給子代理，照規格實作用 `model: sonnet`、設計判斷用 `opus`；子代理回報限 200 字；截圖只看關鍵 1–3 張；對話變長就請 HSU 開新對話。
- 一律用繁體中文回覆 HSU。

## HSU 回饋
（新 session 把 v0.3a 的試玩回饋寫在這裡）
