# Steam 上架時程表（以 2026-10-16 為起點）

## 1. 已確認的 Steam 日期
| 活動 | 日期 | 來源 |
|---|---|---|
| Next Fest 2026-10 | 已來不及（無商店頁/Demo） | — |
| Next Fest 2027-02 | 2027-02-22～03-01 | notebookcheck（Valve 公告） |
| Spring Sale 2027 | 03-18～03-25 | 同上 |
| Next Fest 2027-06 | 2027-06-14 10:00 PDT～06-21；**報名截止 04-25**；press preview 06-03 起，要趕上需 **05-17 前送審** Demo 與商店頁 | Steamworks |
| Summer Sale 2027 | 06-24～07-08 | notebookcheck |
| Next Fest 2027-10 | 未公布（慣例 10 月中） | 未驗證 |
| Winter Sale | 約 12 月中～1 月初（2026 為 12-17～01-04） | steampageanalyzer |
| 主題節（可帶 Demo 先暖身） | 2027 上半年有 Shop Keeper Fest（01-25～02-01）等；看 Steamworks「upcoming events」找合適的 | notebookcheck |

Next Fest 規則：商店頁需公開；Demo 在節慶開始時可公開遊玩；不能是已上市內容的序章；**每款遊戲只能參加一次**。

## 2. 主時程（假設；M0 後重估）
| 日期 | 事件 | 前置 |
|---|---|---|
| 2026-11 中 | M0 原型 Gate | — |
| 2026-12 | HSU 註冊 Steamworks、付 US$100 Steam Direct（首款需付費後等 30 天才能發售） | HSU |
| 2027-01 底 | M1 垂直切片 | Unity 命令列/CI 已解決 |
| 2027-02 上旬 | 商店頁送審（審核 3–5 工作天，提早 ≥ 7 天） | 預告片、膠囊、截圖、描述 10 語、AI 揭露 |
| 2027-02 中 | 商店頁 Coming Soon 上線（距上架約 7 個月） | — |
| 2027-03～04 | 公開 Demo；先上一個主題節 | Demo 頁 |
| 2027-04-15 | **Gate：wishlist ≥ 2,000？** 否 → 改走 10 月 Next Fest 備案 | — |
| 2027-04-25 | Next Fest 報名截止 | — |
| 2027-05-17 | Demo + 商店頁送審（趕 press preview） | — |
| 2027-06-14～21 | Next Fest | 直播排程、Demo 熱修準備 |
| 2027-06 底～07 | 依節慶回饋修 Demo；發售日公告（獨立公告，提早 ≥ 6 週） | — |
| 2027-07～08 | Alpha → Beta；媒體/創作者名單 200–400 人；個人化信件 6–8 週前 | — |
| 2027-08 底 | 送審 build；設首發折扣（≤ 40%，建議 10–20%） | — |
| 2027-09 中 | **上架**（避開 Summer/Autumn Sale 與大作） | key 給創作者 1–2 週前 |

備案：2027-10 Next Fest → 上架 2027-11 中（Autumn Sale 前）或 2028-01 底～02。

## 3. Wishlist 基準
| 階段 | 最低 | 目標 | 依據 |
|---|---|---|---|
| 商店頁上線 3 個月 | 500 | 1,500 | 假設 |
| Next Fest 進場 | 2,000 | 5,000 | < 1,000 進場沒有跳級；1k–9.9k 組中位 +1,513（+45%） |
| 上架 | 7,000 | 10,000–13,000 | 2026-06 改版後 Popular Upcoming 上榜中位約 13,270 |
- 換算：首週銷量 ≈ wishlist × 0.15（中位）；$10 以上遊戲約 0.10x。10k wishlist → 首週約 1,000–2,000 套。
- 若努力半年只有約 3,000：照計畫發售，不要燒廣告（Zukowski）。
- Next Fest 後 wishlist 日增 1–2 週回到基準；節後 1–3 個月上架。

## 4. 商店頁上線前清單
- [ ] 一句話鉤子（「Balatro，但你的牌是會真的起化學反應的材料」類）
- [ ] 類型與美術風格定案（之後別改，否則 wishlist 品質會受影響）
- [ ] 預告片：前 3 秒就是實機的連鎖爆炸 + 分數狂飆；30–60 秒
- [ ] 5–6 張截圖（每張展示不同反應/原型）、膠囊圖各尺寸
- [ ] 標籤：Roguelike Deckbuilder、Roguelite、Simulation、Physics、Sandbox、Score Attack…（避免把 Puzzle 放前排）
- [ ] 10 語言短描述（HSU 校對繁中/簡中）
- [ ] AI 內容揭露：遊戲文字/翻譯/商店文案由 AI 生成 → Pre-generated 揭露
- [ ] 送審提早 ≥ 7 天

## 5. 上架流程（Steamworks）
1. 商店頁 checklist → Mark as ready for review（3–5 工作天）
2. Coming Soon ≥ 2 週
3. Build checklist：上傳近乎最終的 build 到 default branch → 送審（在商店頁送審之後）
4. 兩者通過 → 手動按 Release（不會自動發售）
5. 發售後 30 天內不能一般折扣、不能漲價；首發折扣需事先設定
