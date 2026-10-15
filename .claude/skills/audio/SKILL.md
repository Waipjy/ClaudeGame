---
name: audio
description: Pour Decisions 的音效與音樂規範。用於設計反應 SFX（分層、pitch 變化、voice limiting、依反應數量驅動的 sizzle 音床）、選擇可商用的免費工具與 Freesound CC0 素材、自製 adaptive 音樂（隨倍率疊層）、混音與 LUFS 目標，以及 Unity AudioMixer、pooling、Load Type 實作。任何涉及聲音的工作都先讀這份。
---

# Audio — Pour Decisions

> 核心難題：一個回合內可能同時發生 **數百個反應**。如果每個反應都播一次音效 → 白噪音＋爆音＋CPU 爆掉。
> 解法：**事件聚合**。個別反應只在「稀少」時播單發；數量多時改由「音床（bed）」的音量/密度/濾波表達，再加上計分節奏的單發音。
> 硬規則：不用生成式 AI 音效/音樂；只用白名單工具與 CC0（見 `docs/research/03_assets_legal.md`）；每個引入素材登記到 `docs/art/ASSET_LICENSES.md`（音訊同樣登記於此）。

延伸資料：
- `references/reaction-audio-system.md` — ReactionAudioDirector 架構、voice limiter、sizzle bed、C# 骨架
- `references/music-adaptive.md` — BeepBox 作曲流程、stem 分層、dspTime 同步
- `references/sfx-recipes.md` — 每種材料/反應/UI 的音效配方（jfxr/ChipTone 參數方向＋分層）

---

## 1. 聲音的三個層級（設計原則）

| 層 | 內容 | 播放方式 | 目的 |
|---|---|---|---|
| **A. 計分層（最重要）** | +chips、+mult、遺物觸發、×mult、達標 | 單發，依序，pitch 遞升 | 玩家「聽見分數」——Balatro 的核心爽感 |
| **B. 反應層** | 個別反應的特徵音（嘶、啵、爆、凍裂） | 單發，但嚴格限流 | 告訴玩家「哪種反應發生了」 |
| **C. 音床層（bed）** | 沸騰、燃燒、流動、冒泡的持續 loop | 每類 1 個 looping source，音量/濾波由反應數驅動 | 表達「規模」而不是個數 |

規則：**A > B > C**。A 永遠不能被搶 voice；C 永遠只佔固定 voice 數。

---

## 2. 反應 SFX 設計

### 2.1 分層（layering）
每個重要反應音由 2–3 層組成，各層可獨立隨機：
- **Transient（起音）**：10–40ms 的咔、啵、點擊 → 給清晰度、時間感。
- **Body（主體）**：50–300ms 的嘶、轟、潑濺 → 材料辨識。
- **Tail（尾）**：可選，殘響/泡泡/嗡鳴，大反應才加。
例：Water+Lava → transient「噗」+ body「嘶——」（白噪音帶通濾波下滑）+ tail 蒸氣泡泡。

### 2.2 變化（避免機關槍效應）
- 每個事件 **3–5 個變體**隨機選，且不重複上一次（random without repeat）。
- Pitch 隨機 **±5–8%**（約 ±1 半音）；音量隨機 **±1.5 dB**。
- 計分層例外：pitch **不隨機**，而是**依連擊遞升**（每次 +1 個音階音，走大調或五聲音階，到頂後換高八度或維持）。連擊斷掉重置。

### 2.3 限流（rate limiting）— 500 個反應同時發生時
1. **Per-event cooldown（retrigger time）**：同一事件類型最短間隔 30–60ms。
2. **Per-event 最大同時 voice**：每種反應音最多 3–4 個同時播放；滿了 → 丟棄新的（Prevent New）或停最舊的（Stop Oldest，100ms fade-out，不要硬切）。
3. **全局 SFX 預算**：B 層總共最多 ~16 voices；A 層保留 8；C 層固定 6；音樂 4–8。
4. **合併計數**：每幀把反應按類型計數 `count[type]`，不是每個反應呼叫一次 Play。由 Director 決定：
   - `count` 小（1–3）→ 播單發
   - `count` 中 → 播 1 個單發＋音床加量
   - `count` 大 → 只驅動音床；每 80–120ms 最多一個「代表性」單發，音量依 log(count) 提升（上限 +6 dB）
5. **新聲音 ducking 舊聲音**（可選）：同組新 voice 開始時，同組舊 voice 降 3 dB。

### 2.4 Sizzle / 燃燒音床（granular 概念）
- 每類持續反應（沸騰/蒸發、燃燒、酸蝕、流動）一個 **looping AudioSource**，從開場就播放但音量 0。
- 每幀以平滑後的反應率 `rate`（events/sec，用 0.1–0.2s 時間常數做 exponential smoothing）驅動：
  - `volume = clamp01(log10(1 + rate) / log10(1 + rateMax))`（log 曲線；人耳對數量感知是對數的）
  - Low-pass cutoff 隨 rate 上升（800 Hz → 8 kHz）：少量時悶、多量時刺亮。
  - Pitch 微升（1.0 → 1.08）表示「更熱更激烈」。
- 「Granular」做法（較進階）：把一段 2–3 秒嘶聲切成 30–80ms 的 grains，每秒觸發 `density = f(rate)` 個 grain、隨機起點、短 fade — 密度連續變化比單純音量更自然。先做 loop 版，原型驗證後再升級（AudioClip.SetData 或 OnAudioFilterRead 自己產 grain）。
- 音床總和也要過 Limiter（見 §5）。

### 2.5 UI 音
- 按鈕 hover（極輕、短）、click、購買（收銀「叮」）、無法購買（低沉 buzz）、卡/vial 拿起與放下、回合開始/結束 jingle。
- UI 音不吃任何 reverb，pitch 隨機 ±3% 即可。

---

## 3. 工具（免費、可商用）

| 工具 | 用途 | 產出授權（依 03_assets_legal.md） |
|---|---|---|
| **jfxr**（jfxr.frozenfractal.com） | 程序化 SFX，參數可存成 JSON → 可版控、可程式產生 | 官方：產出「entirely yours」，可商用、免署名 ✅ |
| **ChipTone**（SFB Games） | 程序化 SFX，打擊/爆炸/UI | 官方：產出 CC0 ✅ |
| **Audacity** | 剪輯、分層混合、正規化、LUFS 量測（Analyze → Loudness Normalization） | GPL 工具；產出歸我們 ✅ |
| **BeepBox** | 作曲（瀏覽器，歌曲存在 URL / JSON，可匯出 WAV 與分軌） | 不主張歌曲所有權；商用未明文（低風險） |
| **FamiStudio** | NES 風作曲，可匯出 WAV/分軌 | 產出所有權 **未驗證** |
| Bosca Ceoil | 作曲 | 產出授權 **未驗證** → 備案 |
| sfxr/bfxr/jsfxr | SFX | **未驗證** → 改用 jfxr/ChipTone |
| Kenney 音效包（Interface/Impact/Digital Audio…） | UI、打擊素材 | CC0 ✅（注意辨識度高，需加工） |
| **Freesound（只用 CC0）** | 真實錄音：嘶聲、水、火、玻璃、冰裂 | CC0 ✅；CC-BY 4.0 可用但要署名；**CC-BY-NC、Sampling+ 禁用** |

### Freesound CC0 使用流程
1. 搜尋後在 License 篩選只勾 **Creative Commons 0**。
2. 下載前看作者頁面是否像轉傳他人作品（高辨識度音樂/電影音效 → 不用）。
3. 記錄：`檔名, https://freesound.org/s/<id>/, 作者, CC0, 下載日期` → ASSET_LICENSES.md。
4. 原始檔放 `Game/Assets/Audio/Source/Freesound/`（或 repo 外的 raw 資料夾），加工後輸出到 `Game/Assets/Audio/SFX/`。
5. 一律加工（剪短、EQ、疊層、變調）讓聲音融入本作風格。

### 風格方向（建議）
- 材料反應：**真實錄音（Freesound CC0）＋程序化合成**混合，讓物理感可信。
- 計分/UI：**程序化（jfxr/ChipTone）**，乾淨、有音高，可做成音階。
- 音樂：BeepBox 自製，晶片音色＋柔和 pad，與 CRT/像素美術一致。

---

## 4. 音樂：隨倍率上升的 adaptive layers

詳見 `references/music-adaptive.md`。重點：
- **Vertical layering**：同一首曲（同 BPM、同長度、同調）匯出 4–5 條 stem，同時播放、用音量控制：
  | 層 | 開啟條件（起始值） |
  |---|---|
  | L0 pad/低音 | 永遠開（商店/回合間也開） |
  | L1 鼓（輕） | 回合開始 |
  | L2 主旋律 | mult ≥ 5 或累計分 ≥ 目標 25% |
  | L3 高音 arp/打擊加密 | mult ≥ 20 或 ≥ 目標 75% |
  | L4 高潮層 | 本手有望超過目標（預測值 ≥ 100%）或連鎖反應 > 閾值 |
- 層開關用 **0.5–2 秒淡入淡出**，降層較慢（避免在數值上下抖動時忽開忽關：加 hysteresis，降層門檻比升層低 20%）。
- 所有 stem 用 `AudioSource.PlayScheduled(AudioSettings.dspTime + 0.1)` 同時啟動，保證 sample 對齊。
- 商店/結算：切換到另一首或同首的 L0 版本；用 crossfade 在小節線切換（horizontal resequencing，選用）。
- **Streamer-safe**：自製音樂不註冊 Content ID；商店頁與設定註明可安全直播。

---

## 5. 混音與響度

### 5.1 目標（PC）
- 整體遊戲輸出（代表性 gameplay 30 分鐘以上量測）：**-18 LUFS integrated（±2）**。依據：Sony 建議主機 -24、手持 -18 LUFS；PC 無官方標準，業界常見 -16 ~ -20 → PC 玩家多用耳機與筆電喇叭，取 -18（**假設**，可依參考遊戲量測調整）。
- **True peak ≤ -1 dBTP**。Master bus 最後放 Limiter（Unity 內建可用 `Compressor` 高 ratio 近似；或自己寫 OnAudioFilterRead 的 soft clipper）。
- Loudness range ≤ 20 LU。

### 5.2 類別相對電平（起始值，以 Master 0 dB 為準的 mixer group 音量）
| Group | 相對音量 | 備註 |
|---|---|---|
| Music | -10 ~ -14 dB | 不能蓋過計分音 |
| SFX/Score（A 層） | 0 ~ -3 dB | 最清楚 |
| SFX/Reaction（B 層） | -6 ~ -9 dB | |
| SFX/Bed（C 層） | -12 ~ -18 dB | 背景，靠 rate 驅動上升 |
| UI | -6 ~ -8 dB | |
- **Ducking**：Score 音觸發時 Music 與 Bed 降 3–4 dB（AudioMixer Send → Duck Volume effect，Attack 10ms、Release 300ms）。
- 個別素材先在 Audacity 正規化：短 SFX peak -3 dBFS；音樂 stem 合併後約 -14 LUFS 再由 mixer 降。
- 用 Youlean Loudness Meter（免費版）或 Audacity 量錄下的 gameplay 輸出；**在 Steam Deck 喇叭、筆電喇叭、耳機三種環境聽一次**。

### 5.3 玩家設定
Master、Music、SFX、UI 四個滑桿（0–100% 映射到 dB：`dB = 20*log10(max(v,0.0001))`，存 PlayerPrefs）＋「背景時靜音」選項＋單聲道選項（無障礙）。

---

## 6. Unity 實作基礎

### 6.1 AudioMixer 結構
```
Master (Limiter/Compressor 最後)
├─ Music
├─ SFX
│  ├─ Score     (priority 高，duck 其他)
│  ├─ Reaction
│  └─ Bed
└─ UI
```
- Mixer 樹保持淺（≤3 層），不在靜音路徑上掛效果（CPU）。
- Exposed parameters：`MasterVol`、`MusicVol`、`SFXVol`、`UIVol`，供設定選單用。

### 6.2 Pooling
- **不要** `Instantiate` AudioSource 或用 `PlayClipAtPoint`（會產生 GameObject + GC）。
- 預先建立 pool：Score 8、Reaction 16、UI 6、Bed 6（固定 loop）、Music 6（stems）。
- 本作 2D，所有 SFX `spatialBlend = 0`（2D）；若要左右定位，用 `panStereo = (x/width)*2-1` × 0.6（不要全偏）。
- `AudioSource.priority`：Score/UI = 0–32，Music = 0，Reaction = 128（預設），Bed = 200。
- Project Settings → Audio：Real voices 48（預設 32，不必超過 ~64）、Virtual voices 512。

### 6.3 Import 設定（Load Type）
| 類型 | Load Type | 壓縮 | 其他 |
|---|---|---|---|
| 短 SFX（<1s，頻繁） | Decompress On Load | Vorbis q70 或 ADPCM | Force To Mono ✅ |
| 中等（1–5s）、音床 loop | Compressed In Memory | ADPCM（CPU 低）或 Vorbis | 無縫 loop 用 WAV 原檔切好零交越點 |
| 音樂 stems | Streaming | Vorbis q60–70 | **注意**：4–5 條同時 streaming 是 4–5 個 I/O 流；若有同步問題改 Compressed In Memory |
| 全部 | Preload Audio Data ✅；非必要大檔 Load In Background ✅ | Sample rate：Preserve（素材統一 48 kHz） | |

### 6.4 計時
- 計分音序列用 `AudioSettings.dspTime` 排程（不要用 coroutine + WaitForSeconds，會飄）。
- 動畫與聲音的同步以聲音為主時鐘：動畫在 `PlayScheduled` 的時間點觸發。

---

## 7. 提交前音訊清單

- [ ] 新素材來源為 jfxr/ChipTone/自製/Freesound CC0/Kenney，已登記 ASSET_LICENSES.md（含 URL、作者、授權、日期）
- [ ] 無生成式 AI 音訊
- [ ] 每個高頻事件有 3–5 變體、pitch ±5–8%（計分音除外：遞升音階）
- [ ] 壓力測試：同時 500+ 反應時無爆音、無嗡嗡白噪、real voices 未滿（Profiler → Audio 檢查）
- [ ] 音床音量隨反應數平滑變化，沒有「抽搐」
- [ ] 計分音（A 層）在最混亂時仍清楚可聽（ducking 有效）
- [ ] 音樂層升降有 hysteresis，不會每秒切換
- [ ] 錄 30 分鐘 gameplay 量測：-18 ±2 LUFS、true peak ≤ -1 dBTP
- [ ] 四個音量滑桿有效、儲存、0% 為真正靜音
- [ ] Import 設定符合 §6.3；短 SFX 為 mono
- [ ] 無 PlayClipAtPoint / runtime Instantiate AudioSource
- [ ] Steam Deck 喇叭、筆電、耳機各聽過一次
- [ ] 視窗失焦時依設定靜音

---

## Sources
- 本專案授權研究：`docs/research/03_assets_legal.md`
- jfxr：https://github.com/ttencate/jfxr ／ https://jfxr.frozenfractal.com/
- ChipTone：https://sfbgames.itch.io/chiptone
- BeepBox：https://beepbox.co/ ；FamiStudio：https://famistudio.org/
- Freesound FAQ（授權）：https://freesound.org/help/faq/
- Audiokinetic – Mastering a Game with Wwise Part 1（Sony：主機 -24、手持 -18 LUFS、-1 dBTP、LRA 20）：https://audiokinetic.com/en/mastering-a-game-with-wwise-part1
- Designing Sound – Garry Taylor 訪談（遊戲響度標準）：https://designingsound.org/2012/07/30/video-games-and-loudness-standards-interview-with-sonys-garry-taylor/
- Bugnet – How loud should your game be（-16~-20 LUFS）：https://bugnet.io/blog/how-loud-should-your-game-be
- Audiokinetic – How to get a hold on your voices（playback limit、voice 預算）：https://blog.audiokinetic.com/how-to-get-a-hold-on-your-voices-optimizing-for-cpu-part-1/
- Unreal Sound Concurrency（resolution rules、retrigger time、volume scaling）：https://dev.epicgames.com/documentation/unreal-engine/sound-concurrency-reference-guide
- GameDevBeginner – Unity audio optimisation（Load Type、voices、priority）：https://gamedevbeginner.com/unity-audio-optimisation-tips/
- Unity – AudioSource.priority：https://docs.unity3d.com/ScriptReference/AudioSource-priority.html
- Unity – AudioConfiguration：https://docs.unity3d.com/ScriptReference/AudioConfiguration.html
- Balatro 回饋設計（音階遞升計分音）：https://blakecrosley.com/zh-Hant/guides/design/balatro
- Vertical layering 概念：https://sounddesign.irpr.agency/glossary/vertical-layering/
