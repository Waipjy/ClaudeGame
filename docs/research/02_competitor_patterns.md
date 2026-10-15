# 02 競品模式研究：小團隊「系統驅動」Steam 成功作

> 研究日期：2026-10-16 ・ 方法：網路檢索（WebSearch / WebFetch），未使用任何記憶資料
> 標註規則：數字有網頁來源的直接寫；出自業界常識、推估或二手轉述而沒有找到原始來源的，一律標 **未驗證**。評論數變動很快，表中多數只是量級。
> 範圍：2019–2026 年，1–3 人（少數 4 人作為對照）團隊，賣點以規則和系統為主，不靠華麗美術或動作手感。

---

## 1. 遊戲總表

| # | 遊戲 | 團隊 | 開發時間 | 售價 (USD) | 銷量 / 評論量級 | 美術路線 | 核心鉤子（一句話） | 擴散管道 | 重玩性來源 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Balatro** (2024) | 1 人（LocalThunk）＋外包音樂 | 約 2.5 年（副業起步） | $14.99（未驗證） | 首月 >100 萬套，2025-01 >500 萬套；Steam 好評 >10 萬則 | 像素卡牌＋CRT/VHS 復古濾鏡與 shader 抖動，Love2D | 用撲克牌型打分數，再用小丑牌把乘數疊到天文數字 | Demo 先上又下架、帶新內容回歸；發行商 Playstack 安排大型實況主試玩 | 150 張小丑的組合、賭注等級、牌組種類 |
| 2 | **Luck be a Landlord** (2021 EA→2023) | 1 人（Dan DiIorio） | 多年（未驗證） | $9.99（未驗證） | 評論約 2 萬（未驗證） | 極簡像素符號＋emoji 風 | 每轉一次拉霸就加一個符號，要湊錢付越來越高的房租 | 作者自述「數百支 YouTube 影片」是主要銷售動力；手機版韓國營收佔 >20% | 符號協同、稀有度抽取 |
| 3 | **Dorfromantik** (2021 EA) | 4 人學生團隊（對照組） | Ludum Dare 原型→約 2 年 | $14.99（未驗證） | 未公布；EA 收入已回收補助；桌遊版 50 萬套 | 印象派風景色調的低多邊形六角磚 | 擺六角地磚、對齊邊緣得分，同時完成任務延長局數 | 被選進 itch.io 慈善組合包（共售出 >80 萬份）；德國獎項 | 隨機磚序、任務、解鎖新磚 |
| 4 | **Islanders** (2019) | 3 人 | 7 個月 | $4.99（未驗證） | 2019-04 進入 Steam 新品前 20 名 | 極簡低多邊形幾何、柔和配色 | 把建築放在其他建築旁就得分，分數夠了換新島 | Steam 推薦、評論口碑；Jonas Tyroller 的 YouTube 開發日誌 | 程序生成島嶼、建築包抽取 |
| 5 | **shapez** (2020) | 1 人（Tobias Springer） | 先做成免費網頁 .io 遊戲 | $3.99→$6.99 | 營收 >100 萬美元；中國佔 DLC 銷量 30% | 純向量幾何、色塊 | 「禪版 Factorio」：用輸送帶切、轉、上色抽象圖形 | itch 免費版導流、r/factorio 貼文、Giantwaffle 直播、Steam「類似 Factorio」推薦、每日特價 | 自建產線最佳化、沙盒 |
| 6 | **Peglin** (2022 EA) | 4 人，僅 1 人全職（對照組） | Steam 頁面早於上市 2 年 | $19.99 | 首週 80,204 套、約 105 萬美元 | 手繪像素小哥布林 | 「Peggle × Slay the Spire」 | 長期掛 Demo（中位遊玩 67 分鐘）、線上展會、實況主反覆報導 | 球（技能）收集、遺物、地圖分支 |
| 7 | **Backpack Hero** (2022 EA→2023) | 約 3 人（未驗證） | Kickstarter 起步，約 2 年（未驗證） | $19.99（未驗證） | 評論約 1 萬（未驗證） | 可愛像素 | 背包格子的擺放位置本身就是戰鬥配裝 | Kickstarter、日本媒體報導、背包類型的長尾效應 | 道具形狀×相鄰加成 |
| 8 | **Cobalt Core** (2023) | 2 位共同創辦人（Rocket Rat） | 先用 Tabletop Simulator 做原型；2023-10 Next Fest Demo | $19.99 | 約 13.2 萬套（VGI 估計）；4,405 則評論、96% 好評；Metacritic 94 | 動漫風像素角色＋清楚的 UI | 卡牌構築，但出牌會左右移動飛船去躲砲火 | Next Fest Demo、評論高分 | 3 名船員任意組合、時間迴圈劇情 |
| 9 | **Loop Hero** (2021) | 4 人（Four Quarters，對照組） | Ludum Dare 2019 原型；構想醞釀 5 年 | $14.99（未驗證） | 首週 50 萬套、>100 萬套 | 1980 年代 CGA 風低解析像素 | 英雄自動走圈，玩家用卡片布置路邊的世界 | Devolver 發行、實況、二創 | 地形卡協同、職業、營地建造 |
| 10 | **The Farmer Was Replaced** (2023 EA→2025) | 1 人（Timon Herzog）＋小發行商 Metaroot | 多年（前作 Assembly Planter, 2020） | $9.99（未驗證） | >40 萬套；約 2,210 則評論時已是「壓倒性好評」 | 簡單 3D 農場、無人機 | 用類 Python 語言寫程式讓無人機自動種田 | 自動化／放置類潮流；SteamDB 峰值 7,436 | 優化程式、解鎖新作物與指令 |
| 11 | **Rusty's Retirement** (2024) | 1 人（Jordan Morris） | 原型 2 週 | $7 | 約 33 萬套；每套淨收約 $5；$4 支持包 3.6 萬份 | 小巧可愛的立體模型感像素 | 一座只佔螢幕底部一條的放置農場，可邊工作邊玩 | 14 萬願望清單上市；Farming Fest；TikTok／IG Reels；Pirate Software 推薦；Twitch 觀眾可下田；11 種語言 | 自動化路線最佳化 |
| 12 | **Nodebuster** (2024) | 1 人（未驗證） | 未知 | 約 $4.99（未驗證） | 評論破萬（未驗證）；破關約 2–7 小時 | 霓虹幾何、閃爍特效 | 滑鼠掃過節點把它們打爆，換錢升級技能樹 | 短影片、低價衝動購買；已衍生出一整個「Nodebuster-like」子類型 | 少，主要靠技能樹和全成就 |
| 13 | **Dome Keeper** (2022) | 2 人（夫妻）＋外包音樂 | 原型約 6 個月業餘＋8 個月全職 | $17.99（未驗證） | 首週營收 >100 萬美元；>100 萬套 | 精緻像素（伴侶 Anne 負責） | 往地底挖礦，但每隔一段時間要趕回地面保衛圓頂 | Ludum Dare（278 則評分）→ #screenshotsaturday → Raw Fury 簽約；Demo 引來 Retromation、Splattercat 等實況主 | 圓頂和裝備組合、隨機地圖 |
| 14 | **Buckshot Roulette** (2023 itch→2024 Steam) | 1 人（Mike Klubnika） | 短期（未驗證） | $2.99（未驗證） | 2 週 100 萬套，2024 底 400 萬，後達 800 萬 | PS1 風低多邊形、暗沉夜店光影 | 和惡魔玩霰彈槍俄羅斯輪盤，用道具推算膛裡的實彈 | itch 免費版→Twitch／TikTok 爆紅→YouTube | 隨機彈序、道具、多人模式 |
| 15 | **Nubby's Number Factory** (2025) | 1 人（未驗證） | 未知 | 約 $5 | Steam 97%（上市時 100%）好評 | 刻意做出 90 年代共享軟體的醜萌風 | 彈珠台版 Balatro：讓分數惡性通膨，達標否則太陽爆炸 | 低價、迷因美術、日本媒體報導 | 道具協同、數字爆炸 |
| 16 | **Ball x Pit** (2025) | 1 人設計／程式（Kenny Sun）＋作曲；Devolver 發行 | 約 4 年（2021-11 起） | $14.99（未驗證） | 5 天 30 萬套，2025-12 >100 萬，1 年內約 200 萬 | 乾淨像素 | 打磚塊 × 吸血鬼倖存者式的升級 × 村莊建造 | Devolver、TGA 提名、多平台 | 球的融合進化、角色、建城 meta |
| 17 | **CloverPit** (2025) | 2 人（Panik Arcade）＋Future Friends 發行 | 開發週期短而集中 | 約 $9.99（未驗證） | 8 天 50 萬套、2 週 75 萬套、<2 個月 100 萬 | PS1 風恐怖小房間 | 用拉霸機還不斷上漲的債，還不出來就掉進活板門 | Triple-I Showcase、Demo 衝上 Steam 榜、Vinesauce 與 Northerlion 實況；延期避開 Silksong 的公告本身也爆紅 | 150+ 道具、拉霸機改造 |
| 18 | **Megabonk** (2025) | 1 人（Vedinad） | 未知 | $9.99（未驗證） | 2 週 100 萬套；同時在線峰值 11.7 萬 | 低多邊形 3D、迷因風 | 3D、強調垂直地形的倖存者類 | 開發者發迷因、和實況主互動；混亂的局面很適合剪片 | 程序生成地圖、build |
| 19 | **Schedule I** (2025 EA) | 1 人（TVGS） | 未知 | $19.99（未驗證） | 估 180–200 萬套（Gamalytic 估計）；約 2.8 萬則評論、96% 好評；同時在線峰值 41.4 萬 | 粗糙低多邊形 3D | 合作經營毒品事業，配方、產線、配送全要自己管 | 「好友爛遊戲」（friendslop）合作實況潮 | 配方組合、擴張經營、多人 |
| 20 | **Mewgenics** (2026) | 2 位核心（McMillen & Glaiel）＋社群挑選的協力者 | 約 14 年 | 約 $29.99（推估，未驗證） | 1 週 >100 萬套、約 2,500 萬美元；Steam 上約 180 萬套 | 手繪卡通（Edmund 風） | 配種貓咪、讓遺傳特質延續，再帶貓去打戰術 roguelike | McMillen 的名氣；48% 玩家也玩過 Balatro | 遺傳系統×戰術戰鬥 |
| 21 | **Tangy TD** (2026) | 1 人（Cakez） | 約 4 年，公開開發日誌 | 約 $9.99（由營收÷套數推估） | 首週 2.8 萬套、約 24.5 萬美元；89% 好評 | 霓虹極簡 | 極簡塔防，但策略深度紮實 | 直播中和妻子看到銷量時落淚的片段被 Dexerto 轉到 X 上爆紅；4 年的開發日誌粉絲 | 塔的組合 |
| 22 | **Bills Must Be Paid** (2026) | 2 人（Rike Games） | 7 個月 | $6.99 | 20 天約 33 萬套 | 3D、重視打擊手感 | Nodebuster 式放置遊戲，加上週期性帳單逼你被迫轉生 | Demo 上「熱門免費」、Next Fest（+7 千願望清單）、提早 6 週公布發售日以吃到 Steam 個人行事曆流量 | 轉生／升級 |
| 23 | **Sandustry** (2026 EA) | 小團隊（Lantto Games，人數未驗證）＋Hooded Horse 發行 | 未知 | 未驗證 | 1 週 >10 萬套；>2,000 則評論、壓倒性好評 | 像素沙粒物理 | 每個像素都是可開採、混合、加工的資源，結合工廠自動化 | Hooded Horse、自動化類受眾 | 沙盒、產線 |

**排除或只作參照：**
- Mini Motorways、Against the Storm：團隊超過 3 人，且 Mini Motorways 有 Apple Arcade 資金。
- Opus Magnum：屬於解謎類（已知表現差的類型），而且 Zachtronics 的長尾作品大多一般。
- Bitburner：免費開源，缺乏商業參考價值。
- Meccha Chameleon（2026，2 人，$4.79，一個月 1,500 萬套）：屬於多人躲貓貓的好友爛遊戲，不是系統驅動，但說明了「$5、粗糙、免費素材、可剪片」的組合能有多大的上限。

---

## 2. 共通模式

### 2.1 怎樣的系統遊戲適合實況、適合剪片？
1. **數字爆炸的高潮時刻**：Balatro 的乘數燒起來、Nubby 的分數通膨、Ball x Pit 滿畫面的球。觀眾不必懂規則，也看得出「好像很厲害」。這是系統遊戲裡最容易剪成短片的素材。
2. **一次決定就分出生死的緊張感**：Buckshot Roulette 開槍那一秒、CloverPit 還債那一拉、Dome Keeper 趕回圓頂的倒數。結果明確又帶情緒，最適合實況主做反應。
3. **觀眾能一起參與或一起算**：Rusty's Retirement 讓 Twitch 觀眾下田；Balatro 的觀眾在聊天室搶著算最佳出牌。
4. **每局 15–40 分鐘、失敗也有梗**：適合實況主「再一局」，也方便剪出完整的一局。
5. **「X × Y」一句話就懂**：Peggle × Slay the Spire、打磚塊 × 吸血鬼倖存者、拉霸 × 恐怖。實況主開場一句話就能向觀眾解釋清楚。

### 2.2 單一鮮明的鉤子
- 每款成功作都能用一句話講完核心動詞：**打牌、拉霸、擺磚、寫程式、挖礦後趕回來防守、開槍**。
- 混搭的配方幾乎都是「**一個大家熟悉的玩具或桌遊**（撲克、拉霸、彈珠台、Peggle、打磚塊、俄羅斯輪盤）＋**roguelike 的成長結構**」。熟悉的玩具降低理解成本，roguelike 提供重玩性。
- Bills Must Be Paid 的開發者也說「點子比什麼都重要」。

### 2.3 容易上手、很難精通
- **規則表面極少**：Islanders 只有「放在旁邊就加分」，Balatro 是大家早就懂的撲克牌型。
- **深度來自組合爆炸**：小丑、符號、圓頂、球的融合，數量級落在 100–300 個互相影響的物件，而不是更多規則。
- **難度階梯**：Balatro 的賭注等級、Peglin 的 Cruciball，讓同一套內容能重玩數十小時。
- **把最佳化留給硬核玩家**：Rusty 和 The Farmer Was Replaced 讓休閒玩家放著跑，硬核玩家去追效率。
- 對我們的意義：**這種深度本質上是平衡問題**，正好可以用自動化模擬（大量 AI 對局）來調整數值，是 Claude 的強項。

### 2.4 極簡美術怎樣看起來是刻意的？
1. **一個強烈的後製濾鏡統一全畫面**：Balatro 的 CRT 和 shader 抖動、CloverPit 與 Buckshot 的 PS1 低解析加暗光。**用 shader 包裝比用手繪更有效**，而且這是 Claude 做得到的事。
2. **鎖定年代或媒介的風格**：Loop Hero 的 CGA 四色、Nubby 的 90 年代共享軟體風。限制本身就成了風格，「醜」也變成梗。
3. **幾何抽象**：shapez、Islanders、Tangy TD、Nodebuster 用純幾何加有限色盤，讀起來是「設計感」，不會像「沒錢」。
4. **大量果汁和回饋**：數字跳動、震動、粒子、音效疊加。Nodebuster 和 Bills Must Be Paid 都靠這個撐起觀感，而且是程式加 VFX 就做得出來的。
5. **只有封面圖找人畫**：Peglin 的研究指出封面圖是最重要的行銷素材。遊戲內可以極簡，但封面圖值得花錢或另外處理。

### 2.5 Balatro-like 與倖存者類現在有多飽和？
- **roguelike 整體**：Steam 上 roguelike 類發行量從 2021 年 432 款增加到 2025 年約 1,562–1,926 款（不同統計口徑），2025-10 單月 191 款創紀錄；整個類型累計已超過 6,700 款。營收也在成長（2025 年約 4 億美元，2026 上半年約 5 億美元，Alinea 估計），但高度集中在頂端（Slay the Spire 2 一款約 1.08 億美元），**是超級巨星市場，不是大家一起漲**。
- **倖存者類**：文獻明確點名為**供給過剩**。Megabonk 能紅是靠 3D 化加迷因行銷，屬於例外。對 Claude 來說，動作手感又是弱項，**應該避開**。
- **Balatro-like**（拉霸、彈珠台、骰子、「數字通膨」類）：2024–2025 年仍有 CloverPit、Nubby、Ballionaire、Slots & Daggers 等成功作，但成功者都帶有**第二個差異化軸線**，例如恐怖氛圍或反賭博諷刺（CloverPit）、迷因醜萌（Nubby）、建城 meta（Ball x Pit）。單純換皮的「X 版 Balatro」到 2026 年應該已經難以突圍（未驗證：沒有找到子類型的成功率數據）。
- **相對開放的方向**（方向性判斷，未驗證）：構築類和偏經營的 roguelike 突圍率比動作 roguelite 高；可重新組合的系統深度，以及合作或社交機制，在曝光上表現較好。
- **門檻上升**：Next Fest 參展 Demo 從 2025-06 的 2,645 款增加到 2026-06 的 4,382 款；「熱門即將推出」榜的門檻約 10–12 萬願望清單；個人行事曆曝光需要 8 千–3 萬。Valve 也更重視每日活躍和遊玩時長等參與度指標。

### 2.6 共通的發行做法
- **先有免費版或 Jam 原型驗證**：shapez（itch .io）、Buckshot（itch）、Dome Keeper、Loop Hero、Dorfromantik（Ludum Dare）。
- **Demo 是主要引擎**：Peglin、Dome Keeper、CloverPit、Bills Must Be Paid 都是 Demo 帶起願望清單。
- **避開大作的檔期**：CloverPit、Megabonk 都延期避開 Silksong。
- **多語系**：Rusty 上市就有 11 語、Dome Keeper 商店頁 20 語；中國和新興市場比重高（Mewgenics 超過三分之一的願望清單來自價格敏感的新興市場；shapez 的 DLC 有 30% 賣到中國）。**翻譯正是 Claude 的強項。**
- **定價**：$3–10 的成功作很多（Buckshot、shapez、Rusty、Nubby、Bills、Nodebuster），也符合先前「$5–10 甜蜜點」的結論。

---

## 3. 看起來仍然開放的利基（4–6 個）

> 評估標準：屬於表現好的類型、不需要手繪或動作手感、能發揮 Claude 在模擬平衡、程序生成、shader 和規則邏輯上的強項、能剪片、可以定價 $5–10。

### N1. 「程式／邏輯自動化 × roguelike 成長」
- 證據：The Farmer Was Replaced 賣出 >40 萬套，Bitburner 有社群熱度，但**真正把「寫規則」做成 roguelike 局內構築的成功作很少**（未驗證）。
- 構想：每局抽到的「指令卡」或「邏輯閘」就是 build，用來編排自動化產線或戰鬥 AI，看程式跑起來的過程本身就很適合剪片。
- 適合 Claude：規則引擎、直譯器、平衡模擬都是它的強項。

### N2. 經營或物流模擬的 roguelike 化（短局制的 Management × Roguelite）
- 證據：文獻指出偏經營的 roguelike 突圍率較高；Against the Storm 證明「城建 × roguelite」可行，但它是大團隊；**小規模、30 分鐘一局的經營 roguelite 仍然少**（未驗證）。
- 構想：每局是一張訂單或合約，經營一間工廠、餐館或物流站，局間抽「政策卡」。數字通膨要來自產線吞吐量，而不是撲克牌型。

### N3. 「熟悉的現實系統」當成玩具 × 構築（避開撲克、拉霸、彈珠台）
- 證據：成功的配方都是熟悉的玩具加上 roguelike，但撲克、拉霸、彈珠台、骰子都已經擁擠。
- 還沒被大量占用的玩具（未驗證）：**電路板或麵包板、鐵道號誌、電梯排程、交通號誌、化學反應鏈、記帳或會計、股市撮合、氣象系統**。
- 這些系統規則清楚、圖像可以用純幾何呈現（像 shapez 那樣看起來是刻意的），而且「連鎖反應數字爆炸」很容易剪片。

### N4. 「被迫轉生」或「帳單壓力」的放置／增量遊戲 × 策略層
- 證據：Nodebuster-like 正在變成子類型；Bills Must Be Paid 7 個月賣出 33 萬套；Rusty 賣出 33 萬套。但 2026 年放置和桌面陪伴類的供給暴增，**需要新的機制層**（Bills 的開發者也說品質門檻在上升）。
- 開放的角度：放置遊戲加上**真正的決策**（排程、風險管理、自動化程式），而不是純粹數字往上加；或是把放置的轉生和構築的 roguelike 結構整合。
- 風險：供給過剩，必須有一句話就能講清楚的新鉤子。

### N5. 以 shader 和程序生成為美術核心的「系統可視化」拼磚或布局遊戲（Dorfromantik、Islanders 系譜）
- 證據：Islanders 7 個月、3 人就進入新品前 20；Dorfromantik 也很成功。但**這兩款之後，小型「擺放得分」遊戲加上 roguelike 構築的組合仍不擁擠**（未驗證）。
- 構想：在程序生成的地形上擺放元件，相鄰會產生協同；局間抽新元件。美術可以完全用 shader（水、光、霧）加低多邊形程序模型完成。
- 注意：要避免被看成「解謎類」，所以應該包裝成策略或建造，而不是謎題。

### N6. 恐怖或諷刺包裝 × 系統（CloverPit、Buckshot 路線）
- 證據：PS1 低多邊形加暗光的風格可以用 shader 和免費素材做出來；Buckshot 賣 800 萬套、CloverPit 賣 100 萬套。**氛圍包裝讓簡單規則有情緒張力，容易做實況反應**。
- 開放的角度：把 N3 的現實系統（例如記帳、借貸、保險精算）套上恐怖或諷刺外殼。例如「替惡魔做帳」：會計規則就是構築，壞帳就是死亡。
- 風險：「拉霸加恐怖」本身已經有模仿者，必須換掉核心的玩具。

**總結建議**：從 N1、N2、N3 中挑一個當核心，再疊上 N6 的氛圍包裝或 N5 的 shader 美術路線，就能得到「熟悉的玩具 × roguelike 構築 × 強烈濾鏡」的一句話鉤子。定價 $6.99–9.99，上市就做 10 種以上語言。

---

## Sources

- Balatro：https://en.wikipedia.org/wiki/Balatro ・ https://hitmarker.net/news/indie-card-game-balatro-surpasses-five-million-sales-creator-asks-fans-to-play-more-indie-titles-2891408 ・ https://www.pcgamesn.com/balatro/one-million-copies-sold ・ https://www.notebookcheck.com/Ploetzlich-im-Game-Pass-Dieses-Spiel-hat-ueber-100K-positive-Bewertungen.967373.0.html
- Luck be a Landlord：https://blog.trampolinetales.com/dans-devlog-october-2024 ・ https://godotengine.org/showcase/luck-be-a-landlord/
- Dorfromantik：https://en.wikipedia.org/wiki/Dorfromantik
- Islanders：https://en.wikipedia.org/wiki/Islanders_(video_game)
- shapez：https://wnhub.io/news/analytics/item-3862 ・ https://newsletter.gamediscover.co/p/how-shapez-2-surged-to-250k-copies
- Peglin：https://howtomarketagame.com/2022/05/04/how-peglin-made-1049413-in-1-week/
- Backpack Hero：https://automaton-media.com/articles/newsjp/20230530-249559/ ・ https://www.24-7pressrelease.com/press-release/491107/indie-game-backpack-hero-smashes-kickstarter-goal
- Cobalt Core：https://en.wikipedia.org/wiki/Cobalt_Core ・ https://steampulse.org/game/2179850
- Loop Hero：https://www.inverse.com/gaming/loop-hero-interview ・ https://wnhub.io/news/stores-and-publishing/item-19587
- The Farmer Was Replaced：https://respawn.outlookindia.com/gaming/gaming-news/coding-game-the-farmer-was-replaced-reaches-400k-sales ・ https://www.gamesmarket.global/metaroot-how-a-super-small-publisher-landed-a-really-big-hit/
- Rusty's Retirement：https://newsletter.gamediscover.co/p/how-rustys-retirement-idle-farmed
- Nodebuster：https://vaporlens.app/app/3107330/nodebuster.md ・ https://mancunion.com/2025/05/08/nodebuster-review-a-short-and-sweet-incremental-game/
- Dome Keeper：https://howtomarketagame.com/2022/10/17/how-dome-keeper-achieved-a-million-dollar-launch/ ・ https://www.gamesmarket.global/saxonian-success-dome-keeper-by-bippinbits-reaches-one-million-units-ce406e3b6b945e16f91de158b285dcf8
- Buckshot Roulette：https://en.wikipedia.org/wiki/Buckshot_Roulette ・ https://www.kitguru.net/gaming/joao-silva/buckshot-roulette-hits-8-million-sales-console-port-gets-delayed/
- Nubby's Number Factory：https://en.wikipedia.org/wiki/Nubby%27s_Number_Factory
- Ballionaire：https://en.wikipedia.org/wiki/Ballionaire
- Ball x Pit：https://en.wikipedia.org/wiki/Ball_x_Pit ・ https://wnhub.io/news/investment/item-51689 ・ https://www.gamereactor.eu/ball-x-pit-sells-300000-copies-in-just-five-days-1621593/
- CloverPit：https://en.wikipedia.org/wiki/CloverPit ・ https://www.gamesmarket.global/business/750000-copies-sold-how-cloverpit-completely-beat-future-friends-best-case-predictions-6bf7f63be1546a7ae7f40eef3ef99379 ・ https://respawn.outlookindia.com/gaming/gaming-news/creativity-over-cost-how-viral-indies-of-2025-succeeded
- Megabonk：https://en.wikipedia.org/wiki/Megabonk
- Schedule I：https://80.lv/articles/walter-white-simulator-schedule-i-becomes-steam-s-most-popular-indie-game-of-2025/
- Mewgenics：https://alineaanalytics.substack.com/p/mewgenics-pounces-to-1m-sold ・ https://gameinformer.com/2026/02/17/mewgenics-hits-1-million-copies-sold
- Tangy TD：https://www.allkeyshop.com/blog/?p=2976021
- Bills Must Be Paid：https://howtomarketagame.com/?p=6779
- Sandustry：https://www.gamingonlinux.com/2026/08/the-impressive-sandustry-already-hit-100k-sales-with-an-early-multiplayer-mod-out-now/
- Meccha Chameleon：https://www.windowscentral.com/gaming/the-viral-hit-of-2026-has-sold-15-million-copies-in-a-month-on-steam-costs-usd5-and-was-made-by-2-people
- 類型飽和與市場：https://recognizingpatterns.substack.com/p/the-roguelite-cull-hasnt-happened ・ https://tech4gamers.com/roguelikes-steam-500m-2026/ ・ https://www.destructoid.com/this-popular-genre-dominated-steam-in-2025-and-it-doesnt-look-like-were-escaping-the-loop-anytime-soon/ ・ https://gamedevreports.substack.com/p/gamediscoverco-most-successful-new ・ https://dotesports.com/indies/news/top-five-breakout-indie-hits-in-2025
