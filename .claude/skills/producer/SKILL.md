---
name: producer
description: 規劃或調整 Pour Decisions 的範圍、里程碑、排程、風險、Steam 上架/Next Fest 時程，或在 session 開工/收工時維護 HANDOFF.md、TASKS.md、DECISIONS.md 時使用。
---

# Producer — 範圍、排程、交接

本專案由多個 AI session 接力開發，任何 session 都可能隨時中斷。製作人的工作是讓**下一個 session 在 5 分鐘內接手、不重做、不推翻**，並讓整個專案朝「準時上架、wishlist ≥ 10k、好評率高」前進。

參考檔：
- `references/steam-timeline.md`：從今天（2026-10）到上架的日期表、Next Fest 規則、wishlist 門檻、上架流程
- `references/templates.md`：HANDOFF / TASKS / DECISIONS / 風險登錄 / 週報 範本（直接複製）

---

## 0. 六條最高原則

1. **未提交、未推送的工作視同不存在。** 每個可驗證的小段落就 commit + push + 更新 HANDOFF。
2. **一個 session 只做一個任務，做完驗證才勾選。** Anthropic 長時 agent 研究：最常見的失敗是一次做太多、半途斷掉留下沒文件的半成品，以及沒端到端驗證就宣稱完成。
3. **核心循環先於一切內容。** 原型證明「好玩」→ 垂直切片證明「做得出來」→ 才進內容量產。
4. **範圍是唯一可調的變數。** 日期由 Steam 節慶決定，品質門檻不降，所以永遠砍範圍。事先寫好砍除清單。
5. **行銷和開發並行，不是之後。** 商店頁至少在上架前 6 個月上線；Demo 是主要 wishlist 引擎。
6. **決策寫下來就不再重吵。** 已拍板的決策只能用「異議」條目挑戰，由 HSU 或製作人裁定。

---

## 1. 里程碑（每個都有 Gate：沒過就不往下）

| 里程碑 | 目標日期（假設） | 要證明什麼 | Gate（全部達成才算過） |
|---|---|---|---|
| M0 原型 | 2026-11 中 | **該不該做**：核心循環好玩 | 瀏覽器灰盒：倒料→反應→計分→過關；HSU 試玩後自願玩第二局；「為什麼輸」說得出來；決定性測試通過 |
| M1 垂直切片 | 2027-01 底 | **做不做得出來**：Unity 管線與品質 | 1 個完整 ante（3 回合 + 商店）接近出貨品質：8 材料、10 催化劑、計分 juice、音效、存檔、2 語言、Steam build 能上傳；並做出「第二個」內容件以估時（Rami Ismail） |
| 商店頁上線 | 2027-02 | 開始累積 wishlist | 預告片（實機畫面開頭）、5–6 張截圖、膠囊圖、標籤、10 語言短描述、AI 內容揭露填寫 |
| M2 公開 Demo | 2027-04 | Demo 帶 wishlist | ante 1–3、教學、遙測（opt-in）、無崩潰；先參加小型主題節 |
| Next Fest | 2027-06-14～21 | wishlist 加速 | 4/25 前報名；5/17 前送審以趕上 6/3 press preview；進場 wishlist ≥ 2,000 |
| M3 功能完成（Alpha） | 2027-07 | 所有系統可用 | 所有系統、難度階梯、meta 進度能跑；內容可不足 |
| M4 內容完成（Beta） | 2027-08 | 從頭玩到尾 | 全內容、10 語言、平衡報告通過、上架前 4–8 週 |
| 上架 | 2027-09（Next Fest 後 1–3 個月） | 賣 | 發售日提早 ≥ 2 週公布（Coming Soon 最少 2 週）；首發折扣 10–20% 已設定 |

**備案（Gate 決策點 2027-04-15）**：wishlist < 2,000 或 Demo 未穩 → 改參加 2027-10 Next Fest，上架移到 2027-11 或 2028-01 底～02（避開 Winter Sale）。一款遊戲只能參加一次 Next Fest，不能浪費。

日期全部是**假設**，M0 結束後依實際速度（尤其「第二個內容件」的耗時）重估，寫進 DECISIONS.md。

## 2. 範圍管理

- 每個里程碑用 MoSCoW 分類：Must / Should / Could / Won't（明確寫 Won't 才能拒絕新點子）。
- **砍除清單預先寫好**（`docs/design/CUT_LIST.md`），排序 = 先砍誰。範例順序：Endless 模式 → 第 7–8 種燒杯 → 每日挑戰 → 第 9–10 個語言 → 第 6 個原型 → 動態音樂分層。
- **不可砍**：決定性、可讀性回饋（反應彈字/連鎖顯示）、存檔、在地化管線（語言數可砍，管線不可）、Steam 基本整合、教學。
- 觸發規則：任一里程碑估計延遲 > 20% → 立即從 Could 砍，延遲 > 40% → 從 Should 砍，並記 DECISIONS。
- 新點子進 `docs/design/IDEAS.md` 停車場，只在里程碑交界時評估，不在中途插隊。
- 內容估時：用垂直切片中「第二個」材料/催化劑的實際耗時 × 數量 × 1.5 緩衝。
- Rami Ismail：Alpha 宜落在總時程 2/3 附近，留 30–50% 時間給內容；Beta 最晚上架前 4 週，理想 8–12 週。

## 3. 風險登錄

存 `docs/handoff/RISKS.md`（範本見 references）。每週檢視一次；分數 = 機率(1–5) × 影響(1–5)，≥ 12 的風險必須有負責職能與本週行動。

目前已知的前幾大風險（起始版本）：
| 風險 | 機率 | 影響 | 對策 / 觸發點 |
|---|---|---|---|
| 使用者電腦無命令列 → 無法跑 Unity build | 5 | 5 | 已列 TASKS [!]；替代：雲端 headless Unity / GitHub Actions game-ci；M1 前必須解決 |
| 模擬太混亂、玩家覺得靠運氣 | 3 | 5 | 決定性 + 預覽 + 技巧差距指標（game-design skill §9）；M0 Gate 驗證 |
| 落沙效能（Unity 大網格） | 3 | 4 | M1 前做 Burst/Compute 效能尖兵；網格大小設上限 |
| 零預算且不用 AI 美術 → 膠囊圖品質不足 | 4 | 4 | shader/像素程式繪製 + HSU 協助；商店頁前 1 個月專責處理；A/B 兩版膠囊 |
| wishlist 不足（2027-04 < 2,000） | 3 | 4 | 啟用備案時程；加強短影音（連鎖爆炸片段）；主題節 |
| AI 文本揭露引起負評 | 2 | 3 | 文字量最小化；揭露如實；HSU 校對繁中/簡中 |
| session 中斷造成重工/遺失 | 4 | 3 | 本 skill §4–§5 交接紀律；小步提交 |
| 跨平台浮點不一致破壞決定性 | 2 | 4 | 模擬用整數/定點數；CI 決定性測試 |
| HSU 試玩時間不足 | 3 | 3 | 每次試玩包 ≤ 20 分鐘、問題 ≤ 3 題；自動遙測補足 |

## 4. 交接檔維護（最重要的日常工作）

### 開工流程（每個 session，照順序）
1. `pwd`、`git pull`、`git log --oneline -15`
2. 讀 `HANDOFF.md` 最上面一則 → `TASKS.md` → 必要時 `DECISIONS.md`
3. **先驗證現狀沒壞**：跑最基本的 smoke test（原型能開、sim 能跑、Unity build 能過）。壞了就先修，記進 HANDOFF。
4. 從 TASKS 挑**一個**最高優先、自己職能、未被他人標 [~] 的任務，標成 [~] 並寫上 session 時間，先 commit（避免兩個 session 撞同一任務）。
5. 才開始工作。

### 收工流程（每完成一個可驗證的小段，就做一次）
1. 按 DoD（§5）自我驗證。
2. `HANDOFF.md` 最上面加一則（範本見 references）：做了什麼（附檔案路徑）、驗證方式與結果、未完成的確切狀態、卡點、**下一步具體指令**（下一個 session 可以照抄執行）。
3. `TASKS.md` 更新狀態；新發現的工作加為新任務，不要塞進舊任務。
4. 新決策寫 `DECISIONS.md`。
5. `git add -A && git commit -m "<職能>: <做了什麼>" && git push`。

### 三份檔的品質標準
**HANDOFF.md**
- 最新在最上；最上面一則必須能單獨閱讀（不依賴往下翻）。
- 長度控制：超過約 150 行就把舊條目搬到 `docs/handoff/archive/HANDOFF_YYYY-MM.md`，保留最近 3–5 則。
- 「下一步」寫成可執行指令：「執行 `python sim/run.py --bots greedy --n 1000`，若勝率 > 60% 則把 `data/targets.json` 的 k 值 +0.05」，而不是「繼續平衡」。
- 寫清楚環境狀態的改變（新安裝、新權限、壞掉的東西）。
- 誠實：沒驗證就寫「未驗證」；失敗的嘗試也要寫（避免下一個人重試同一條死路）。

**TASKS.md**
- 每個任務一行：`- [ ] T-012 [design] 標題 — 驗收：<可檢查的條件> — 依賴：T-008`
- ID 永不重用；任務**不刪除**，作廢就標 `[-] 作廢（原因，見 D-xx）`。驗收條件只能由製作人放寬並記錄。（Anthropic 研究：不准 agent 刪改驗收項，否則會「把考題改簡單」）
- 任務粒度：一個 session（約 1–3 小時工作量）做得完；做不完就拆。
- `[!]` 卡住一定寫原因與需要誰（常常是 HSU）。
- 依里程碑分段；目前里程碑在最上面。

**DECISIONS.md**（輕量 ADR）
- 每則：編號 D-xx、日期、狀態（提議/已採納/被 D-yy 取代）、決策、背景/理由、放棄的替代方案、後果（這會讓什麼變難）。
- 不改舊條目內容，只改狀態並新增取代者。
- 異議條目：`### 異議 D-xx（日期，職能）`理由 + 建議；由製作人或 HSU 裁定後記錄結果。

### 給 HSU 的請求
人類動作（付款、Steam 後台、試玩、校對）集中列在 HANDOFF 的「需要 HSU」區塊，每項寫清楚：要做什麼、為什麼、預估幾分鐘、截止日。

## 5. Definition of Done（DoD）

**任務級**（全部打勾才可標 [x]）
- [ ] 符合 TASKS 上的驗收條件，且**端到端**驗證過（實際跑起來看結果，不只單元測試）
- [ ] 程式：可編譯、測試通過、headless 可跑；模擬相關有決定性測試
- [ ] 數值/文字只放資料檔與在地化表，沒有寫死字串
- [ ] 新素材已記錄於 `docs/art/ASSET_LICENSES.md`（授權明確、可商用、非生成式 AI）
- [ ] 效能沒有退步（有預算的功能量過）
- [ ] 相關文件已更新（GDD/tech docs）
- [ ] HANDOFF、TASKS 已更新；已 commit 並 push

**里程碑級**：該里程碑 Gate 全部達成 + 該版本 build 存檔（tag `m1-vertical-slice` 等）+ 一份回顧（做得好/不好/下一階段改什麼）寫入 `docs/handoff/archive/`。

**上架級**：Steam 商店與 build 兩份 checklist 都過審（商店頁審核 3–5 個工作天，至少提早 7 天送）；10 語言 UI 走查；存檔相容；崩潰率可接受；退款相關的前 2 小時體驗順暢。

## 6. 每週節奏（範本見 references/templates.md）

| 時點 | 做什麼 | 產出 |
|---|---|---|
| 週一（第一個 session） | 製作人：檢視上週、選本週 3 個目標（≤ 3）、更新風險、排 TASKS 優先序 | `docs/handoff/weekly/YYYY-Www.md` 計畫段 |
| 每個 session | 開工流程 → 一個任務 → 收工流程 | commit + HANDOFF 條目 |
| 週三 | 中間檢查：目標是否會落空？落空就砍範圍，不加班式擴張 | 週報備註 |
| 週五 | 打包可試玩 build/artifact 給 HSU（≤ 20 分鐘、≤ 3 個問題）；更新指標（wishlist、Demo 遊玩時長、平衡報告） | 試玩包 + 指標表 |
| 週末/下週一 | 回顧：做了什麼、沒做到為什麼、學到什麼；調整下週 | 週報回顧段 |

每週追蹤的指標：本週完成任務數 / 計畫數、里程碑預估延遲 %、wishlist 總數與日增（商店頁上線後）、開放風險 ≥ 12 分的數量、HSU 待辦數。

## 7. Steam 行銷時程要點（細節與日期見 references/steam-timeline.md）

- 商店頁：越早越好（Zukowski：wishlist 不會「過期」），最晚上架前 6 個月；上線前要有定案的類型與美術風格、實機開頭的預告片。
- wishlist 目標：Next Fest 進場 ≥ 2,000（< 1,000 進場的遊戲沒有一款跳級）；上架 ≥ 7,000 最低、**10,000+ 目標**（2026-06 改版後 Popular Upcoming 上榜中位約 13k）。若努力半年仍只有約 3,000，就照計畫發售、別燒廣告。
- 首週銷量 ≈ wishlist × 0.1–0.2。
- Demo：先上獨立 Demo 頁、先參加小型主題節，Next Fest 只能參加一次；節後 Demo 保持上架；節後 1–3 個月上架；發售日以獨立公告發布並提早 6 週以上，吃 Personal Calendar 曝光。
- 避開大促與大作檔期（Summer Sale 2027-06-24～07-08、Winter Sale 約 12 月中～1 月初）。

---

## Sources
- Anthropic, Effective harnesses for long-running agents：https://anthropic.com/engineering/effective-harnesses-for-long-running-agents
- Rami Ismail, Milestones：https://ltpf.ramiismail.com/milestones/ ・ Prototypes & Vertical Slice：https://ltpf.ramiismail.com/prototypes-and-vertical-slice/
- Steam Next Fest June 2027（Steamworks）：https://partner.steamgames.com/doc/marketing/upcoming_events/nextfest/june_2027
- 2027 上半年 Steam 節慶日期：https://www.notebookcheck.net/Valve-announces-Steam-Sales-and-Festivals-for-first-half-of-2027.1344181.0.html
- Steamworks 上架流程：https://partner.steamgames.com/doc/store/releasing
- Zukowski 商店頁指南：https://gameworldobserver.com/2025/03/11/steam-page-launch-guide-wishlists-zukowski
- Zukowski wishlist 門檻（含 2026-06 更新）：https://howtomarketagame.com/2022/09/26/how-many-wishlists-should-i-have-when-i-launch-my-game/
- Zukowski Next Fest 基準：https://howtomarketagame.com/2025/03/26/archive-january-2026-benchmarks-how-many-wishlists-can-i-get-from-steam-next-fest/
- Next Fest 後該做什麼：https://www.steampageanalyzer.com/blog/after-steam-next-fest
- 行銷時程：https://presskit.gg/field-guides/indie-game-marketing-timeline
- 本 repo 市場數據：`docs/research/01_steam_market.md`
