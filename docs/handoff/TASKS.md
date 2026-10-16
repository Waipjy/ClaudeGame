# 任務板

狀態：[ ] 未開始 ／ [~] 進行中 ／ [x] 完成 ／ [!] 卡住（寫原因）

## 階段 0：企劃與驗證（目前）
- [x] 市場研究 → docs/research/01_steam_market.md
- [x] 競品模式 → docs/research/02_competitor_patterns.md
- [x] 素材與法規 → docs/research/03_assets_legal.md
- [x] 候選概念評估、選題 → docs/design/00_concepts.md
- [x] 瀏覽器灰盒原型（核心循環）→ prototype/web/，已發布 artifact
- [~] 等 HSU 試玩回饋
- [x] 各職能知識包 skill（.claude/skills/）
- [ ] 平衡模擬原型（sim/，Python 離線跑材料×催化劑組合）
- [x] 根據試玩回饋寫 GDD v1 → docs/design/GDD_v1.md
- [x] v0.2 瀏覽器原型（GDD §8 八項，含刻線渲染）→ prototype/web/，自主試玩紀錄 docs/design/playtest_log_v02.md
- [ ] v0.2 發布 artifact 給 HSU 試玩（4 題見 docs/design/playtests/2026-10-16_v02.md）
- [ ] 整局 bot（含商店）調第 2 回合後金線與硫磺強度
- [ ] 範圍與排程（里程碑、上架時間表、Next Fest 目標）

## 階段 1：Unity 基礎建設
- [x] 取得在使用者電腦執行指令的能力 → Unity MCP eval，見 docs/tech/PC_BRIDGE.md
- [x] 安裝 Unity 6、建立專案 ClaudeGame/、加 Pipeline 套件、推上 GitHub
- [x] Player Settings（PC Steam：IL2CPP、.NET Std 2.1、Linear、Fullscreen Window、x64、新 Input System、splash 關）→ docs/tech/PROJECT_SETUP.md
- [x] Quality 縮成 Low/Medium/High（VSync 開）、確認 URP 2D Renderer、GraphicsSettings 補上預設 RP
- [x] Assets/_Project 目錄結構＋asmdef（Core 純 C#／Game／UI／Editor／Tests.EditMode），範例測試 6/6 通過
- [x] Boot.unity（build index 0，刪 SampleScene）：CameraFit（16:9 參考區，Expand/Letterbox）、Overlay Canvas 1920×1080 match 0.5、InputSystemUIInputModule、GameBootstrap；由 BootSceneBuilder 產生，16:9/16:10/21:9 截圖確認
- [ ] Pixel Perfect 與否、CJK 字型、Steamworks.NET、Steam Deck 實測、IL2CPP build 實測（見 PROJECT_SETUP.md §6）
- [ ] 落沙模擬核心（Burst/Jobs 或 Compute Shader）

## 階段 2 之後
- 待 GDD 定稿後展開。
