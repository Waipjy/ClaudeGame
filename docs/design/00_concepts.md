# 選題：候選概念與評估（2026-10-16）

依據：`docs/research/01_steam_market.md`、`02_competitor_patterns.md`、`03_assets_legal.md`，以及本次補充的競品查核（見文末來源）。

## 我的優勢與限制（選題的過濾器）
- 強：系統與規則設計、用自動模擬大量跑數值平衡、程序生成、shader/特效、模擬運算、多語言在地化。
- 弱：手繪角色、角色動畫、動作手感、主觀「好玩」直覺（需人類試玩）。
- 推論：玩法深度要來自規則交互；畫面要靠「模擬本身」或 shader 撐起來，而不是手繪資產；回合制或可暫停優先。

## 市場過濾器
- 表現好：Roguelike Deckbuilder（非殺戮尖塔複製）、Automation、Resource Management、Simulation。
- 避開：純 Puzzle 定位、Survivors-like、純換皮 Balatro-like、無深度的放置類。
- 成功公式：「熟悉的玩具 + roguelike 成長」，一句話講得清楚，有可剪成短影片的爆發瞬間，$6.99–9.99。

## 候選概念

### A. Pour Decisions（暫名，中文暫名《爆鍋煉金》）— 落沙模擬 × 牌組構築 roguelite
每回合從手牌選一瓶「材料」（沙、水、油、火、酸、熔岩、冰、火藥、種子、鹽……）倒進燒杯。燒杯是一個即時運算的落沙（cellular automaton）世界：水澆熄火變蒸氣、熔岩遇水凝成石頭、酸蝕穿金屬、火藥連鎖爆炸。每一個反應都計分，連鎖反應疊乘倍率。回合間在商店買新材料、「催化劑」（改寫化學規則的遺物）、升級反應等級、改造燒杯形狀。
- 鉤子：「Balatro，但你的牌是會真的起化學反應的材料。」
- 熟悉的玩具：化學實驗組、沙盒粉末遊戲（The Powder Toy 世代的共同記憶）。
- 可剪片段：一倒下去整杯連鎖爆炸、分數倍率狂飆。
- 美術：畫面幾乎全由模擬像素構成＋發光/CRT shader，手繪需求極低。
- 優勢契合：模擬、規則表、shader、可大量自動模擬平衡。

### B. Signal Box（號誌樓）— 鐵路調度 roguelite
在程序生成的路網上放號誌與轉轍器卡牌，列車一波波進站。CRT 綠色調度面板風格。
- 競品：Rail Route（調度模擬，評價好）；roguelite 化是新角度。
- 風險：容易被歸為 Puzzle；畫面張力弱，不易剪片。

### C. Lift Logic（電梯大腦）— 電梯排程 roguelite
組合規則卡當電梯演算法，應付尖峰時段的人潮。
- 查核：已有 Elegorithm（$5.99，4 則評論）、Elevator Programmer（3 則）、Lift Attendant（0 則）。題材本身沒有市場拉力的證據。

### D. 煙火編排 roguelite
編排引信與煙火彈組合，取悅觀眾。
- 查核：Starfire Skies（煙火牌組構築，2027 年）已佔此位；Fireworks Mania 證明煙火題材有吸引力（2,936 則評論，97%）。

### E. 骨牌連鎖 roguelite
- 查核：Dominova（$9.99，26 則評論）、Dominocalypse（2026/8）已在做，成績平平。

### F. 費洛蒙蟻群 roguelite
放置費洛蒙規則間接指揮蟻群。湧現行為好看，但蟻群題材已多，且「間接控制」新手難讀懂。

## 評分矩陣（1–5 分，權重加總 100）

| 準則（權重） | A 落沙煉金 | B 號誌樓 | C 電梯 | D 煙火 | E 骨牌 | F 蟻群 |
|---|---|---|---|---|---|---|
| 鉤子清晰、可剪片（20） | 5 | 3 | 3 | 5 | 4 | 4 |
| 契合 AI 優勢（20） | 5 | 4 | 5 | 4 | 3 | 4 |
| 美術可行（免費素材/程式）（15） | 5 | 4 | 4 | 5 | 4 | 3 |
| 類型市場表現（15） | 4 | 3 | 3 | 4 | 3 | 3 |
| 新穎、未飽和（15） | 5 | 4 | 2 | 2 | 2 | 3 |
| 範圍風險低（10） | 3 | 4 | 4 | 4 | 4 | 3 |
| 文字量少、好在地化（5） | 5 | 4 | 5 | 5 | 5 | 5 |
| **加權總分** | **4.65** | 3.65 | 3.60 | 4.10 | 3.40 | 3.50 |

## 結論
選 **A（落沙模擬 × 牌組構築 roguelite）** 進入原型驗證。

主要風險與驗證方式：
1. **可讀性/可預測性**：模擬太混亂會變成純運氣。→ 原型驗證：模擬完全決定性、回合制倒料、反應規則少而直觀。
2. **計分感**：反應要「看得見、數得出來」。→ 原型驗證：每個反應彈出分數，連鎖倍率即時累加。
3. **效能**：落沙模擬在大網格上的成本。→ 原型用小網格（約 160×120），Unity 版用 Burst/Compute。
4. **深度**：材料 × 催化劑的組合空間夠不夠大。→ 用離線模擬跑大量隨機組合看分數分佈。

下一步：做一個瀏覽器版灰盒原型（HTML/JS），只驗證核心循環「選材料 → 倒 → 反應計分 → 達標過關」是否好玩，交給 HSU 試玩。

## 來源（補充查核）
- Elegorithm: https://store.steampowered.com/app/4872150
- Elevator Programmer: https://store.steampowered.com/app/4115750/Elevator_Programmer/
- Lift Attendant: https://store.steampowered.com/app/3035940/Lift_Attendant/
- Starfire Skies: https://store.steampowered.com/app/2544040
- Fireworks Mania: https://store.steampowered.com/app/1079260
- Dominova: https://store.steampowered.com/app/3399130/Dominova/
- Dominocalypse: https://gamingonlinux.com/2026/08/dominocalypse-brings-some-clever-ideas-to-puzzle-roguelikes-with-dominoes
- Sandustry 10 萬套: https://gamingonlinux.com/2026/08/the-impressive-sandustry-already-hit-100k-sales-with-an-early-multiplayer-mod-out-now
- Rail Route: https://zaherha.itch.io/rail-route
- Falling-sand 類型: https://en.wikipedia.org/wiki/Falling-sand_game
