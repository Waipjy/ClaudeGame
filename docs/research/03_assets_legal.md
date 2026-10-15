# 03 素材、授權與法務研究（Assets & Legal）

> 研究日期：2026-10-16。僅網路研究，非法律／稅務意見。標記「未驗證」者為未能從官方一手來源確認的資訊，上線前須再查。
> 前提：Claude 以 Unity 6 獨立開發 PC 商業遊戲，上架 Steam；素材與工具零花費；擁有者為台灣個人。

---

## 0. 結論速覽

1. **預設只用 CC0**（Kenney、Quaternius、ChipTone/jfxr 產出、CC0 篩選後的 OpenGameArt/Freesound）。CC-BY 可用但必須維護 `CREDITS.md` 與遊戲內 Credits 畫面。**禁止**：CC-BY-NC、Sampling+、CC-BY-SA／GPL 美術（除非願意整體同授權）、來源不明的 itch.io 包、zpix 字型（商用需付費）。
2. **音樂是 Content ID 風險最高的類別**。直播主／YouTuber 被認領會直接傷害曝光。優先「自己用 BeepBox / FamiStudio / Bosca Ceoil 作曲」或 CC0 音樂；避免 Pixabay 音樂與熱門 Kevin MacLeod 曲目（見 §1.6）。
3. **Unity Personal**：近 12 個月營收＋募資 < US$200,000 免費；Unity 6 起「Made with Unity」啟動畫面可關閉；Runtime Fee 已於 2024-09-12 取消。
4. **台美無租稅協定** → Steam 分潤（歸類為 royalties）**預設預扣 30%**。H.R.33（美台加速雙重課稅減免法案）2025-01-15 眾院 423-1 通過，參院 S.199 截至 2026-01 仍未通過；2026-10 時點是否成法 **未驗證**（目前查到仍為「Still just a bill」）。
5. **AI 揭露**：本專案若美術／文字／翻譯全部非 AI 生成（或手作程序化），只有 AI 寫程式碼，依 2026-01 規則不需揭露 → 應刻意保持這條線，避免揭露標籤帶來的評論數劣勢（§2）。

---

## 安全素材白名單

| 來源 | 授權 | 署名文字（建議放 Credits） | Content-ID 風險 | 備註 |
|---|---|---|---|---|
| Kenney.nl（全部資產頁素材） | CC0 | 不需要；可選：`Assets by Kenney (www.kenney.nl), CC0` | 極低（SFX／jingle） | 不可使用 Kenney 商標 logo |
| Quaternius | CC0 | 不需要；可選：`3D models by Quaternius (quaternius.com), CC0` | 無（3D） | |
| Poly Pizza | 逐件標示 CC0 或 CC-BY | CC-BY 件：`"<模型名>" by <作者> via Poly Pizza, CC-BY 3.0/4.0, <URL>` | 無 | 每件都要看標籤（官方 FAQ 本次抓取失敗，**未驗證**細節） |
| OpenGameArt（篩選 CC0 / CC-BY / OGA-BY） | 逐件 | `"<標題>" by <作者>, <授權>, <URL>`（先看頁面的 Attribution Notice） | 音樂：低～中（需看作者是否註冊 CID） | 預覽圖視為 All rights reserved；CC-BY-SA/GPL 排除 |
| Freesound（只用 CC0、CC-BY 4.0） | CC0 / CC-BY | `"<sound>" by <user> (https://freesound.org/s/<id>/) licensed under CC BY 4.0` | 極低（SFX） | 排除 CC-BY-NC、Sampling+ |
| ChipTone 產出的音效 | CC0（官方聲明） | 不需要 | 無 | |
| jfxr 產出的音效 | 「完全屬於你」，可商用 | 不需要 | 無 | 工具本身 BSD-3 |
| sfxr / bfxr / jsfxr 產出 | 一般視為使用者所有 | 不需要 | 無 | 官方聲明 **未驗證**；建議改用 jfxr／ChipTone（有明文） |
| 自製音樂：BeepBox | 不主張歌曲所有權（程式 MIT） | 不需要 | 無（除非我們自己註冊） | 商用未明文，但所有權在作者 |
| 自製音樂：FamiStudio / Bosca Ceoil | 工具為開源；產出所有權 **未驗證** | 不需要 | 無 | Bosca Ceoil 為 LGPL 工具，論壇有人質疑產出授權，官方未答（**未驗證**） |
| Kevin MacLeod（incompetech） | CC BY 4.0 | `"<曲名>" Kevin MacLeod (incompetech.com)` / `Licensed under Creative Commons: By Attribution 4.0 License` / `http://creativecommons.org/licenses/by/4.0/` | **中**：官方已預註冊以擋假認領，但第三方冒認、自動認領屢有回報；直播主需放署名並申訴（72h 內通常解除） | 只當備案 |
| Pixabay 音樂 | Pixabay Content License（免署名、可商用、禁單獨轉售） | 不需要 | **高**：上傳者未經審核，可能日後被註冊 CID，Pixabay 無法向 YouTube 代為放行 | **不建議** 用於遊戲 BGM |
| FreePD | 原為公有領域 | — | — | **網站已永久關閉**，無法再取得／驗證，排除 |
| 字型：Cubic 11（俐方體11號） | SIL OFL 1.1 | 隨遊戲附 `OFL.txt`；可選署名 | 無 | 涵蓋 Big5 常用字、注音；可商用；不可單獨販售字型 |
| 字型：Fusion Pixel Font（縫合像素字型） | SIL OFL 1.1（建置程式 MIT） | 附 `OFL.txt`（含其上游 Ark Pixel、Cubic 11 等授權） | 無 | 有 zh-Hant/zh-TW 版本；8px 日文漢字源自美咲字型（非 OFL 的寬鬆授權，**需再看授權檔**） |
| 字型：Noto Sans / Noto Sans TC/CJK | SIL OFL 1.1 | 附 `OFL.txt` | 無 | 一般知識，**本次未逐頁驗證** |
| 字型：Kenney Fonts | CC0 | 不需要 | 無 | 僅拉丁字母 |
| Unity Asset Store 免費資產 | Standard Unity Asset Store EULA（嵌入遊戲可商用） | 依個別資產；非標準授權者會標「Non-standard」 | 視內容 | 避開標示 Restricted、SDK 類 |

**黑名單**：zpix（最像素）— 商業單一產品授權 US$1,000，且禁止修改／轉換／拆分；任何 CC-BY-NC / Sampling+；未附授權文字的 itch.io 包；CC-BY-SA / GPL 美術；AI 生成圖庫素材（會觸發 Steam 揭露）。

---

## 1. 免費商用素材詳述

### 1.1 Kenney.nl
- 官方支援頁：資產頁素材皆為 **CC0**，「even in commercial projects」，署名非必要，可寫「Kenney」；Kenney logo 保留給官方專案。
- 2D/UI/特效/字型/音效重點包（包名依記憶，**下載時再確認**）：UI Pack（含 Pixel/Sci-fi/RPG 變體）、Game Icons、Input Prompts（鍵盤/手把按鍵圖示，Steam Deck 很實用）、Particle Pack、Pixel Platformer、Tiny Dungeon/Tiny Town、1-Bit Pack、Kenney Fonts；音效：Interface Sounds、UI Audio、Impact Sounds、Digital Audio、RPG Audio、Music Jingles、Casino Audio。
- 陷阱：Kenney 素材辨識度高（「Kenney 臉」），評論者可能覺得像素材拼湊 → 需調色／二次加工維持統一風格。

### 1.2 OpenGameArt
- 依其 FAQ：CC0 無義務；CC-BY 要註明作者、標題、授權、連結、是否修改；**CC-BY-SA 衍生物須同授權**；**GPL** 是為程式碼寫的，對閉源遊戲美術影響不明，FAQ 要閉源開發者自行理解風險。
- CC-BY / CC-BY-SA 有「不可加 DRM」條款爭議；FAQ 指出 Steam 視封裝方式而定。→ 本專案不啟用 Steamworks DRM wrapper（CEG），或乾脆以 CC0/OGA-BY 為主（OGA-BY 已刪除 DRM 限制）。
- 多重授權作品：任選一個授權遵守即可（多選 CC0 / OGA-BY / CC-BY）。
- 預覽圖預設 All rights reserved，只能用下載檔。
- 陷阱：有使用者上傳他人作品（洗授權）。高辨識度作品要反查作者其他平台。

### 1.3 itch.io 免費素材包
- itch.io 不強制統一授權；每包由作者自訂。驗證流程：
  1. 讀頁面描述與附帶的 `LICENSE`/`readme`，**截圖存檔**（含日期、URL）到 `docs/licenses/`。
  2. 需明確出現「commercial use allowed」；常見附帶條件：需署名、不可轉售／再散布素材本身、不可用於 NFT/AI 訓練。
  3. 出現「personal use only」、「non-commercial」、「free for jams」或沒寫 → 排除。
  4. 作者若標 CC0 但素材明顯是知名作品風格／抄襲 → 排除。
- 未驗證：itch.io 有無平台層級預設授權（本次未查到，推定無）。

### 1.4 Quaternius / Poly Pizza
- Quaternius FAQ：全部模型 **CC0**，商業可用，不需署名，可修改與混用。
- Poly Pizza：彙整多來源低多邊形模型，部分 CC0、部分 CC-BY（例如原 Google Poly 作品多為 CC-BY）。每件下載頁會標示（**未驗證**：官方 FAQ 抓取失敗）。

### 1.5 Freesound
- CC0：幾乎任意使用（不可宣稱自己是作者）。CC BY：可商用但要署名。**CC BY-NC：不能賺錢 → 商業遊戲禁用**。Sampling+：舊授權、近 NC 且禁商業廣告 → 禁用。
- 官方署名格式見白名單；可用網站「attribution list」匯出下載過的檔案清單。
- 搜尋時用 License 篩選器只勾 CC0（必要時 Attribution）。

### 1.6 音樂與 Content ID（關鍵）
- 「Royalty-free」≠「不會被 Content ID 認領」。第三方會把熱門免費曲註冊進 Content ID；一旦日後被註冊，所有舊影片也會一起被認領。
- **Kevin MacLeod / incompetech**：免費版為 CC BY 4.0，遊戲中 Credits 畫面署名即可。官方稱已「預先註冊」以阻止錯誤認領；若被認領：先在影片說明加署名 → 再申訴，通常 72 小時內解除；大量可申請批次解除或寄 help@incompetech.com。但其曲目被數百萬影片使用，辨識度高、易被誤認，對直播主仍有摩擦 → **中風險**。
- **Pixabay 音樂**：授權本身免署名可商用，但平台不審核上傳者權利、無 Content ID 整合，無法代為向 YouTube 放行 → **高風險，排除**。
- **FreePD**：網站已永久關閉 → 排除。
- **OpenGameArt 音樂**：多數作者不註冊 CID，但無保證 → 選 CC0 並在 Steam 頁面註明「本遊戲音樂可安全用於直播」。
- **最佳解**：自製音樂（BeepBox／FamiStudio／Bosca Ceoil）。我們不註冊 Content ID，就不會有認領；在商店頁與遊戲內明載「Streamer-safe：所有音樂可自由用於影片與直播」。另可考慮遊戲內「Streamer mode」關閉非自製音樂（備案）。

### 1.7 字型（含 CJK 像素字）
- **Cubic 11 俐方體11號**：OFL 1.1，源自 M+ gothic 12r；「任何人可以無償使用此字型，包含商用」；打包需附 OFL.txt；修改版仍須 OFL 且不得使用保留名稱「Cubic／俐方體」；禁止單獨販售字型檔。涵蓋教育部 4,808 常用字、Big5 一級 5,401 字、注音、台語客語用字。
- **Fusion Pixel Font**：OFL 1.1；8/10/12px，有 zh-Hant、zh-TW、zh-HK 版本；作者自稱是「基於補丁的字型方案」，語言特定字形品質不要期待過高。8px 日文漢字源自美咲字型（作者說與 OFL 相容的無類型授權）。
- **zpix 最像素**：**商業授權需付費（單一產品 US$1,000）**，且禁止修改／轉換 → **禁用**（零花費規則）。
- **Noto Sans TC / Noto Sans CJK**：OFL 1.1（**本次未逐頁驗證**，屬一般知識）。
- Unity 注意：TextMeshPro 將字型轉成 SDF 字圖集屬「嵌入使用」，OFL 允許；但不要另外把 .ttf 當作可提取素材販售。附 `OFL.txt` 於建置資料夾與 Credits。

### 1.8 Unity Asset Store 免費資產
- 統一適用 Standard Unity Asset Store EULA；資產「嵌入並整合」進含大量原創內容的遊戲時可商用散布；不得讓使用者單獨提取資產。
- 標「Non-standard」者看賣家授權；標「Restricted」者通常含限制散布的開源元件 → 避開。
- SDK 類資產未經發行者許可不得在 runtime 隨遊戲散布。
- Extension Assets（編輯器工具）需每位使用者一個 seat。
- EULA FAQ 未提及 AI；**未驗證**：Asset Store 條款是否限制 AI 代理操作／使用。

### 1.9 音效／音樂工具產出的可商用性
| 工具 | 產出授權 | 狀態 |
|---|---|---|
| ChipTone（SFB Games） | 官方：所有產出音效 CC0，任何用途含商用 | 已驗證 |
| jfxr | 官方：「Any sound you create with jfxr is entirely yours」，含商用，不需署名 | 已驗證 |
| sfxr / bfxr / jsfxr | 社群普遍視為使用者所有、可商用 | **未驗證**（建議以 jfxr/ChipTone 取代） |
| BeepBox | 官方：不主張歌曲所有權；程式 MIT | 所有權已驗證；商用未明文 |
| FamiStudio | 開源（MIT，**未驗證**）；產出歸使用者 | **未驗證** |
| Bosca Ceoil | 工具為 LGPL；論壇曾有人疑問產出授權，未獲官方回答 | **未驗證**（一般而言程式授權不及於使用者創作的輸出） |

---

## 2. 玩家對 Steam AI 揭露的反應數據

- **GameDiscoverCo 調查（2026-06-25～07-02，約 3,800 名 Steam 玩家，PC Guide 2026-07-09 報導）**：對有 AI 揭露的遊戲，43% 不太在意、26% 中立、31% 負面；**8% 表示會拒買**。44% 會仔細讀揭露、45% 掃一眼、11% 不看。只有 17% 相信開發者會完整揭露。**56% 認為連「提升效率的開發工具（如寫程式助手）」也應揭露**（雖然 Steam 規則已不要求）。
- **研究（Digital Citizen 2026-06-23 報導，原研究未具名 → 部分未驗證）**：2025 年 1–10 月約 10,000 款 Steam 新作，21% 有 AI 揭露。首月平均評論數 4 vs 7；控制變數後揭露遊戲評論數約少 **53%**；零評論比例約 20% vs 15%；100+ 評論者好評率 84.6% vs 88.3%。報導稱非因果證明。
- 對本專案的意涵：
  1. 美術、文字、翻譯、商店頁圖像都不要用生成式 AI，保持「無需揭露」。
  2. 由於 56% 玩家認為寫程式工具也應揭露、且「AI 做的遊戲」本身是話題，是否在商店頁主動說明「程式由 Claude 撰寫、美術為 CC0 素材＋手工／程序化」是行銷決策——主動透明可能吸引好奇者，也可能吸引反 AI 負評。**建議**：不放在商店頁 AI 揭露欄（規則未要求），但在開發日誌坦白說明，避免日後「被抓包」反彈。

---

## 3. Unity Personal（2025–2026）

- 資格：個人或小型組織，**近 12 個月營收＋募資 < US$200,000**（2024-09-12 公告從 $100K 調高；官網內文與 FAQ 皆為 $200K，但 meta 描述仍寫 $100K，以內文為準）。
- **Runtime Fee 已取消**（2024-09-12 公告，遊戲客戶立即生效）。
- **啟動畫面**：「Made with Unity splash screen will become optional for Unity Personal games made with Unity 6」→ Unity 6 Personal 可關閉。
- Pro/Enterprise 調價 2025-01-01 生效（與本專案無關）。
- Unity ToS 於某年 6/30 更新（enginesdatabase 2026-08 文章提及，年份未明，**未驗證**內容）。
- 注意：必須用 Unity 6 系列（6000.x）才享有可選啟動畫面。

---

## 4. Steamworks 個人（台灣）上架流程

### 4.1 帳號、身分、銀行
- 法定名稱需與官方文件完全一致（不可用暱稱/DBA）。可以個人身分註冊。
- **銀行帳戶名稱必須與 Legal Name 相同**；需提供帳號、銀行地址（及國際匯款所需 SWIFT 代碼）。建議開立**本人名下外幣（美元）帳戶**以接收電匯、避免逐筆換匯（台灣銀行端的中轉手續費金額 **未驗證**）。
- 身分驗證與銀行、稅務資料一併完成。

### 4.2 稅務面談（Tax Interview）
- 非美國人填 **W-8BEN** 等同資訊；驗證需 **10–15 個工作天**，期間不能修改。
- Valve 將分潤歸類為 **royalties**，預扣率 0–30%。**與美國無所得稅協定的國家，IRS 要求預扣 30%**。台灣目前無正式協定 → **預扣 30%**。
- 可在台灣申報時作為**國外已納稅額扣抵**（僅限最低稅負制下的扣抵，**需諮詢會計師**）。
- Valve **不退還**已預扣金額（日後稅率調降不溯及既往）。外國 TIN：可填身分證字號（**未驗證**是否被 Valve 系統接受，一般做法如此）。
- **H.R.33 美台加速雙重課稅減免法案**：2025-01-15 眾院 423-1 通過；參院 S.199（Crapo 提案）待審。FAPA 2026-01-19 文章仍呼籲參院通過 → 截至 2026-01 **未成法**。該法案若通過，royalties 預扣可降（法案版本 10%，**未驗證**），且尚需台灣對等立法。2026-10 現況 **未驗證**（第三方追蹤網站顯示「Still just a bill」）。
- 台灣端：全戶海外所得 ≥ NT$100 萬須申報；基本所得額扣除額 NT$750 萬（2024、2025 年度同額）。Steam 收入對台灣個人屬海外所得或其他所得類別 **未驗證**，量小時影響不大，但仍建議留存 1042-S 與匯款紀錄。

### 4.3 費用、等待期、審核
- 每款 US$100 上架費（已知：收入達 $1,000 返還）。
- 等待期：官方 onboarding 文件寫「首幾款作品付費後須 21 天才能發售」；brief 已知為 30 天 → **兩者矛盾，以 Steamworks 後台實際顯示為準（未驗證）**。
- 商店頁與建置（build）審核各需 **1–5 天**；Coming Soon 至少 2 週（已知）。
- 實務排程：付費 → 稅務／銀行驗證 10–15 工作天 → 商店頁審核 → Coming Soon ≥ 2 週 → build 審核 → 發售。

### 4.4 商店頁素材規格
| 資產 | 尺寸（px） | 備註 |
|---|---|---|
| Header Capsule | 920×430 | 縮圖由此產生 |
| Small Capsule | 462×174 | logo 幾乎填滿 |
| Main Capsule | 1232×706 | 首頁輪播 |
| Vertical Capsule | 748×896 | 季節特賣首頁 |
| Page Background | 1438×810 | 選用；未上傳則以最後一張截圖生成 |
| Library Capsule | 600×900 | |
| Library Header | 920×430 | |
| Library Hero | 3840×1240 | 不放文字/logo |
| Library Logo | 寬 1280 和/或 高 720，透明 PNG | |
| 截圖 | ≥5 張，16:9，≥1920×1080 | 只能是實機畫面；至少標記 4 張「適合所有年齡」 |
- 預告片：.mp4/.mov/.wmv；最高 1920×1080；30 或 60fps；≥5,000 Kbps；H.264＋AAC 44.1/48kHz；16:9。前兩支在截圖前顯示；開頭 10 秒要抓人、考量靜音觀看。無長度限制規定。
- 膠囊圖不可用 AI 生成（會觸發揭露）→ 以遊戲內素材＋Krita 排版、字型用 OFL 字型。

---

## 5. 免費工具鏈

| 工具 | 授權 | 用途 | 商用產出 |
|---|---|---|---|
| Blender | GPL（程式）；產出歸使用者 | 3D、渲染膠囊圖 | 可 |
| Krita | GPL；產出歸使用者 | 繪圖、膠囊圖排版 | 可 |
| LibreSprite | GPLv2（Aseprite 舊開源分支） | 像素畫、動畫 | 可 |
| Pixelorama | MIT（Godot 製） | 像素畫、動畫、可 CLI 匯出 | 可 |
| Audacity | GPL | 音效剪輯、正規化 | 可 |
| OBS Studio | GPL | 錄製實機畫面、預告片素材 | 可 |
| DaVinci Resolve（免費版） | 專有免費軟體 | 預告片剪輯 | 普遍認為可商用（Blackmagic 論壇說法，**官方 EULA 未逐條驗證**）；免費版輸出上限 UHD 60fps，足夠 1080p 預告 |
| ffmpeg | LGPL/GPL | 轉檔、預告片自動化編碼（H.264/AAC） | 可；僅當工具使用，**不要**把 ffmpeg 二進位打包進遊戲 |
| BeepBox / FamiStudio / Bosca Ceoil | 見 §1.9 | 作曲 | 見 §1.9 |
| ChipTone / jfxr | 見 §1.9 | 音效 | 可（明文） |
（工具授權欄大多為一般知識，本次未逐一開官方頁面驗證，標為 **未驗證（低風險）**。）

自動化友善度（Claude 無 GUI 時）：ffmpeg、Blender（`blender -b` Python）、Pixelorama CLI、jfxr（網頁，參數 JSON 可程式生成，**未驗證**）比較適合；DaVinci Resolve 免費版腳本 API 受限（**未驗證**），預告片建議以 ffmpeg 腳本剪接 Unity Recorder 錄影。

---

## 6. 授權作業規範（給專案）

1. 每個外部素材記錄於 `docs/licenses/ASSETS.csv`：檔名、來源 URL、作者、授權、下載日期、授權頁截圖檔名。
2. 遊戲內 Credits 畫面＋建置資料夾 `CREDITS.txt`＋`OFL.txt`；Steam 商店頁簡述「Streamer-safe music」。
3. 只允許授權：CC0、CC-BY 3.0/4.0、OGA-BY、OFL、Unity Standard EULA、工具明文「產出歸你」。
4. 任何 AI 生成的圖像、文字、語音、翻譯一律不得進入遊戲或商店頁（否則須揭露）。

---

## Sources
- Kenney 授權：https://kenney.nl/support
- Quaternius FAQ：https://quaternius.com/faq.html
- OpenGameArt FAQ：https://opengameart.org/content/faq
- Freesound FAQ：https://freesound.org/help/faq/
- Pixabay License Summary：https://pixabay.com/service/license-summary/
- Pixabay Content ID 風險分析：https://hellothematic.com/thematic-vs-pixabay/
- FreePD（已關閉）：https://freepd.com/
- incompetech 授權：https://incompetech.com/music/royalty-free/licenses/
- incompetech FAQ（署名格式）：https://incompetech.com/music/royalty-free/faq.html
- incompetech Content ID：https://incompetech.com/music/royalty-free/youtube-contentid.html
- Content ID 與免費音樂：https://www.foximusic.com/blog/content-id-safe-music-youtube-monetization-guide/
- ChipTone：https://sfbgames.itch.io/chiptone
- jfxr：https://github.com/ttencate/jfxr
- BeepBox：https://beepbox.co/
- Bosca Ceoil 授權討論：https://lpc.opengameart.org/node/122232
- FamiStudio：https://famistudio.org/
- Cubic 11：https://github.com/ACh-K/Cubic-11
- Fusion Pixel Font：https://github.com/TakWolf/fusion-pixel-font
- zpix：https://github.com/SolidZORO/zpix-pixel-font
- Unity Asset Store EULA FAQ：https://assetstore.unity.com/browse/eula-faq
- Unity 取消 Runtime Fee：https://unity.com/blog/unity-is-canceling-the-runtime-fee
- Unity Personal：https://unity.com/products/unity-personal
- Unity 授權 2026 概況：https://enginesdatabase.com/blog/state-of-unity-licensing-in-2026/
- GameDiscoverCo 調查報導：https://www.pcguide.com/news/pc-gamers-remain-skeptical-of-steams-ai-disclaimers-poll-shows-many-believe-game-devs-are-hiding-it/
- AI 揭露與評論數研究報導：https://www.digitalcitizen.life/steam-games-that-disclose-ai-use-may-sell-far-less-new-study-finds/
- Steamworks Onboarding：https://partner.steamgames.com/doc/gettingstarted/onboarding
- Steamworks Tax FAQ：https://partner.steamgames.com/doc/finance/taxfaq
- 商店素材規格：https://partner.steamgames.com/doc/store/assets/standard
- 收藏庫素材規格：https://partner.steamgames.com/doc/store/assets/libraryassets
- 預告片規格：https://partner.steamgames.com/doc/store/trailer
- H.R.33／S.199（FAPA）：https://fapa.org/issues/u-s-taiwan-expedited-double-tax-relief-legislation
- FAPA 2026-01-19：https://fapa.org/?p=27977
- RSM 眾院通過：https://rsmus.com/insights/tax-alerts/2025/house-passes-us-taiwan-double-tax-relief-act.html
- H.R.33 追蹤：https://www.usquery.com/bill/119/hr/33
- 海外所得申報（聯合報 2026-06）：https://udn.com/news/story/7243/9588797
- DaVinci Resolve 免費版商用討論：https://forum.blackmagicdesign.com/viewtopic.php?p=905205
