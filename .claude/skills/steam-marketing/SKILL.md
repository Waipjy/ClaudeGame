---
name: steam-marketing
description: Pour Decisions 的 Steam 行銷與上架知識包。製作或修改商店頁（膠囊圖、短描述、標籤、截圖、預告片）、規劃願望單漏斗與時程（Coming Soon、Demo、Next Fest、節慶、媒體/實況主、短影音）、商店頁在地化、定價與折扣、AI 內容揭露文字、社群管理、上市後更新與特賣排程時使用。依據 Chris Zukowski (howtomarketagame.com) 與 GameDiscoverCo。
---

# Steam 行銷（Pour Decisions）

> 職能：行銷/上架。產出放 `docs/marketing/`。決策先查 `docs/handoff/DECISIONS.md`。
> 詳細：`references/store-page.md`（素材規格、文案範本、標籤候選、截圖與預告片分鏡）、`references/funnel-timeline.md`（時程、Next Fest、節慶、外展、短影音）、`references/launch-ops.md`（定價、折扣規則、AI 揭露、社群、上市後）。
> 帳號類操作（付 US$100 Steam Direct、送審、填問卷、上傳 build、產生金鑰）都要 HSU 執行；AI 負責準備所有文字、圖、檔案與逐步操作清單。

## 0. 六條鐵律

1. **願望單是唯一的上市前 KPI。** 上市前所有活動都問：「這會帶來願望單嗎？」Zukowski 基準：上市時 **≥7,000** 才有機會進 Popular Upcoming；2026 年該榜中位數約 13,000。首週銷量中位數約為願望單的 0.10–0.15 倍（GameDiscoverCo）。
2. **商店頁越早上線越好**，但前提是類型、美術風格、核心循環已定型。願望單不會過期；但 GameDiscoverCo 發現表現差的遊戲平均預購期 411 天、優於預期的約 214 天 → **商店頁到上市目標 6–12 個月**，不要拖。
3. **一眼看懂類型。** 膠囊圖、前 4–5 張截圖、預告片前 5 秒、短描述、前 5 個標籤，全部指向同一句話：「Balatro 式 roguelike deckbuilder，但牌是會真的起反應的落沙材料。」
4. **gameplay 先行。** 預告片第 1 秒就是遊戲畫面（倒料 → 連鎖反應 → 倍率爆表），不放 logo 開場、不放劇情。很多人直接拖進度條找 gameplay。
5. **誠實揭露 AI。** 遊戲內文字與翻譯（及商店頁文字若由 AI 撰寫）屬 Steam「Pre-Generated」AI 內容，**必須揭露**。美術與音樂不用生成式 AI，揭露文字要明確說出這點。見 §7。
6. **Simplified Chinese 第一優先在地化。** 簡中玩家約佔 Steam 1/4 以上；商店頁 + 預告片字幕 + 遊戲本體首發都要有簡中。

## 1. 商店頁解剖（細節見 store-page.md）

| 元件 | 規格/規則 | 我們的做法 |
|---|---|---|
| Header capsule | 920×430 | 燒杯爆發瞬間 + 大 logo |
| Small capsule | 462×174（縮到 120×45 仍要可讀） | **只放 logo 幾乎填滿**，背景一抹發光沙 |
| Main capsule | 1232×706 | 首頁輪播、願望單 email |
| Vertical capsule | 748×896 | 季節特賣頁 |
| Library capsule / hero / logo | 600×900 / 3840×1240（無文字）/ 1280 寬或 720 高透明 PNG | 上市前備妥 |
| 膠囊圖禁令 | 只能有美術 + 遊戲名 logo + 正式副標；**不得有評分、獎項、折扣字樣、其他文字** | 違規會降曝光、失去特賣資格 |
| Artwork override | 暫時加字（大更新/活動），最長 1 個月，**文字需翻成所有支援語言** | 大更新時用 |
| 短描述 | 上限約 300 字元；類型 + 鉤子 + 動詞 | 範本見 store-page.md §2 |
| 截圖 | ≥5 張 1920×1080，全部是實機畫面含 UI；**前 4–5 張決定 hover 預覽** | 順序見 §3 |
| 預告片 | 首支 30–75 秒、純 gameplay；Steam 頁面會靜音自動播放 → 不靠聲音也看得懂 | 分鏡見 store-page.md §5 |
| 長描述 | 開頭放 GIF（≤3MB 左右，循環的連鎖反應）、3–5 個賣點標題 + GIF、功能列表 | 每個賣點一個動詞 |

**膠囊圖不得用生成式 AI**（會觸發揭露）。用遊戲內實際模擬畫面截取 + 程式/手工排版 + OFL 字型。與 `art-direction` skill 協作。

## 2. 標籤策略（tags）

- 最多 20 個；**順序就是權重**，前 5 個最重要（Zukowski），第一個要最具體、代表最想觸及的玩家群。
- 方法：找 3–5 款最像的遊戲 → 收集它們的熱門標籤（約 25 個）→ 刪掉泛用（Indie、Casual、Action、Adventure）與不準確者 → 排序 → 看 Steamworks 標籤工具的「Similarly Tagged Games」是否出現我們想要的鄰居 → 每 2–3 個月複查（玩家會亂加）。
- 比較對象（comps）：Balatro、Ballionaire、Peglin、Luck be a Landlord（計分 roguelike）；Noita、Sandustry、The Powder Toy（落沙）。
- **建議前 5 名（草案，需在 Steamworks 標籤精靈中確認每個標籤存在）**：
  1. Roguelike Deckbuilder　2. Deckbuilding　3. Physics　4. Roguelite　5. Sandbox
  其後：Card Game、Pixel Graphics、Score Attack（若存在）、Strategy、Turn-Based、Destruction、Science、Colorful、Replay Value、Procedural Generation、Singleplayer、2D、Relaxing（評估是否準確）。
- 不要把 **Puzzle** 放前 10（Puzzle 類命中率僅 0.34%，DECISIONS 已決定避開純解謎定位）；不要用 Casual（會吸引錯的人）；不要追熱門標籤。
- Genre 勾選框另外設定，不要佔前排標籤。

## 3. 截圖順序（前 5 張最重要）

1. **連鎖反應最高潮**：整杯爆炸、倍率 ×12 字樣、分數飛出（＝核心幻想）。
2. **倒料的瞬間**：手牌（瓶子）在下方、游標選落點、材料傾瀉——說明「你做什麼」。
3. **反應的可讀性**：水澆熄火變蒸氣、熔岩遇水成石，配反應計分氣泡。
4. **商店/牌組構築**：買瓶子、催化劑（改寫規則的遺物）——說明 roguelike 成長。
5. **多樣性**：不同燒杯形狀/材料組合的另一個高潮畫面。
6+：催化劑效果、Boss 目標、設定與語言（展示簡中 UI 一張）。

規則：全部真實遊戲畫面、含 UI、不要概念圖；第一眼能看出是像素模擬 + 卡牌。簡中商店頁可上傳簡中 UI 的截圖（每語言可設定不同截圖，需在後台確認）。

## 4. 願望單漏斗與時程（細節見 funnel-timeline.md）

```
曝光（Reddit/TikTok/Shorts/實況/節慶/Steam 演算法）
  → 商店頁造訪（膠囊圖 CTR）→ 願望單（頁面轉換：截圖+預告片+短描述）
  → 上市 email（Steam 自動寄給願望單玩家；折扣 ≥20% 也會觸發願望單通知）
  → 首週銷量（≈0.1–0.15× 願望單）→ 評論（10 則門檻、好評率）→ 演算法推薦
```

相對時程（L＝上市日；確切日期由 `producer` 定）：
| 時點 | 里程碑 |
|---|---|
| L−9~12 月 | 核心循環驗證過 → Coming Soon 商店頁上線 + 公告預告片 + Reddit/短影音開始（每週 2–3 支） |
| L−6~9 月 | 公開 Demo（獨立 App）；**至少在 Next Fest 前 1 個月**，最好數個月 |
| L−4~6 月 | 第三方/主題節慶（Deckbuilders 類、Roguelike 類）；寄 Demo 給實況主 |
| L−1~3 月 | **Steam Next Fest**（每款遊戲只能參加一次，要選上市前最後一場）；2027 年場次：2/22–3/1、6/14–6/21（主計畫 6 月場，見 `producer`） |
| L−2~4 週 | 媒體/實況主上市金鑰、發布日期公告、上市預告片 |
| L | 上市折扣 10–20%（最長 14 天）、開發者直播、全平台公告 |
| L+30 天起 | 才可參加一般折扣；季節特賣 |

**檢查點**：Next Fest 前 < 3,000 → 加強行銷或延後；上市前 6,000–7,000 但沒到 → 考慮延後幾個月衝願望單；努力 6 個月仍只有 ~3,000 → Zukowski 建議直接上市、別燒錢投廣告。

## 5. 外展與社群平台

- **短影音（TikTok / YouTube Shorts / Bilibili / 小紅書）**：落沙連鎖反應是天生的「satisfying」素材。第 1 秒就要有鉤子（「這一倒會爆多少分？」）、5–15 秒、可無縫循環、手機直式 9:16、結尾 3 秒大字「Wishlist on Steam」。不要過度精修；做得像手錄反而表現好。固定頻率發，有效的格式就重複。
- **Reddit**：r/IndieGaming、r/indiegames、r/roguelites 發玩家向 GIF；開發者版（r/IndieDev、r/Unity2D）分享技術 GIF；r/cellular_automata 分享模擬本身。遵守各版自我推廣規則；標題寫「我做的」而非廣告語；連結放留言。
- **實況主/YouTuber**：目標是玩過 Balatro / Ballionaire / Peglin / Noita 的中小型頻道（數百–數萬觀眾）。逐一手寫信、附 Demo/金鑰、一次一把。**95% 以上的金鑰索取是詐騙**——一律回到對方頻道公開的聯絡方式確認後才給。Keymailer / Woovit / Terminals 可用但仍要人工審核。
- **媒體**：上市前 2–4 週寄 press kit（presskit 頁、GIF、截圖、預告片、事實表、金鑰），附 embargo 時間。
- **華語圈**：Bilibili 開發日誌（中文字幕）、巴哈姆特、小紅書；簡中社群對「AI 做的遊戲」話題反應需觀察，回應口徑見 launch-ops.md。

## 6. 定價與折扣（細節見 launch-ops.md）

- 定價：**US$7.99（建議）**，區間 6.99–9.99（DECISIONS）。用 Steam 後台「建議區域價格」一鍵套用，再手動檢查簡中（CNY）、俄、巴西、土耳其等低價區。
- 上市折扣：10–40%、7–14 天，**必須在上市前設定**；建議 15–20%。
- 冷卻期：上市後 30 天不能一般折扣；任兩次折扣間隔 30 天（從前一次結束算）；漲價後 30 天不能折扣；季節特賣不受折扣冷卻限制（但受上市/漲價冷卻限制）。
- 首年折扣梯度：20–25% → 30–35% → 40%；第二年 40–50%+。不要第一個月就大打折，會傷首批買家與評論。

## 7. AI 內容揭露（必做）

Steam Content Survey → AI Generated Content → **Pre-Generated**（隨遊戲出貨、玩家會看到/讀到的 AI 產出）。程式碼助手、編輯器自動化、建置工具 **不需揭露**（2026-01 Valve 澄清），但仍建議在開發日誌坦白。

英文揭露文字（只寫真實情況；「reviewed」只在真的有人工/母語審校時才寫）：

> The game's text (interface, card and rule descriptions, tutorial) and its translations were written with the help of an AI language model (Claude, by Anthropic) and edited by the developer. The store page text was also drafted with AI assistance. All visual art, music and sound effects were made without generative AI — they are hand-made, procedurally generated by code, or CC0-licensed. The game does not generate any AI content while you play.

繁中/簡中版本與社群回應口徑見 launch-ops.md §3。規則：**寧可多揭露也不要被抓包**；揭露內容與實際一致，若日後加入任何 AI 素材要立刻更新問卷。

## 8. 商店頁在地化

- 優先序：簡中 → 英文 → 日、韓、繁中 → 德、法、西、巴葡、俄、波蘭、土耳其（與遊戲內語言一致，**勾選的語言遊戲本體必須真的支援**）。
- 每語言在地化：短描述、長描述、GIF 上的文字（盡量做成無字 GIF）、截圖（可換成該語言 UI）、預告片字幕（優先做無字幕即可懂的預告片）、膠囊圖 logo（簡中版可考慮中文 logo《爆鍋煉金》或中英並列——需 art-direction 決定）。
- 用 Steam 後台匯出/匯入商店頁文字（Store Page Localization 的匯出格式）讓 AI 批次翻譯；AI 翻譯同樣適用 §7 揭露。
- 依「願望單國家分佈」（後台 Wishlist 報表）在上市前 2 個月重新排序語言投資。

## 9. 社群管理與上市後

- 頻道：Steam 討論區（官方）、Discord（Demo 時開）、Bilibili/小紅書留言（簡中）。回覆目標 24–48 小時內。
- 負評：回覆一次、承認問題、說明修正時程、修好後再回覆；不爭論。AI 相關質疑用 launch-ops.md 的固定口徑。
- 上市後 2 週：每 2–4 天一個修 bug 小更新；第 1–2 個月一個「大更新」（新材料 + 催化劑），用 Steam Events「Major Update」+ artwork override（1 個月內、全語言）。大更新排在季節特賣前 1–2 週，讓更新與折扣疊加。
- 年度特賣：春（2027-03-18~25）、夏（2027-06-24~07-08）、秋、冬（每年 Valve 公布）；加主題節慶（看標籤是否符合）。

## 10. 產出檢查清單

- [ ] `docs/marketing/store_page_<lang>.md`（短描述、長描述、標籤順序、截圖清單）
- [ ] 膠囊圖 7 種尺寸、截圖 ≥5、預告片、GIF，全部無生成式 AI，授權記錄齊全
- [ ] AI 揭露文字已由 HSU 填入 Content Survey
- [ ] 標籤前 5 名與「Similarly Tagged Games」截圖存檔
- [ ] 願望單每週記錄（`docs/marketing/wishlists.csv`：日期、總數、新增、來源事件）
- [ ] 上市折扣在上市前設定；特賣日曆已排

## Sources
- Zukowski，標籤：https://howtomarketagame.com/2020/11/12/steam-101-how-to-tag-your-game/
- Zukowski，上市需多少願望單：https://howtomarketagame.com/2022/09/26/how-many-wishlists-should-i-have-when-i-launch-my-game/
- Zukowski，Next Fest 基準：https://howtomarketagame.com/2025/03/26/benchmarks-how-many-wishlists-can-i-get-from-steam-next-fest/ ；2026-02 分析：https://howtomarketagame.com/2026/04/13/making-sense-of-the-february-2026-steam-next-fest/
- Zukowski，TikTok：https://howtomarketagame.com/seven-great-tips-for-marketing-your-indie-game-on-tiktok/
- Zukowski，商店頁上線時機（GWO 摘要）：https://gameworldobserver.com/2025/03/11/steam-page-launch-guide-wishlists-zukowski
- GameDiscoverCo，願望單轉換：https://newsletter.gamediscover.co/p/the-state-of-steam-wishlist-conversions （摘要 https://gamedevreports.substack.com/p/gamediscoverco-the-state-of-steam ）
- GameDiscoverCo，預告片：https://newsletter.gamediscover.co/p/game-trailers-breaking-down-a-key ；標籤：https://newsletter.gamediscover.co/p/are-you-prioritizing-your-steam-tags
- Steamworks 折扣規則：https://partner.steamgames.com/doc/marketing/discounts
- Steamworks 圖像素材：https://partner.steamgames.com/doc/store/assets ；整理：https://presskit.gg/field-guides/steam-capsule-art-guide ；膠囊圖新規：https://www.pcgamesn.com/steam/game-art-new-rules-valve
- Steamworks 預告片：https://partner.steamgames.com/doc/store/trailer
- 2027 上半年特賣/節慶日期：https://www.pcgamer.com/games/steam-reveals-all-the-sale-dates-and-themed-events-for-the-first-half-of-2027/ ；Next Fest 2027-02：https://partner.steamgames.com/doc/marketing/upcoming_events/nextfest/feb_2027
- Steam AI 揭露更新（2026-01）：https://tbreak.com/steam-ai-disclosure-policy-update-developers/ ；https://www.strayspark.studio/blog/steam-ai-disclosure-rules-2026-indie-developer-guide
- 金鑰詐騙：https://www.gamedeveloper.com/game-platforms/avoiding-ineffective-or-scam-discovery-interactions-with-influencers
- 語言分佈：https://alconost.com/en/blog/steam-language-mix-indies ；Steam 硬體/軟體調查：https://store.steampowered.com/hwsurvey
