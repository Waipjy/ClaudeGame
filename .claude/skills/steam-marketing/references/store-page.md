# 商店頁：素材規格、文案範本、標籤、截圖與預告片

## 1. 圖像素材總表（Steamworks，2024-08 規格，2026 仍適用；上傳前再對照官方頁）

| 素材 | 尺寸 | 何時需要 | 內容規則 |
|---|---|---|---|
| Header Capsule | 920×430 | 商店頁上線前 | 美術 + logo |
| Small Capsule | 462×174 | 上線前 | logo 幾乎填滿；120×45 可讀 |
| Main Capsule | 1232×706 | 上線前 | 首頁輪播、願望單 email |
| Vertical Capsule | 748×896 | 上線前 | 季節特賣 |
| Screenshots | ≥5 張，建議 1920×1080（16:9） | 上線前 | 實機畫面 |
| Page Background | 1438×810 | 選用 | 不上傳則由最後一張截圖自動產生；可用暗色模糊沙粒 |
| Library Capsule | 600×900 | 上市前 | 直式 key art + logo |
| Library Header | 920×430 | 上市前（不設則沿用 header） | |
| Library Hero | 3840×1240 | 上市前 | **完全無文字**；重點放中央 860×380 安全區 |
| Library Logo | 1280 寬和/或 720 高，透明 PNG | 上市前 | 只能有遊戲名 logo（+ logomark） |
| Bundle Header | 707×232 | 有 bundle 時 | |
| Event cover / header | 800×450 / 1920×622 | 每次 Steam Event | 可放文字（活動用） |

所有 capsule：**只允許遊戲美術、遊戲名稱 logo、正式副標**。禁：評分、獎項、折扣文字、其他產品宣傳、其他雜項文字。違規 → 降低曝光、無法參加特賣與活動。

**製作流程（無生成式 AI）**
1. 在 Unity 用特製「拍照場景」：大解析度網格（如 1232×706 ÷ 像素倍率）跑一段固定 seed 的爆發，於最佳 tick 截圖（決定性 → 可重現同一畫面）。
2. Logo：OFL 字型 + 程式描邊/發光，或手工向量。中文 logo 另做一版供簡中/繁中。
3. 排版：Krita/GIMP/Inkscape（免費）或 Unity UI 直接輸出 PNG。
4. 驗證：縮成 120×45 與 184×69 檢查 logo 可讀；放在 Steam 白/深背景截圖上比較同類遊戲。

## 2. 短描述範本（≤300 字元，先寫英文再在地化）

公式：`[類型] where [獨特鉤子]. [玩家動詞 ×3], [結果/爽點].`

EN（約 220 字元）：
> A roguelike deckbuilder where your cards are real chemicals. Pour sand, water, oil, acid and gunpowder into a living falling-sand flask, set off chain reactions, and stack score multipliers until the whole thing explodes.

简体中文：
> 一款 Roguelike 牌组构筑游戏，你的卡牌是会真实发生反应的化学材料。把沙子、水、油、强酸和火药倒进实时模拟的烧瓶，引发连锁反应，叠加分数倍率，直到整瓶炸开！

繁體中文：
> 一款 Roguelike 牌組構築遊戲，你的卡牌是會真的起反應的化學材料。把沙、水、油、強酸與火藥倒進即時模擬的燒瓶，引爆連鎖反應、疊加分數倍率，直到整瓶炸開！

規則：第一句就講類型；不要用「unique」「innovative」等空話；不要問句開頭；動詞具體。

## 3. 長描述結構（About This Game）

```
[GIF 1：一倒 → 連鎖 → 倍率飆升，3–6 秒循環，寬 616px 以內]
一句話主張（同短描述第一句）

【標題】Every pour is a chemistry experiment   [GIF：反應可讀性]
2–3 行：模擬真實運作；水滅火、熔岩遇水成石、酸蝕金屬。

【標題】Build a deck of reagents   [GIF：商店與牌組]
2–3 行：買瓶子、升級反應、改造燒杯形狀。

【標題】Catalysts rewrite the rules   [GIF：催化劑效果]
2–3 行：遺物改寫化學規則，創造破格組合。

【標題】Chain reactions, multiplied   [GIF：倍率連鎖]

Features
• N materials, N catalysts, N flask shapes（用真實數字）
• Fully deterministic simulation — same seed, same explosion（每日挑戰若有）
• Full controller & Steam Deck support
• 12 languages
```
- 用 Steam BBCode 的 `[h2]`、`[list]`、`[img]`（上傳到 Steam 的 GIF/PNG）。
- GIF 由 Unity 錄影（Recorder 套件或自寫 frame dump）→ ffmpeg 轉 GIF/調色盤，每張控制在幾 MB 內（假設：Steam 對長描述圖片有大小上限，上傳時確認）。
- GIF 盡量**無文字**，省去每語言重做。

## 4. 標籤工作表

步驟（每次修改都記錄在 `docs/marketing/tags.md`）：
1. 開 Balatro、Ballionaire、Peglin、Luck be a Landlord、Noita、Sandustry 商店頁，記錄各自前 10 標籤。
2. 統計出現頻率；刪除 Indie / Casual / Action / Adventure / Early Access 與不準確者。
3. 排序原則：**① 我們最想要的觀眾（Roguelike Deckbuilder 玩家）→ ② 讓我們與眾不同又準確的（Physics / Sandbox）→ ③ 子類（Roguelite、Card Game、Deckbuilding）→ ④ 美術/氣氛（Pixel Graphics、Colorful）→ ⑤ 功能（Singleplayer、Replay Value）**。
4. 在 Steamworks 標籤工具中檢查「Similarly Tagged Games」：理想鄰居是 Balatro、Ballionaire、Peglin 類；若出現大量沙盒建造遊戲 → 把 Sandbox 往後移。
5. Valve 主題節慶依標籤挑選參加者 → 標籤也決定能進哪些節慶。
6. 每 2–3 個月複查，移除玩家亂加的標籤。

## 5. 預告片（系統類遊戲）

**規格**：1920×1080、30 或 60fps、H.264 MP4、高位元率（Steam 會轉檔）；詳見 Steamworks trailer 文件。首支 30–75 秒。

**前 5 秒（最關鍵）**：Steam 頁面靜音自動播放、很多人拖進度條找 gameplay。
- 0.0–1.0s：已經在 gameplay——燒杯半滿，游標拿著火藥瓶。
- 1.0–3.0s：倒下 → 第一個反應亮起 → 計分數字彈出。
- 3.0–5.0s：連鎖擴散、倍率 ×2 → ×5 → ×12、畫面輕微震動。
- 不放 logo 開場、發行商卡、黑屏淡入、劇情。

**系統類遊戲的分鏡原則**
1. 一個鏡頭只示範一條規則（因 → 果），由簡到繁：單反應 → 雙反應 → 連鎖 → 催化劑改寫規則後的破格連鎖。
2. 規則用**畫面**說明而非字卡；必要字卡 ≤ 5 個字、可做無字版以利在地化（或每語言一版字卡，Steam 可為預告片指定語言——上傳時確認）。
3. 中段 1–2 個鏡頭交代 roguelike 結構（商店、牌組、地圖）——每個 ≤3 秒。
4. 高潮放在倒數 10 秒：整杯爆炸 + 最高倍率。
5. 結尾：logo + 「Wishlist now」/「立即加入願望單」+ 平台（Steam、Steam Deck）。
6. 音樂節奏點對齊反應爆發；SFX 要清楚（有聲時加分），但靜音也必須看得懂。
7. 剪輯素材來源：決定性回放（固定 seed + 動作序列）→ 可以反覆錄同一場最漂亮的連鎖，換角度/速度。

**其他影片**
- 15–30 秒直式短版（9:16）給 TikTok/Shorts。
- 開發者解說 gameplay 長片（5–10 分鐘）放第二支，給深度玩家。
- 不要堆積多支舊預告片；過時的移除。

## 6. 商店頁上線前檢查
- [ ] 類型一眼可見（膠囊 + 第一張截圖 + 短描述第一句）
- [ ] 所有圖像為實機或手工/程式製作，授權記錄齊全
- [ ] 支援語言表格與實際遊戲一致（介面/字幕/語音分欄；我們無語音）
- [ ] AI 揭露已填（見 launch-ops.md）
- [ ] 系統需求（最低：雙核 CPU、整合顯示卡、4GB RAM——依實測填寫）
- [ ] Steam Deck 宣稱只寫已驗證的事實（Verified 由 Valve 測試給出）
- [ ] 發售日欄位用「Coming soon」或季度（如 "Q2 2027"），確定前不要寫具體日期
