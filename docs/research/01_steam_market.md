# 01 Steam 獨立遊戲市場調查（2026-10-16）

> 目的：替「Claude 單獨以 Unity + 免費素材開發、上架 Steam」的專案選擇類型與利基。
> 原則：優先 2024–2026 資料；每個數字附來源編號（見文末 Sources）。無法以一手來源核實者標示 **未驗證**。
> 註：多數「銷量／營收」數字是第三方（Gamalytic、VG Insights、Alinea）依評論數推估，非 Valve 官方數據。

---

## 1. 營收分布與評論倍數

### 1.1 整體分布

| 指標 | 數值 | 年份／來源 |
|---|---|---|
| 2025 年 Steam 上架數 | 約 20,000–20,558 款（VGI 20,282；SteamDB 20,008；GameDiscoverCo 20,558），年增約 11% | 2025 [S3][S4] |
| 2025 新作營收 < US$100（連上架費都賺不回） | **約 40%** | Gamalytic，2025/1/1–10/21 上架 [S5] |
| 2025 新作最低 30% 平均總營收 | US$37 | 同上 [S5] |
| 2025 新作營收 < US$1,000 | 8,388 款（約占樣本 12,732 款的 66%，由二手報導換算） | 同上 [S5] |
| 2025 新作營收 > US$100,000 | **約 8%** | 同上 [S5] |
| 2025 新作營收 > US$1M | 約 1.5%（約 300 款） | Alinea／SteamData（二手轉述，**未驗證**）[S2][S9] |
| 所有付費遊戲營收中位數 | US$1,136（2019 上架、終生營收至 2022） | VG Insights 經 Zukowski [S2]；**2025 年無公開中位數** |
| > US$10k 比例 | 約 32%（2019 世代；第 68 百分位 = US$10k） | [S2]，衍生值 |
| 由上推得 2025 > US$1k 比例 | 約 34%（= 1 − 66%） | [S5] 換算 |
| 2025 新作評論 < 10 則 | 48.7%（2024 為 43.6%）；0 評論約 11% | SteamDB [S2] |
| 2025 新作達 500+ 評論 | 約 6.2%（2024 為 7.2%） | SteamDB [S2] |
| 2025 新作達 1,000 評論 | **2.99%（608 款）**；2024 2.44%、2023 2.56% | VGI 經 Zukowski [S3] |
| 1,000 評論 ≈ 營收 | 約 US$150,000+，可解鎖 Daily Deal 等 Valve 曝光 | Zukowski [S3] |
| 1–2 人「Hobby」團隊平均終生營收 | 約 US$50k（平均數，受極端值拉高） | VG Insights（二手，**未驗證**）[S9] |
| 處女作平均營收 | 約 US$120k（平均，非中位） | VG Insights 2024（二手，**未驗證**）[S9] |

**解讀**：Steam 是極端長尾。保守估計 2025 新作約 6 成賺不到 US$1,000（即拿不回 US$100 上架費的回收門檻），約 4 成連 US$100 都賺不到；只有約 8% 破 US$10 萬。平均數會嚴重誤導，應看中位數與門檻比例。

### 1.2 由評論數估算銷量（Boxleiter 倍數）

| 來源 | 倍數（銷量／評論） |
|---|---|
| GameDiscoverCo（Carless, 2020） | 2020 上架中位 38x，規劃區間 20–60x [S6] |
| VG Insights（2021） | 約 30x，現代遊戲 20–55x [S6] |
| Gamalytic | 倍數逐年下降 [S6] |
| Steam Page Analyzer 2026 建議 | **30x（20–40x）**；$4.99 以下 40–60x、$9.99–14.99 30–40x、$19.99+ 20–30x；休閒受眾偏高、硬核策略/模擬偏低（22–28x）——屬作者假設，**未驗證** [S6] |

實務建議：**用 30x 當中心值、20–60x 當區間**；低價（$3–5）休閒/idle 遊戲取上緣（40–60x），硬核模擬取下緣。營收估算：銷量 × 售價 × 約 0.5（扣折扣、退款、地區價、Valve 30%）——Rusty's Retirement 標價 $7、實得淨收約 $5/套可佐證（淨收比會因此更高）[S12]。

---

## 2. 類型／標籤表現 vs. 供給

### 2.1 Zukowski：2025 各類型「命中率」（達 1,000 評論數 ÷ 上架數）[S3]

| 類型 | 命中 / 上架 | 2025 | 2024 |
|---|---|---|---|
| Open World Survival Craft | 15 / 72 | 20.8% | 24.5% |
| Farming | 5 / 60 | 8.3% | 20.8% |
| Roguelike Deckbuilder | 11 / 212 | 5.1% | 6.7% |
| Simulation | 43 / 1,048 | 4.1% | 3.8% |
| Management | 19 / 549 | 3.4% | 5.4% |
| Horror | 39 / 1,208 | 3.2% | 1.8% |
| Idle | 27 / 965 | 2.8% | 3.1% |
| RPG | 28 / 1,158 | 2.4% | 1.5% |
| City Builder | 2 / 397 | 0.5% | 2.7% |
| Puzzle | 14 / 4,022 | **0.34%** | 0.36% |
| 3D Platformer | 8 / 1,390 | 0.05%（原文數字，疑有誤）| 0.72% |

全站平均 2.99%。2025 命中「絕對數量」前十：Narrative 51、Simulation 43、Horror 39、RPG 28、**Idle/Incremental 27**、Roguelike 22、Sexual Content 21、Multiplayer Shooter 21、Shooter 21、Management 19。Zukowski 強調類型排名四五年內變化很小 [S3]。

### 2.2 Zukowski 的類型分級與「Crafty Buildy」主張

- 2022 分析（VGI，2019–2022 indie 32,202 款）[S7]：
  - **上層**（Steam 玩家最愛）：Roguelike Deckbuilder、4X、City Builder、Survival Craft、Visual Novel、Couch Co-op
  - **下層**（表現差／贏家通吃）：2D/3D Platformer、VR、FPS、Shoot 'em Up、Tower Defense、**Puzzle**
- 2024-12「Crafty Buildy Strategy Simulation」[S8]：小團隊應做「系統互動產生內容」的遊戲（元素數 n → 情境數隨組合爆炸），而非手工關卡的「going around」遊戲。推薦：城市/基地建造、colony sim、card-stacker crafting（Stacklands）、management/tycoon、**automation**、autobattler、mining/fishing loop（Dome Keeper、Dredge）、非 StS 式的 deckbuilder、casino/arcade 型 roguelike、job sim、farming。**警告飽和**：Slay-the-Spire 式 deckbuilder、Vampire Survivors 複製品、傳統 RTS、「解謎感太重」的 builder。

### 2.3 Idle / Incremental / Desktop Companion（Steam Page Analyzer 2026-09-27 快照）[S10]

| 指標 | Idler | 全 Steam |
|---|---|---|
| 2024/1–2025/6 世代達 1,000 評論 | **5.6%** | 4.2% |
| 達 100 評論 | 23.9% | 17.3% |
| 評論中位數 | 22 | 11 |
| 付費標價中位數 | $3.99 | $4.99 |

- **供給爆炸**：Idler 標籤上架數 2023: 329 → 2024: 572 → 2025: 940 → **2026（至 9/27）: 1,566（同期 +150%）**；另有 2,625 個未上架頁面在排隊。Incremental 子標籤 2026 同期 +256%。
- **Desktop Companion** 標籤（Valve 2026-05 新增）：2026 已 136 款 vs 2025 同期 19 款（+616%，部分是重新貼標）。樣本太少，尚無成功率。→ 「螢幕底部掛機」品類在 2026 正快速**變擁擠**。
- **價格與成功率（相關、非因果）**：< $5：2.5% 達 1,000 評論；$5–9.99：10%；$10–14.99：16.1%。
- 相鄰子標籤命中率（小樣本）：Cozy 21.1%（38 款）、Resource Management 19.5%（41）、**Automation 13.6%（66）**、Collectathon 1.3%、Time Management 1.9%。
- 案例 **Rusty's Retirement**（底部掛機農場，$7）：約 33 萬套、上市時約 14 萬 wishlist、支援 11 語言，中國占 26% 銷量、日本 10%、韓國 6%、台灣 4%；$4 Supporter DLC 附加率約 11%（約 $111k）[S12]。
- GameDiscoverCo 2026-08：Idler 在「熱門 PC 遊戲（>5 萬套）」標籤排名 2021→2025 上升 46 名至 #15 [S11]。

### 2.4 Roguelite / Roguelike / Survivors-like

- GameDiscoverCo 2026-08：熱門作品標籤中 Roguelite #1（+39 名）、Roguelike #2；Life Sim、Idler 上升；JRPG、Turn-Based Strategy、RTS、Survival Horror、City Builder 下滑。熱門作品售價中位數 $19.99（2021）→ $16.99（2025）[S11]。
- 供給：roguelike/roguelite 年上架 2021: 432 → 2025: 1,926（約 4.5 倍），累積 6,700+；類型營收 2025 約 $4 億（+80%）但高度集中於頭部（Slay the Spire 2、Megabonk 等，Alinea 模型估計）[S13]。→ **需求大、供給更大、頭部通吃**。
- Survivors-like：Zukowski 明列為飽和複製品 [S8]；2025 大量低評論作（例：Big Survivor 46 則評論）[S4]。無獨立命中率數據（**未驗證**）。

### 2.5 小結：相對供給的表現

| 類型 | 判斷 | 依據 |
|---|---|---|
| Automation / Resource Mgmt / Colony / Survival Craft | **超額表現、供給低** | [S3][S8][S10] |
| Roguelike Deckbuilder | 仍高於平均（5.1%），但 StS 式已飽和；需新穎機制 | [S3][S8][S13] |
| Management / Simulation | 高於平均（3.4–4.1%） | [S3] |
| Idle / Incremental | 略高於平均（2.8–6.7%），但 2026 供給暴增 2.5 倍，且多為 <$5 低價 | [S3][S10] |
| Desktop Companion（底部掛機） | 有大型成功案例，但 2026 供給 +616%，正快速飽和；風險升高 | [S10][S12] |
| Horror | 2025 回升至 3.2%，但需美術氛圍與演出 | [S3] |
| Cozy / Farming | 命中率高，但非常依賴美術魅力 | [S3][S10] |
| City Builder | 2025 僅 0.5% | [S3] |
| Puzzle | **最差之一**（0.34%，4,022 款） | [S3][S7] |
| Survivors-like / 2D-3D Platformer / VR / FPS | 飽和或贏家通吃 | [S7][S8] |

---

## 3. Wishlist

### 3.1 Wishlist → 銷量轉換

| 指標 | 數值 | 來源 |
|---|---|---|
| 首週銷量 / 上市時 wishlist（中位） | **0.15x**（2024/9–2025/9，≥25k wishlist 的遊戲）；扣除成人遊戲 0.14x | GameDiscoverCo 2025-10 [S14][S15] |
| 同上，2024 開發者調查（>10k wishlist） | 0.17x；分布從中位的 1/10 到 10 倍 | [S14] |
| 售價 > $10 的遊戲 | 0.10x | [S14] |
| 低價遊戲 | 轉換通常較高（無數字） | [S14] |
| 首月轉換中位 | 約 27%（Gamalytic，二手轉述，**未驗證**）| [S2] |
| 轉換最佳 20 款 vs 最差 20 款 | 首週好評率 91% vs 67%；商店頁上架天數 214 vs 411 天 | [S15] |
| 2022–2025 趨勢 | 轉換率沒有下降；難的是競爭 wishlist 的遊戲變多 | [S14][S15] |

經驗公式：**首週銷量 ≈ wishlist × 0.1–0.2**；首年銷量常為首週數倍（無統一數據，**未驗證**）。

### 3.2 上市時需要多少 wishlist 才可見

- **舊門檻**：約 7,000 wishlist 進入首頁「Popular Upcoming」（Zukowski 長年基準）[S16]。
- **2026-06-05 商店改版**：Popular Upcoming 改為「下個月最受期待」，門檻大幅上升。Zukowski 2026-06 調查：上榜遊戲 wishlist 第 30 百分位約 8,470、**中位約 13,270**、第 70 百分位約 20,000；<7,000 已罕見 [S16][S17][S18]。
- 新增 **Personal Calendar**（依玩家偏好推薦未來兩週新作，約上市前 2 個月出現）：預設 Top 100 估計需 8,000–60,000；Top 250 約 5,000–32,000（早期小樣本）[S16]。
- Zukowski 現行建議：**目標 10,000+**；Early Access 前至少 7,000；若努力半年只有約 3,000，就直接發售別燒廣告 [S16]。
- 參考：「營銷努力約可帶來 150 則評論；到 1,000 則需要玩家真心喜歡、演算法接手」[S3]。

### 3.3 Next Fest 與 Demo

- Demo 數量暴增：2025-06 2,645 → 2026-02 3,300+ → **2026-06 4,300+**（紀錄）[S13][S19]。
- 2026-02 Next Fest（182 位開發者調查）：增加 wishlist **中位 806**、P70 1,839、P95 13,461 [S20]。
- 2025-02 依進場 wishlist 分組（Zukowski）：0–999 組中位增加 462（+150%）；1k–9.9k 組 1,513（+45%）；10k–99.9k 組 6,360（+28%）[S21]。**進場 <1,000 的遊戲沒有一款跳級**；約 2,000 wishlist 才開始有明顯效益；進場 wishlist 與增量 Spearman 相關 0.825 [S20][S21]。
- 只有 15–32% 試玩者會加 wishlist；但 Demo 是進入首頁相關區塊的門票 [S21]。
- 建議：Demo 提前數月上架（獨立 demo 頁以收評論），先參加其他小型節慶，Next Fest 前兩天最關鍵，節後數週再發售 [S20][S21]。

---

## 4. 定價（小規模 $3–$15）

| 項目 | 數據 | 來源 |
|---|---|---|
| Idler 付費標價中位 | $3.99（全 Steam 付費中位 $4.99） | [S10] |
| 熱門作品售價中位 | $16.99（2025）；Top-50 暢銷中位 $15.64（2025-10，2023 為 $19.50） | [S11][S2] |
| Idler 價格 vs 達 1,000 評論 | <$5: 2.5%；$5–9.99: 10%；$10–14.99: 16.1%（相關非因果） | [S10] |
| 參考定價 | idle 遊戲 $0–5、farming sim $10–15；Rusty's Retirement 取中間 $7 | [S12] |
| 內容對應價格帶（業界經驗法則，**未驗證**） | $4.99 短篇/簡單解謎；$9.99 roguelike 5–10 小時；$14.99 模擬/管理 | [S22] |
| **首發折扣（Valve 規則）** | 最高 40%，7–14 天，須在發售前設定 | [S23] |
| 一般折扣規則 | 10–95%；發售後 30 天內不得折扣（首發折扣除外）；兩次折扣間隔 30 天（季節特賣例外）；漲價觸發 30 天折扣冷卻，發售 30 天內不得漲價 | [S23] |
| 首發折扣慣例 | 10–20%（15% 常見）（經驗法則，**未驗證**） | [S22] |
| 地區定價 | 採用 Steam 建議地區價為起點；不要全區同美元價 | [S22] |
| 分成 | Valve 30%（營收 >$10M/$50M 才降）；實際每套淨收約為標價 50–70% | [S22][S12] |

---

## 5. 語言分布與中文在地化

### 5.1 Steam 硬體調查語言（2026-09，最新）[S24]

| 語言 | 2026-09 | 2026-06 [S25] | Valve 帳號資料 FY2024 [S25] |
|---|---|---|---|
| English | **34.20%** | 38.2% | 33.5% |
| Simplified Chinese | **31.39%** | 24.2% | 33.7% |
| Russian | 9.05% | 9.6% | 8.2% |
| Spanish (Spain) | 4.08% | 4.6% | 4.6% |
| Portuguese (Brazil) | 3.70% | 4.0% | 2.8% |
| German | 2.48% | 2.7% | 2.5% |
| Japanese | 2.41% | 2.6% | 1.7% |
| French | 2.08% | 2.3% | 2.1% |
| Polish | 1.49% | — | — |
| Korean | 1.37% | 1.5% | 2.2% |
| Traditional Chinese | 1.27% | — | — |
| Turkish | 1.09% | 1.3% | 1.7% |

注意：調查單月波動大（2026-02 簡中曾達 54.6%，被認為是春節取樣異常）[S26]。Valve 表示超過 60% 用戶使用非英語 [S25]。

### 5.2 中文在地化值不值得？

- **值得，且對本專案成本極低**（Claude 自行翻譯，但需人類母語者校對）。
- 證據：一發行商目錄加中文 + 在地 PR 後中國銷量占比由 ≤5% 升至 ≥20%；Against the Storm（17 語）亞洲占 ≥32%；只有英文的 Nebulous 中國僅約 2%；只有 32% 中國玩家願玩純英文遊戲；Hooded Horse 稱東亞語言 wishlist 提升 >90% [S25]。
- Rusty's Retirement（11 語）中國 26%、日 10%、韓 6%、台 4%——底部掛機/idle 類在東亞特別吃香 [S12]。
- 機翻品質差的 CJK 被視為「假省錢」；應有母語校對 [S25]。
- 建議優先序：English、Simplified Chinese、Russian、Japanese、Traditional Chinese（HSU 本人可校對）、Spanish、Brazilian Portuguese、German、French、Korean。

---

## 6. Steam 規則

| 規則 | 內容 | 來源 |
|---|---|---|
| Steam Direct 上架費 | **US$100／款**，不可退 | [S27] |
| 回收門檻 | 該產品 **Adjusted Gross Revenue 達 US$1,000** 後，於下一次付款退還 | [S27] |
| 付費後等待期 | 前幾款遊戲需在付費後等待 **30 天**才能發售 | [S27] |
| Coming Soon 頁 | 發售前需公開 **至少兩週** | [S27] |
| AI 內容揭露（2026-01 改版） | 不再需揭露開發用 AI 工具（如 coding helper、背景效率工具）；**需揭露玩家看得到、聽得到、互動到的 AI 生成內容**（美術、音效、劇情文字、**在地化文本**、商店頁描述、行銷素材）。分兩類：**Pre-generated**（隨遊戲出貨，需寫說明，顯示於商店頁 About This Game）與 **Live-generated**（遊玩時即時生成，需有防護，否則可能下架） | [S28][S29] |
| AI 揭露規模 | 2025-07 約 7,818 款（約 7%）揭露使用生成式 AI | [S29] |

**對本專案的含意**：AI 寫程式不需揭露；但若遊戲文字、翻譯、商店文案由 Claude 生成，屬「玩家看得到的 AI 生成內容」，**應如實揭露**（Pre-generated）。程序生成（procedural generation，非生成式 AI 模型）一般不屬 AI 生成內容（依規則文字推論，**未驗證** Valve 是否有明文）。部分玩家對 AI 標籤有負面觀感（無量化數據，**未驗證**）。

---

## 對選題的啟示

1. **選「系統生內容」的類型，避開「手工內容」類型**：Automation（13.6% 達 1k 評論）、Resource Management（19.5%）、colony/management sim（3.4–4.1%）、非 StS 式 roguelike deckbuilder（5.1%）都遠高於全站 2.99%，而且正好吃系統設計、模擬平衡、程序生成——不需要角色動畫與手繪美術。Puzzle（0.34%）、Platformer、Survivors-like、FPS、Horror（重演出氛圍）應避開。
2. **美術風格選「抽象／幾何／UI-first／shader 驅動」**：數據指向的高命中類型（automation、incremental、管理、卡牌）都能以圖示、粒子、shader、程式化幾何撐起畫面，把弱項（角色動畫、手感）隱藏在設計之外。
3. **底部掛機（Desktop Companion）／Idle 需謹慎**：Rusty's Retirement 證明上限很高（33 萬套、東亞占 46%），但 2026 該標籤供給 +616%、Idler +150%，且中位價僅 $3.99。若要做，必須帶有真正的系統深度（automation / 資源管理混血），定價 $5–10 而非 <$5（$5–9.99 命中率 10% vs <$5 的 2.5%）。
4. **定價 $5–$10、首發折扣 10–20%**：符合小規模內容，對應較好的轉換與較高評論倍數；開發者 30% 分成、地區價、折扣後淨收約為標價一半，所以回收 US$100 上架費（實際需 Adjusted Gross US$1,000 才退還）約需 150–300 套。
5. **最低目標可行性換算**：以 0.15x 首週轉換，要首週賣 ~200 套需約 1,500 wishlist；要拿到 Popular Upcoming／Personal Calendar 可見度需 **10,000+**。行銷（GIF、短影音、Demo）是 AI 單人開發最大缺口，應及早規劃：商店頁至少提前 6 個月上線，Demo 先參加小型節慶，再於 wishlist ≥2,000 時參加 Next Fest。
6. **一開始就做 10 國語言，特別是簡中**：簡中 31.4% vs 英文 34.2%，翻譯是我們的強項、近乎零成本；請母語者（HSU 可校對繁中/簡中）校對。並在 Steam AI 揭露中如實標註「文本/翻譯由 AI 生成」。
7. **設計要能「被看著玩」與短影音傳播**：wishlist 轉換最佳的遊戲首週好評 91%、多為 co-op 或在社群影片爆紅的單人遊戲；系統型遊戲應產生可分享的「漂亮/荒謬的自動化畫面」或數字爆炸瞬間，以 shader/VFX 強項加強可視化。
8. **範圍小、打磨深、好評率優先**：達 1,000 評論（約 $150k）需要玩家真心喜歡；評論 <10 則的遊戲約占一半。寧可 3–5 小時高密度系統內容 + 高好評率，也不要大而粗糙。

---

## Sources

- [S1] Alinea Analytics 2025 Year in Review — https://gamedevreports.substack.com/p/alinea-analytics-2025-year-in-review
- [S2] Steam Page Analyzer, "Median Steam game 2026" — https://www.steampageanalyzer.com/blog/median-steam-game-2026
- [S3] Chris Zukowski, "What the hell happened in 2025" (2026-01-27) — https://howtomarketagame.com/2026/01/27/what-the-hell-happened-in-2025/
- [S4] Chris Zukowski, "How many games were released in 2025" (2026-01-08) — https://howtomarketagame.com/2026/01/08/how-many-games-were-released-in-2025/
- [S5] MP1st（引 Gamalytic / GamesRadar+）, "40% of Steam Games in 2025 Earned Less Than $100" (2025-10-22) — https://mp1st.com/news/40-of-steam-games-in-2025-earned-less-than-100
- [S6] Steam Page Analyzer, "Boxleiter method explained" — https://www.steampageanalyzer.com/blog/boxleiter-method-explained
- [S7] Chris Zukowski, "What genres are popular on Steam in 2022" — https://howtomarketagame.com/2022/04/18/what-genres-are-popular-on-steam-in-2022/
- [S8] Chris Zukowski, "What are crafty buildy strategy simulation games" (2024-12-27) — https://howtomarketagame.com/2024/12/27/what-are-crafty-buildy-strategy-simulation-games/
- [S9] Voxbooster, "Indie game statistics 2026" — https://voxbooster.com/blog/indie-game-statistics-2026
- [S10] Steam Page Analyzer, "Idler games on Steam, measured" (snapshot 2026-09-27) — https://www.steampageanalyzer.com/niches/idler
- [S11] GameDiscoverCo, "How have the genres of hit PC games changed since 2021?" (2026-08-25) — https://newsletter.gamediscover.co/p/how-have-the-genres-of-hit-pc-games
- [S12] GameDiscoverCo, "How Rusty's Retirement idle-farmed its way to 300k Steam sales" — https://newsletter.gamediscover.co/p/how-rustys-retirement-idle-farmed
- [S13] Recognizing Patterns, "The roguelite cull hasn't happened" — https://recognizingpatterns.substack.com/p/the-roguelite-cull-hasnt-happened
- [S14] GameDiscoverCo, "The state of Steam wishlist conversions" — https://newsletter.gamediscover.co/p/the-state-of-steam-wishlist-conversions
- [S15] Automaton, "Steam wishlist-to-sales study…" (2025-10-20) — https://automaton-media.com/en/news/steam-wishlist-to-sales-study-shows-how-genre-release-timing-and-reviews-affect-success-nsfw-games-show-unusually-high-conversion-rate/
- [S16] Chris Zukowski, "How many wishlists should I have when I launch my game"（含 2026-06 更新）— https://howtomarketagame.com/2022/09/26/how-many-wishlists-should-i-have-when-i-launch-my-game/
- [S17] Game Dev Report, "Steam update destroyed indie devs…" (2026-06-07) — https://gamedevreport.beehiiv.com/p/steam-update-destroyed-indie-devs-and-summer-games-fest
- [S18] Steam Page Analyzer, "Steam Popular Upcoming list" (2026-06-10) — https://www.steampageanalyzer.com/blog/steam-popular-upcoming-list
- [S19] WN Hub, June 2026 Next Fest results — https://wnhub.io/news/stores-and-publishing/item-51221
- [S20] Cinevva, "Steam Next Fest strategy (2026)" — https://app.cinevva.com/guides/steam-next-fest-strategy
- [S21] Chris Zukowski, Next Fest benchmarks (archive, Feb 2025 data) — https://howtomarketagame.com/2025/03/26/archive-january-2026-benchmarks-how-many-wishlists-can-i-get-from-steam-next-fest/
- [S22] Steam Page Analyzer, "Steam pricing strategy" (2026-02-21) — https://www.steampageanalyzer.com/blog/steam-pricing-strategy
- [S23] Steamworks Documentation, Discounting — https://partner.steamgames.com/doc/marketing/discounts
- [S24] Steam Hardware & Software Survey (Sept 2026) — https://store.steampowered.com/hwsurvey/
- [S25] Steam Page Analyzer, "Steam localization languages" (updated 2026-09-15) — https://www.steampageanalyzer.com/blog/steam-localization-languages
- [S26] GamingOnLinux, Feb 2026 survey Simplified Chinese swing — https://www.gamingonlinux.com/2026/03/steam-survey-for-february-2026-shows-a-big-swing-to-simplified-chinese
- [S27] Steamworks, Steam Direct — https://partner.steamgames.com/steamdirect
- [S28] Notebookcheck, Steam updates AI disclosure form — https://www.notebookcheck.net/Steam-updates-AI-disclosure-form-requiring-developers-to-report-visible-and-in-game-AI-but-not-background-tools.1206103.0.html
- [S29] GIGAZINE, Steam updates AI disclosure guidelines (2026-01-20) — https://gigazine.net/gsc_news/en/20260120-steam-updates-ai-disclosure-guidelines
- [S30] GamingOnLinux, Sept 2026 survey — https://www.gamingonlinux.com/2026/10/steam-survey-for-september-2026-shows-a-drop-in-linux-with-simplified-chinese-rising/
