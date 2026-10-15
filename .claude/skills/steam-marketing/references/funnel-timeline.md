# 願望單漏斗、時程、節慶與外展

## 1. 基準數字（來源見 SKILL.md）

| 指標 | 數值 | 用途 |
|---|---|---|
| Popular Upcoming 最低門檻 | ~7,000（Zukowski 長期說法；淡週 5,500 也可能） | 上市前最低目標 |
| 2026-06 後 Popular Upcoming 實際分佈 | P30 8,470／中位 13,270／P70 20,000 | 理想目標 ≥10,000 |
| SteamDB 願望單排名 | 進入未上市遊戲前 1,000 名 → 大概率會上 Popular Upcoming | 每週查 |
| 首週銷量 ÷ 上市願望單 | 中位 ~0.15×（>25k 願望單樣本）；>$10 遊戲 ~0.10× | 營收預估 |
| Next Fest 期間新增願望單（2026-02） | P30 382／中位 806／P70 1,839／P95 13,461 | 不要期待奇蹟；中位約 800 |
| Next Fest Demo | 提早數個月推出的遊戲表現明顯優於 Fest 前 1 個月內才推出的 | Demo 要早 |
| 預購期長度 | 表現差者平均 411 天、優於預期者 214 天 | 頁面到上市 ≤ 12 個月 |

預估公式（給 producer）：`首週銷量 ≈ 上市願望單 × 0.12`；`總銷量 ≈ 評論數 × 30（20–60）`（見 docs/research/01）。

## 2. 詳細時程（L = 上市日）

### L−12~9 月：商店頁上線（Coming Soon）
前提（Zukowski）：類型確定、美術風格定型、至少有足以展示多樣性的內容（不同燒杯/材料組合）。
- HSU：付 Steam Direct US$100、完成稅務/銀行資料、建立 App。首款產品從付費到可上市需等待 30 天；商店頁須以 Coming Soon 狀態公開至少 2 週才能上市（Steamworks 規則，送審前再確認）。
- 商店頁送審（Valve 審核約數個工作天）。
- 同日：公告預告片、Reddit 貼文、短影音、開發日誌第 1 篇（含「本作由 AI 開發」的誠實說明——是否主打這個話題由 producer 決定）。
- 開始每週記錄願望單（`docs/marketing/wishlists.csv`）。

### L−9~6 月：Demo
- Demo 是獨立 App（Steamworks「Demo」類型），掛在主商店頁上。內容：教學 + 前 3 回合（或一整個 Act），結尾畫面 = 願望單按鈕（`SteamFriends.ActivateGameOverlayToStore(appId, EOverlayToStoreFlag.k_EOverlayToStoreFlag_AddToCart)` 或開商店頁）。
- Demo 也要在地化、手把支援（Deck 玩家很多）。
- Demo 數據：在遊戲內記錄（本機、匿名、可關閉）完成率/平均遊玩時間；Steam 後台看 Demo 遊玩人數與中位時間。中位遊玩時間 > 30 分鐘是好兆頭（假設，業界常見說法）。
- 迭代 Demo（根據回饋修 3–4 版），每次大改發 Steam Event。

### L−6~3 月：節慶與實況主
- **Valve 主題節慶**：Valve 依標籤邀請/開放報名；在 Steamworks「Upcoming Events」頁報名。2027 上半年清單（無專門 deckbuilder 節慶）：Desktop Companion 1/14–18、Shop Keeper 1/25–2/1、Sheep 2/4–8、Couch Co-Op 2/8–15、Next Fest 2/22–3/1、Rhythm 3/8–15、春季特賣 3/18–25、Dinos vs Robots 3/29–4/5、Racing 4/12–19、Witch 4/22–26、Fighting 4/26–5/3、RTS 5/10–17、Mountaineering 5/31–6/3、Next Fest 6/14–21、夏季特賣 6/24–7/8 → **大多不適合我們，別硬塞**。
- **第三方 Steam 節慶**：搜尋當年的 deckbuilder / roguelike / "Strategy" / "Physics" 類線上節慶（例如 Deckbuilders Fest 類活動），通常免費報名、需 Demo 或 Coming Soon 頁。每次參加後記錄新增願望單。
- **實況主**：在 Demo 穩定後寄出。名單來源：在 Twitch/YouTube 搜尋近 6 個月玩過 Balatro、Ballionaire、Peglin、Luck be a Landlord、Noita 的頻道；記在 `docs/marketing/creators.csv`（頻道、平台、語言、平均觀看、聯絡方式來源、寄出日、回覆、是否直播）。每週 10–20 封個人化信。

### L−3~1 月：Steam Next Fest
- **每款遊戲只能參加一次** → 選上市前最後一場（Zukowski）。上市日應在 Fest 結束後（2027-02 場次要求在 3/1 之後上市）。
- 2027 年 2 月場：報名截止 **2027-01-10**、Press Preview 送審 1/25、所有項目送審 2/8、Press Preview 2/11、Fest 2/22–3/1。6 月場：6/14–21，報名截止 2027-04-25，Press Preview 要趕上需約 5/17 前送審（見 `producer/references/steam-timeline.md`，目前主計畫為 6 月場、10 月場為備案）。
- Fest 前 2 週衝「velocity」（短影音、Reddit、實況主），雖然總願望單數比 velocity 更能預測成績。
- Fest 期間：每天至少 1 次 Steam 直播（可用遊戲畫面 + 開發者解說；直播會出現在商店頁頂端）；即時修 bug；回覆每則討論。
- 不要在 Fest 前幾天才偷放 Demo（shadow drop），第一次做遊戲尤其不要。

### L−4~2 週：上市準備
- 上市日公告（Steam Event + 所有社群）。
- 媒體：寄 press kit + 金鑰（Steamworks「Request Steam Product Keys」申請，需 Valve 核准；金鑰禁止轉售）。
- 實況主：上市前 1 週給完整版金鑰，可直播的 embargo 定在上市日。
- 設定上市折扣（**上市前必須設好**）。
- 上市預告片（同首支的升級版，加入新內容）。
- 確認：成就、雲端存檔、Deck 測試、所有語言、build 在 default 分支。

### L：上市
- 上市時間：Steam 用你設定的時間（常見選太平洋時間上午 10 點，搭配歐洲傍晚、亞洲深夜——簡中玩家佔比高，可考慮美西清晨/前一天晚上以兼顧中國晚間，**由 producer 依願望單國家分佈決定**）。
- 開發者直播、Reddit「我上市了」貼文、全社群公告。
- 前 48 小時盯當機回報；有重大 bug 立即熱修（SteamPipe 上傳 → 設為 default）。

## 3. 短影音劇本庫（落沙題材）
每支 5–15 秒、9:16、第 1 秒就有動作、可循環、結尾 3 秒 CTA。
1. 「這一倒能拿幾分？」— 倒火藥 → 連鎖 → 分數停在一個大數字。
2. 「水 + 熔岩 = ?」— 規則揭曉型，系列化（每支一個反應）。
3. 「錯誤示範」— 倒錯材料，整杯被酸吃光（失敗也好看）。
4. 「催化劑改寫物理」— 同一倒料，有/無催化劑對比分割畫面。
5. 「最高倍率挑戰」— 邀請留言猜分數（互動提高演算法表現）。
6. 開發者向：「我怎麼在 Unity 跑 8 萬顆沙」— dirty rect 視覺化（r/IndieDev、Bilibili 技術區）。
- 用決定性回放錄製 → 同一場可以重錄多版。
- 每支記錄：平台、觀看、完播率、願望單變化（Steam 後台 UTM 報表可看外部流量，追蹤不完整，只參考）。
- 有效格式就重複，無效就換；爆紅後把舊影片重新上傳。

## 4. 外展信範本

**實況主（英文，個人化欄位 [ ]）**
```
Subject: Pour Decisions — a falling-sand roguelike deckbuilder (key inside, no strings)

Hi [Name],
I watched your [Balatro/Peglin] run "[video title]" — [specific moment]. I think you'd enjoy our game:
Pour Decisions is a roguelike deckbuilder where every card is a real chemical poured into a live falling-sand simulation. Chain reactions multiply your score.
Steam key: [KEY]   (one key; reply if you'd like one for a giveaway)
Trailer/GIFs/press kit: [link]
No obligation to cover it. If you stream it, [date/embargo] is fine.
— [Team], [contact]
```
**簡中（Bilibili UP 主）**：同結構，強調「简体中文完整支持」，附 B 站可用的素材包（無水印 GIF、直式短片）。

**防詐騙 SOP**
1. 來信索取者 → 不回信附金鑰；去對方頻道的「關於」頁找公開 email/Discord，從那裡聯絡。
2. 一次只給 1 把。
3. 記錄每把金鑰給誰（`creators.csv`）。
4. Steam 鑑賞家：只用 Curator Connect，不寄金鑰。

## 5. 每週行銷儀表（producer 每週檢查）
| 欄位 | 來源 |
|---|---|
| 總願望單、本週新增、刪除 | Steamworks Wishlist 報表 |
| 商店頁造訪、CTR（曝光→造訪） | Steamworks Traffic 報表 |
| 外部流量來源（UTM） | Traffic 報表 |
| 國家/語言分佈 | Wishlist 報表 |
| 本週活動（影片、貼文、節慶） | 手動 |
| SteamDB 願望單排名 | steamdb.info |
