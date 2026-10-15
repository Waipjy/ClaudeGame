# 交接檔（最新狀態寫在最上面）

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
