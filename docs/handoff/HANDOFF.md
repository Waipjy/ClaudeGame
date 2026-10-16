# 交接檔（最新狀態寫在最上面）

## 2026-10-16 GDD v1（遊戲設計子代理）— 以 Pour Decisions 為基礎
- 產出 `docs/design/GDD_v1.md`。新鉤子：「把一杯泥巴煉成黃金——用真的會燒、會凝、會爆的物質。」玩家是 17 世紀煉金術士，一局 = 大業四階段（黑化→白化→黃化→紅化）× 3 回合。
- 計分改為「物質 × 元素（火水土氣點亮數＋連鎖）× 秘方」；分數化成金砂流進受器，金線＝目標。
- 連續流動：取消 settling；每格帶 src／gen 來源標記，反應記在最新一倒，帳本卡逐帳結算，就地聚合飄字與連鎖線。
- 新動詞 MVP：火柴（點火時機）、蓋蓋子（壓力爆蓋）。新材料 MVP：硫磺。
- 美術推薦：煉金術手稿銅版畫＋手工上色（Atalanta Fugiens 等公有領域作品；Obra Dinn／Potion Craft 為遊戲參考），淘汰霓虹 CRT。
- **下一步**：實作代理照 GDD §8 做 v0.2（8 項，第 8 項刻線渲染為選做），再交給 HSU 試玩 3 題。


## 2026-10-16 核心重新設計 v2（遊戲設計子代理）
- 產出 `docs/design/01_concept_v2.md`：v1 診斷、三個新方向（A 熔岩村／B 淘金槽／C 野火線）、Steam 競品查核（含評論數與 URL）、評分矩陣。
- **推薦 B 淘金槽**（4.40）：側視水流淘金槽，粒子依密度分選，金子是全畫面唯一的顏色，分數＝被留住的金子，流失當場彈紅字；19 世紀刻版畫＋Obra Dinn 式 1-bit 風格。A 熔岩村（3.95）為備案；C 野火線（3.80）競品在 2026–27 年突增，不建議。
- 狀態：**提案，待主 session／HSU 拍板**（已在 DECISIONS.md 加「異議／提案」條目）。暫名 Paydirt 已被他人使用，需改名。
- 下一步：拍板後做 2–3 天瀏覽器原型，第 1 天只做 `sluice_sim.js`＋bot 驗證 H1（最佳／隨機回收率 ≥2×）；H1 不過就轉做 A。


## 2026-10-16 16:00 基礎設施打通
- Unity 專案 `ClaudeGame/`（6000.3.11f1、URP 2D、com.unity.pipeline）已推上 GitHub。
- Unity MCP 已接進雲端 session；用 `eval` 在 HSU 電腦跑 git，已驗證 pull/commit/push 全部可用。規則見 `docs/tech/PC_BRIDGE.md`。
- 曾因 git 沒關互動提示讓 Unity 卡死一次，已寫入規則。
- 下一步：依 HSU 試玩回饋重新設計核心（見下方回饋），主 session 只負責溝通與決策，實作交給子代理。


## 2026-10-16 15:10 HSU 試玩回饋（原型 v0.1）
- 定位被看成「小丑牌數值 roguelike + 落沙俄羅斯方塊消除」，**缺乏創新、遊戲性、行銷價值**；實際呈現還行。→ 下一版要重想核心鉤子，不能只是換皮組合。
- **最大問題：看不出分數怎麼來**。哪個操作拿幾分、為什麼得分，在介面上看不出來。→ 反應發生處要有就地分數飄字、即時計分過程、引導 UI。
- **回合節奏**：要嘛等粒子完全停止才進下一步，要嘛下一步時不停止粒子落下（增加操作性）。→ 傾向後者：連續流動、倒料可以疊加在還在動的燒杯上。
- 遊戲深度與創意設計要加強（原型階段不是大問題）。
- **美術 AI 感太強**，要往「真人設計」修改。
- 創意與架構全部由 Claude 自行發想修改，HSU 只指出問題。
- **優先順序**：先解決基礎設施（Unity 無法操作、.claude 無法寫入電腦），才繼續設計。


## 2026-10-16 06:40（session 1，第二段）
**階段**：0 企劃與驗證 — 等 HSU 試玩原型。

**已完成**
- 六個職能 skill：`.claude/skills/`（game-design、producer、art-direction、audio、unity-architecture、steam-marketing）。動工前先讀對應 skill。
- 瀏覽器灰盒原型 `prototype/web/`：
  - `sim.js` 落沙模擬核心（決定性、可 node 跑）；`template.html` 介面；`index.html` = template 內嵌 sim（用 python 替換 `/*SIM*/` 產生）。
  - `test_sim.js` 各組合計分測試；`bot.js` 第一回合隨機/啟發式機器人分數分佈。
  - 已發布 artifact：https://claude.ai/artifact/N1XXKpDss5yvo4H8ejCRry
- 目前數值：燒杯 80×64、每瓶 420 格、每回合 4 倒、手牌 4、8 回合目標 800→60000、倍率 = 這一倒出現的反應種類數。
- 已知：火星（EMBER）是會落下的火種，到時間變火焰；冰屑是粉末類。

**待 HSU 回饋的問題**
1. 「先佈置、再引爆」的節奏好不好玩？2. 看得懂為什麼得分嗎？3. 一回合的長度和難度？4. 最想要哪種材料或催化劑？

**下一步**
1. 依試玩回饋修原型（數值、可讀性、手感）。
2. 寫 GDD v1（docs/design/GDD.md），用 game-design skill。
3. 平衡模擬擴充到整局（含商店決策）。
4. 解決電腦命令列問題後，進 Unity。


## 2026-10-16 05:40（session 1）
**階段**：0 企劃與驗證。

**已完成**
- 三份研究報告（市場、競品、素材法規），見 `docs/research/`。
- 選題：落沙模擬 × 牌組構築 roguelite，暫名 Pour Decisions。理由與評分見 `docs/design/00_concepts.md`，決策見 `DECISIONS.md`。
- 專案規則 `CLAUDE.md`、任務板、決策紀錄。

**環境狀態**
- GitHub `Waipjy/ClaudeGame` 可推送。
- 使用者電腦：資料夾 `C:\Users\waipj\Documents\ClaudeGame` 已授權（只能透過 device_commit_files 寫入檔案）。**沒有命令列工具**，所以還不能操作 Unity CLI。Unity Hub 與編輯器 HSU 已打開。
- Blender MCP 已連線。

**下一步**
1. 完成瀏覽器原型 `prototype/web/`，發布成 artifact 給 HSU 試玩。
2. 派代理建立各職能 skill。
3. 解決命令列問題後，進入 Unity 建置。
