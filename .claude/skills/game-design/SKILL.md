---
name: game-design
description: 設計或修改 Pour Decisions 的規則、材料（vial）、催化劑（catalyst）、計分公式、目標分數曲線、商店經濟、難度階梯、教學，或要跑平衡模擬、審查新卡/遺物時使用。
---

# Game Design — Pour Decisions（落沙模擬 × Roguelike Deckbuilder）

先讀 `docs/design/00_concepts.md`、`docs/research/02_competitor_patterns.md`。本 skill 只給可執行的規則；數學與模擬細節在 `references/`：
- `references/scoring-math.md`：chips × mult 公式、加法/乘法疊加、目標曲線範本、Balatro 實際數字
- `references/balance-sim.md`：Monte Carlo 平衡模擬架構、bot 等級、指標、強勢策略偵測、報告格式
- `references/content-archetypes.md`：本作的協同原型（archetype）草案、稀有度配額、催化劑範例

---

## 0. 五條最高原則（衝突時以此為準）

1. **模擬必須完全決定性（deterministic）**：同 seed、同倒料位置 → 同結果，逐像素一致。沒有決定性就沒有技巧，也沒法做平衡模擬、重播、預覽。
2. **每個反應都要「看得見、數得出來」**：反應發生的位置跳數字、類型有固定顏色與音效；玩家輸了要說得出為什麼（Roguebook：玩家不懂自己怎麼輸的就會棄坑）。
3. **深度來自組合，不來自規則數量**：規則表面極少（BotW chemistry engine：元素改變材料、元素改變元素、材料不改變材料），深度來自 100–200 個物件的交互。
4. **每個物件都有獨特用途，而不是等強**（Slay the Spire GDC 2019）：強到扭曲策略又容易湊齊的效果要限制；強但難湊、要主動追的 combo 可以存在——單機遊戲允許玩家偶爾「壞掉」。
5. **數據定方向，試玩定手感**：自動模擬抓數值問題，人類試玩判斷好不好玩（Noita：技術指標容易驗證，「好不好玩」只能靠試玩）。

---

## 1. 核心循環與回合結構

```
回合（Round）：抽手牌（vials）→ 選 1 瓶 + 選倒料位置/角度 → 模擬跑到靜止（settle）或達上限 tick
           → 本次倒料的反應計分 → 累積到本回合分數 → 倒料次數用完 → 比對目標分數
回合間：商店（vial / catalyst / 升級 / 燒杯改造）→ 下一回合
一局（Run）：8 個「實驗」（Ante）× 3 回合（小/大/Boss）= 24 回合
```

- **以 settle 為單位計分**，不靠即時反應速度——避開 AI 團隊弱項（手感），也讓結果可預測。
- settle 上限：模擬 tick 上限（例：600 tick），畫面上最多播 4–6 秒，可快轉 ×2/×4；之後強制結算。
- 燒杯狀態**跨倒料保留**（同一回合內），回合結束是否清空是設計旋鈕：保留 = 長期規劃深度，清空 = 可讀性。原型先清空，再測保留版。
- Boss 回合 = 一條規則改寫（如「水會結冰」「重力反向一次」），對應 Balatro Boss Blind；必須在回合開始前公告。

## 2. 計分設計（chips × mult）

公式（顯示順序 = 計算順序，玩家可跟著算）：
```
本次倒料分數 = (Σ 反應 chips + 加值 chips) × (基礎 mult + Σ +mult) × Π(×mult)
```
- **chips**：每次反應的基礎分（依反應類型與反應量，量要做對數或分段，避免「倒越多越好」）。
- **+mult**：來自「變化」——本次出現的不同反應類型數、連鎖深度（反應觸發反應）。
- **×mult**：只來自稀有催化劑或特殊條件。**×mult 是最強的貨幣，發放要最吝嗇。**
- 結算動畫依序播：反應逐一跳 chips → mult 累加 → ×mult 逐個乘（Balatro 式 tally），大數字放慢、加震動。

規則：
- 加法 vs 乘法：n 個 +mult 物件線性成長；k 個 ×1.5 物件是 1.5^k。早期以加法為主、後期轉乘法，是自然的 build 弧線——讓 common 給加法、rare 給乘法。
- 加法的邊際價值遞減（+4 mult 在 base 20 上是 +20%，在 base 100 上只 +4%），這讓「何時轉乘法」成為玩家決策。好事，保留它。
- 分數 > 1e6 起用千分位縮寫，> 1e11 用科學記號；內部用 `double`，Endless 用 log 空間或 BigNumber。
- 詳細公式、範例數字：`references/scoring-math.md`。

## 3. 目標分數曲線

- Balatro 白注（ante 1–8）：300 / 800 / 2,000 / 5,000 / 11,000 / 20,000 / 35,000 / 50,000；小/大/Boss = ×1 / ×1.5 / ×2。每 ante 倍率由 ×2.7 逐漸降到 ×1.4——因為玩家戰力早期增長快、後期趨緩。
- 本作做法：**不要拍腦袋定曲線**。用平衡模擬的「稱職 bot（greedy）」跑 1,000+ 局，取每個 ante 的分數中位數 M(a)，目標 T(a) = M(a) × k(a)，k 由早期 0.5（寬鬆）逐步升到後期 0.9（緊）。
- 目標：白注下稱職 bot 勝率 30–50%、強 bot 80–95%、隨機 bot < 5%。人類第一勝落在第 3–8 局。
- Endless：ante 9 之後超指數成長（Balatro 約 x^(x²) 量級），讓 build 終究會崩，給「我撐到第幾關」的分享點。

## 4. 材料（vial）與催化劑（catalyst）設計

- 材料是「牌」：每瓶 = 一種材料 + 份量（像素數）+ 可能的修飾（溫度、純度、附魔）。
- 催化劑是「小丑/遺物」：被動、常駐、改寫化學或計分規則。上限槽位（例：5）讓玩家必須取捨。
- 物件角色分類（每個新物件必須標一個主要角色）：
  - **Enabler（啟動器）**：讓某原型成立（「油會在火中產生額外火焰」）
  - **Payoff（收益）**：原型成立後給分（「每次燃燒反應 +3 mult」）
  - **Bridge（橋接）**：連接兩個原型（「蒸氣也算燃燒反應」）——讓 build 不只單線
  - **Economy（經濟）**：錢、折扣、額外商店欄
  - **Scaling（成長）**：越用越強（「每回合結束，若有 ≥3 種反應，此催化劑 +1 mult 永久」）
  - **Utility/Consistency（穩定）**：手牌操作、重抽、預覽、燒杯清理
- **build-defining vs filler**：rare 槽主要放 build-defining（改寫規則，讓玩家「轉向」）；common 放 filler（數字、穩定）但每個 filler 仍要有一個明確的「什麼時候選它」。
- 稀有度（起點，之後由模擬調）：Common 70% / Uncommon 25% / Rare 5%（Balatro 權重）；Legendary 不在商店出，只由特殊事件取得。
- **Buff enabler，不要 buff 完成的引擎**（Luck be a Landlord 1.1）：弱原型要先補「入門件」，讓玩家早期敢投入；並提供「逃生門」——原型失敗時能轉向的物件。
- 不要在開局強制給 buff 件，會造成視野狹窄（tunnel vision）。
- 原型與稀有度配額表：`references/content-archetypes.md`。

## 5. 商店經濟與 reroll

起點數值（Balatro 基準，之後由模擬調）：
- 每回合收入：過關固定 $3–5 + 剩餘倒料次數 × $1 + 利息（每持有 $5 給 $1，上限 $5，**未驗證**為 Balatro 精確值）。利息制造「存錢 vs 花錢」張力，保留。
- 價格帶：Common $2–5、Uncommon $5–8、Rare $8–10；販售價 = 購價 ÷ 2 無條件捨去，最少 $1。
- Reroll：起價 $5，每次 +$1，進新商店重置。（Balatro 規則）
- 商店欄位：2 個物件 + 1–2 包「材料包」（選 1 of 3）+ 1 個升級（voucher 類，$10，永久改規則）。
- 經濟健康檢查（模擬輸出）：
  - 稱職 bot 每個商店平均可買 1–2 件；連續 3 個商店買不起任何東西 = 經濟太緊。
  - 經濟類物件的勝率貢獻不應高於收益類物件——否則「先刷錢」會變成唯一解。
  - reroll 次數分佈：中位數 1–2 次；若 bot 最佳策略是每店 reroll ≥5 次，代表 reroll 太便宜或欄位太差。

## 6. 局長與節奏（目標 30–60 分鐘）

- 預算：24 回合 × (3–4 次倒料 × 15–25 秒 + 商店 30–60 秒) ≈ 35–50 分鐘。量測後調倒料次數，不調 settle 速度。
- 每 3 回合（一個 ante）要有一個「新東西」：Boss 規則、商店新稀有度解禁、新材料出現。
- 前 3 回合必須在 6 分鐘內完成：新手判斷「好不好玩」的窗口很短（Peglin Demo 中位遊玩 67 分鐘可作為 Demo 整體的參考值）。
- 失敗要早：失敗的局應在 ante 2–4 結束而不是 ante 7，避免「打 40 分鐘才知道 build 不行」。

## 7. 難度階梯（Stakes / Ascension）

- 8–10 階，**累加制**，每階只加一條規則（Slay the Spire Ascension 20、Balatro 8 個 Stake 都是累加）。
- 本作候選（由易到難）：目標 ×1.2 → 剩餘倒料不給錢 → 商店少一欄 → 燒杯開局有污染像素 → 材料份量 -10% → 稀有催化劑機率減半 → Boss 規則兩條 → 目標成長曲線換成 Purple 等級。
- 難度階梯也是數據工具：不同層級的勝率給出更細的平衡資訊（Slay the Spire GDC）。
- 每階解鎖以「在前一階贏一次」為條件；顯示在選單上，讓玩家有長期目標。

## 8. Meta-progression（不 pay-to-win）

- 永久進度以**橫向解鎖**為主：新材料、新催化劑、新燒杯形狀、新起始牌組、圖鑑。不要永久數值加成（例：「所有火 +5%」）。
- 解鎖順序設計成教學：先只開放 2–3 個原型，玩幾局後再開放更複雜的（Roguebook：用進度把複雜機制延後）。
- 每一局（就算輸）都應該解鎖或推進一點東西（Ball x Pit「尊重玩家時間」：幾乎每局都有新藍圖）。
- 提供「全解鎖」選項給老玩家/實況主（Balatro 也加了），代價是該存檔不計成就。
- 任何付費 DLC 都只能是內容（新材料包），不能是力量。

## 9. 讓混亂模擬讀起來像技巧

1. **決定性**：固定 timestep、整數或定點數、固定更新順序（由下往上；左右掃描方向用 tick 奇偶決定，不用 RNG）、所有隨機都從 run seed 派生的 PRNG 取。對同一輸入跑兩次比對 hash，納入 CI 測試。
2. **預覽**：倒料前顯示落點軌跡與「會碰到哪些材料」的圖示；因為決定性，可在背景複本模擬前 N tick 做「預測反應圖示」。完整分數預覽留給催化劑/道具（「試管鏡」）當資源，不要白給。
3. **反應詞彙表固定且少**：每種反應一個顏色 + 圖示 + 音高；同類反應聚合成一個彈出數字（「燃燒 ×37 → +185」），不要每像素跳字。
4. **因果線**：連鎖反應用細線或閃光連起「誰觸發誰」，連鎖深度用大字顯示（×2、×3…），這也是剪片高潮點。
5. **變異度控制**：倒料位置差異要顯著影響分數，但同位置的結果要穩定。量測「技巧差距」= 最佳位置 bot 分數 ÷ 隨機位置 bot 分數，目標 ≥ 2；< 1.3 代表擺位置沒意義。
6. **只模擬玩家會看見的東西**：Noita 發現苔蘚生長、慢速融化等細微效果沒人注意；資源投在會改變分數或畫面的反應上。
7. **模擬會妨礙玩法時，玩法優先**（Noita）：可以作弊（如反應只在倒料後 X tick 內計分、粒子數上限）。

## 10. FTUE / 教學（系統型遊戲）

- 第一局用固定 seed 與固定手牌：第 1 倒 = 沙（學倒料），第 2 倒 = 水（學反應：沙+水→泥），第 3 倒 = 火遇油（學連鎖與 mult）。每倒只教一件事。
- 用燒杯教，不用文字教：文字量少也降低 10+ 語言的翻譯成本與 AI 文本揭露負擔。
- 「反應圖鑑」（codex）：第一次發生的反應自動記錄並短暫高亮，玩家自己發現 = 樂趣（Roguebook：發現協同是核心樂趣）。
- 每個 vial/催化劑 tooltip 都有「會與 X 反應」的圖示列，不靠文字。
- 催化劑與商店從第 2 回合才開；Boss 從 ante 1 結尾開。
- 第一局可以贏，但進度不依賴第一局贏。

## 11. 試玩方法與指標

- 方法：盲測（不解說）→ 前 15 分鐘 think-aloud → 之後安靜觀察 → 結束後問 3 題：「你怎麼輸的？」「最爽的一刻？」「哪裡看不懂？」。錄影。
- 對 HSU 試玩：每次只驗證 1–2 個假設，事先寫在 `docs/design/playtests/YYYY-MM-DD.md`。
- 必收指標（遙測寫本機 JSON，試玩版開啟）：
  - 首次反應時間、首次理解 ×mult 的時間（看是否主動追乘法）
  - 每局死亡 ante 分佈、局長、每回合時長
  - **自願開第二局比例**（最重要的單一指標）
  - 「為什麼輸」回答正確率（可讀性指標，目標 ≥ 70%）
  - 物件被看 tooltip 次數 vs 被購買次數（看不懂 vs 不想要）
- 事件格式：`run_start / pour{vial,x,angle,reactions[],score} / shop{offered[],bought[],rerolls} / run_end{ante,cause,build[]}`。
- 小心「超級試玩者」偏差：最熟的人的數據不代表一般玩家（Slay the Spire GDC）。

## 12. 平衡模擬（摘要；細節見 references/balance-sim.md）

- 平衡模擬跑在 `sim/`（Python 或 headless C# 同一套規則表），**規則資料（材料、反應、催化劑）用同一份 JSON/CSV**，Unity 與 sim 共用，避免兩邊漂移。
- Bot 等級：Random / Greedy（每步選期望分數最高）/ Lookahead（MCTS 或 beam search 選倒料+購買）。
- 每次改數值至少跑 1,000 局 × 每個 bot；報告存 `docs/design/balance/YYYY-MM-DD_<主題>.md`。
- 強勢策略警報：
  - 單一物件「被拿時勝率 − 基準勝率」> +10 個百分點
  - 單一原型佔勝場 > 40%（目標：前 5 原型都在 10–30% 之間）
  - 某物件在 greedy bot 中出現時拿取率 < 3% → 死卡
  - 強 bot 在白注勝率 > 98% → 整體太簡單
- 模擬找到怪策略 = 訊號，先查是不是 bug（Google 研究：agent 的怪行為常揭露真實調參錯誤）。
- 修正時優先調數字（成本、稀有度、加成值），其次改條件，最後才重做（LocalThunk：大部分修正都是數字）。

## 13. 新 vial / 催化劑 審查清單

提交任何新物件前逐項勾選，寫進物件的資料表備註：
- [ ] 一句話說得出它的用途與「什麼時候選它」
- [ ] 標了主要角色（Enabler/Payoff/Bridge/Economy/Scaling/Utility）與所屬原型
- [ ] 效果可用 ≤ 15 個英文字或 1 行圖示表達；不需要新關鍵字，或新關鍵字會被 ≥ 3 個物件共用
- [ ] 效果是「看得見的」：觸發時畫面有回饋（彈字/閃光/音效）
- [ ] 決定性：沒有引入未經 seed 的隨機；不依賴 frame rate
- [ ] 計分層級正確：common 不給 ×mult；給 ×mult 者為 rare+ 或有難湊條件
- [ ] 與現有最強 3 個物件組合跑過模擬，沒有出現 > 10× 的分數暴衝（或暴衝是刻意且難湊的）
- [ ] 不讓任何現有物件變成無用（cannibalize）——查同原型其他物件的拿取率前後變化
- [ ] 弱勢情況有出路：拿了它但原型沒成，至少還能當 filler 或賣掉
- [ ] 價格與稀有度跟同角色物件一致
- [ ] 文字已進在地化表（key），長度在德文/俄文膨脹 +35% 後仍放得下
- [ ] 效能：觸發時最壞情況像素量下仍維持目標 FPS
- [ ] 跑過 1,000 局模擬：拿取率 5–40%、勝率差在 ±10pp 內（除非是刻意的 build-defining rare）

---

## Sources
- Slay the Spire 數據驅動平衡（GDC 2019）：https://www.gdcvault.com/play/1025731 ・ https://glasp.co/youtube/7rqfbvnO_H0 ・ https://podwise.ai/episodes/1459444
- Balatro 設計訪談：https://rogueliker.com/balatro-interview/ ・ https://toucharcade.com/2024/03/18/balatro-interview-mobile-port-localthunk-dlc-plans-updates-new-jokers-demo-feedback/
- Balatro 數值（盲注、商店）：https://balatrowiki.org/w/Blinds_and_Antes ・ https://balatrowiki.org/w/Shop
- Luck be a Landlord 1.1 平衡筆記：https://blog.trampolinetales.com/the-big-buffs-update-preview/
- Ball x Pit「尊重玩家時間」：https://automaton-media.com/articles/newsjp/ball-pit-20251217-375231/
- Peglin 數據：https://howtomarketagame.com/2022/05/04/how-peglin-made-1049413-in-1-week/
- Roguebook 構築設計：https://www.gamedeveloper.com/design/tackling-deckbuilding-design-in-abrakam-s-roguebook
- Noita 落沙設計與技術：https://www.gamedeveloper.com/game-platforms/road-to-the-igf-nolla-games-i-noita-i- ・ https://80.lv/articles/noita-a-game-based-on-falling-sand-simulation/
- BotW chemistry engine（GDC 2017）：https://www.thumbsticks.com/gdc-17-breath-of-the-wild-science-lies
- AI agent 自動測試平衡（Google）：https://ar5iv.arxiv.org/html/1811.06962
