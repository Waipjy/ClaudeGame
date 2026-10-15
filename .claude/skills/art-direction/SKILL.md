---
name: art-direction
description: Pour Decisions 的美術方向規範。用於定材料調色盤、落沙粒子上色與發光、URP 後處理（bloom、LUT、CRT）、Pixel Perfect Camera、Balatro 式計分 UI 與 juice、16–32px 圖示、Steam 膠囊圖，以及提交前的視覺 QA。只要工作涉及顏色、shader、UI 外觀、圖示或商店圖，就先讀這份。
---

# Art Direction — Pour Decisions

> 畫面約 80% 是模擬像素。美術預算只花在：**材料調色盤、發光/後處理、UI、圖示、Steam 膠囊圖**。
> 硬規則：不用生成式 AI 圖像（會觸發 Steam 揭露）；外部素材只用白名單（`docs/research/03_assets_legal.md`），並登記到 `docs/art/ASSET_LICENSES.md`。
> 我們的強項：shader、程序化繪製、色彩數學。弱項：手繪插畫 → 所有決策都往「用程式算出來」傾斜。

延伸資料（需要細節時才讀）：
- `references/material-palette.md` — 14 種材料的 ramp、HEX、噪聲與發光參數（起始值）
- `references/urp-postfx.md` — URP Volume 配方、CRT shader 規格、Pixel Perfect 設定
- `references/ui-juice.md` — Balatro UI 拆解、計分動畫時序、easing 數值
- `references/steam-capsule.md` — 膠囊圖規格、Valve 規則、非插畫師的做法

---

## 1. 色彩理論（照這個順序決定）

### 1.1 Value（明度）先於 Hue
- 先用灰階設計畫面：轉成灰階（`luma = 0.299R + 0.587G + 0.114B`，或 OKLab L）後，**背景、材料、UI 仍要分得出層次**。灰階分不開的東西，換色也救不了。
- 本作明度分層（目標 L，OKLab 0–1）：
  | 層 | L 範圍 | 內容 |
  |---|---|---|
  | 背景/燒杯內壁 | 0.12–0.22 | 深、低飽和、偏冷紫 |
  | 惰性材料（stone、sand、gunpowder、seeds） | 0.30–0.65 | 中明度、中低飽和 |
  | 流體（water、oil、acid） | 0.35–0.75 | 中明度，靠動態與半透明辨識 |
  | 反應/發光（fire、lava、spark、得分粒子） | 0.75–1.0 + HDR | 全場最亮最飽和 |
  | UI 數字/按鈕 | 0.85–1.0 | 在獨立面板上，靠面板底色區隔 |
- 規則：**焦點必須是最亮、最飽和的東西**。焦點 = 正在反應的位置 + 計分數字。其他東西不准比它亮。

### 1.2 Hue shifting（色相偏移）
- 一條 ramp（暗→亮）不是只調明度：**亮部往暖（黃）偏、暗部往冷（藍/紫）偏**。每格偏 10–20°，20° 為上限（Slynyrd Pixelblog 1）。
- 不要用「加黑」做陰影、「加白」做亮部 → 會變髒、變灰（pillow/muddy）。
- 飽和度曲線：中段最高，兩端下降但不到 0 或 100%；暗色可以比亮色更飽和。**避免同時高飽和 + 高亮度**（刺眼），那個位置保留給發光材料。

### 1.3 飽和度階層
- 飽和度是第二個注意力磁鐵。分三級：
  1. **高**：發光材料、得分特效、Mult 數字。
  2. **中**：一般材料主色、可互動 UI。
  3. **低**：背景、燒杯玻璃、面板、非互動文字。
- 背景飽和度 ≤ 25%（HSV S）。整體畫面「大部分低飽和、少數高飽和」才會有焦點。

### 1.4 有限調色盤（limited palette）
- 用**單一主調色盤**，所有材料、UI、圖示都只從中取色。好處：一致性自動成立，AI 代理不會各自亂選色。
- 起點：**Resurrect 64**（lospec.com/palette-list/resurrect-64），64 色、ramp 已做好 hue shift、暗部偏紫，適合暗背景＋發光。備選：Endesga 32、Apollo（46 色）、AAP-64。調色盤色值本身不受著作權保護，Lospec 頁面可記來源但非必要（假設，低風險）。
- 自建流程（若需要）：
  1. 選一個鮮豔中間色（S、B 最重要，H 隨意）。
  2. 往兩側展開 5–9 格：B 由暗到亮（越接近 100 步距越小），S 中段最高，H 每格 +10~20°（往亮偏暖）。
  3. 整條 ramp 旋轉 H 45° 產生其他色族。
  4. 中段複製一份、去飽和 → 中性灰 ramp（UI/背景用）。
  5. 所有色值放 `Game/Assets/Art/Palette/palette.png`（1px 一色）＋ C# `PaletteSO`，**程式只引用 index，不寫死 HEX**。
- 允許的例外：HDR 發光值（>1.0）只能由 palette 色乘強度產生，不另造新色。

---

## 2. 可讀性規則

1. **灰階測試**：每次改色都截圖轉灰階檢查（QA 清單第 1 項）。
2. **相鄰材料必須在 value 或 hue 至少一項有明顯差**：ΔL（OKLab）≥ 0.08 或 Δhue ≥ 40°。易混組合要特別處理：
   - fire vs lava vs sand（都是暖色）→ fire 最亮且動、lava 暗紅底＋亮紋且慢、sand 不發光且中明度。
   - acid vs plant（都是綠）→ acid 黃綠＋微發光＋氣泡、plant 深藍綠不發光。
   - steam vs smoke → steam 白、偏冷、上升快；smoke 灰紫、較暗、擴散慢。
3. **色盲**：不能只靠紅/綠區分。每種材料另有一個非色彩特徵（動態、紋理噪聲型態、發光、透明度）。用 Coblis 或 shader 模擬 deuteranopia 檢查。
4. **UI 與遊戲畫面分離**：模擬區只有材料像素；UI 放在燒杯外的面板，面板用中性低飽和色＋1px 邊框。UI 不使用任何材料色當底色（避免「這是沙嗎？」）。計分數字可飄進模擬區，但必須有描邊/陰影並在 0.6 秒內離開。
5. **焦點唯一**：同一時間只有一組東西在「搶眼」。大量反應時，降低次要粒子的 glow（見 §4 的 glow budget）。
6. **Silhouette**：燒杯、按鈕、圖示的外形在純黑剪影下要能辨識。

---

## 3. 像素藝術基礎

- **固定像素尺度**：模擬格 1 cell = 1 個遊戲像素。UI 像素素材用同一倍率（建議 sim 解析度 320×180 或 384×216，整數倍放大到 1080p/1440p/4K）。**禁止混用不同倍率**。
- **No mixels**：任何像素素材不得非整數縮放、不得旋轉（旋轉會產生大小不一的像素）。需要旋轉的 UI（卡片晃動）改用高解析 UI 層，或在低解析 render texture 中旋轉後整數放大。
- **Ramp**：每種材料 3–5 色（見 references/material-palette.md）。超過 5 色在 1px 粒子上看不出來。
- **Dithering 正確用法**：只用在 (a) 大面積漸層（背景、燒杯玻璃反光）、(b) 半透明假象（煙、蒸氣用 checkerboard/Bayer 4×4 alpha）。**不要**在小物件、圖示、文字上 dither；不要在動態粒子上用 world-space dither（會閃爍），dither pattern 要鎖在螢幕空間或 cell 座標。
- **手動 anti-aliasing**：只在 UI 圖示和 logo 的斜線/曲線上，用介於線色與背景色的中間色補 1px。不要對外輪廓與透明背景交界做 AA（換背景就出現髒邊）。
- **Banding**：避免平行等寬的色帶沿輪廓走（看起來像地圖等高線）。
- **Pillow shading 禁止**：光源方向固定（左上），陰影不是「從邊緣往中心變亮」。
- **字型**：像素字只用白名單（Cubic 11、Fusion Pixel Font、Kenney Fonts）；以原生像素大小的整數倍顯示；TMP 用 Point 取樣的 bitmap 或高 sampling SDF。

---

## 4. 落沙遊戲如何替材料上色

參考作品觀察（Noita、The Powder Toy、Sandspiel、Sandustry；部分為觀察推論，標「未驗證」）：

1. **每粒子顏色噪聲**：粒子生成時存一個 random byte（Sandspiel 的 `ra`），渲染時用它在材料 ramp 內選色或調亮度 → 沙、石頭有顆粒感。噪聲**在生成時固定**，粒子移動時顏色跟著走（不要每幀重抽，會閃）。
2. **固體用世界座標紋理**：Noita 材料可指定 `texture_file`，固體依世界位置取樣紋理；變成掉落粒子時保留當下的顏色（依 wiki 屬性推論，未驗證細節）。我們的 stone/glass/ice 可用 cell 座標 hash 取 ramp 產生穩定紋理。
3. **流體不靠噪聲靠運動**：water/oil 噪聲幅度小（±3% L），加上 (a) 表面一格較亮的 highlight、(b) 依速度/時間的細微閃爍。
4. **發光材料（emissive）**：Noita 有 `gfx_glow`（0–255）與 `gfx_glow_color`。我們做法：每格 cell 有 `emission` 值，渲染出 HDR 色 = palette 色 × (1 + emission × k)，交給 URP Bloom。fire、lava、spark、acid（弱）、熾熱 glass 發光。
5. **溫度色**：The Powder Toy 有熱度顯示模式；我們只取其精神 — 物質溫度高時沿 黑體色（暗紅→橙→黃→白）往亮端偏，冷卻時回到原 ramp。
6. **反應閃光**：反應發生那一格當幀 emission 拉到最高、2–4 幀衰減 → 玩家「看到」反應。這是最重要的可讀性回饋。
7. **Glow budget**：同時發光 cell 數 > N（起始 2,000）時，按比例降低每格 emission，維持整體亮度穩定、避免畫面爆白。

實作要點：sim 資料（material id、random byte、temperature、emission）打包成 RGBA8 texture 上傳，fragment shader 查 palette LUT（256×1 或 materials×ramp 的小貼圖）決定顏色。CPU 不算顏色。

---

## 5. 後處理（Unity 6 URP）重點

詳細配方見 `references/urp-postfx.md`。核心：
- 相機 **HDR 開啟**；Bloom **Threshold 1.0–1.1**（只讓 HDR>1 的發光材料溢光，一般材料不 bloom）、Intensity 0.6–1.0 起調、Scatter 0.6–0.75、High Quality Filtering 開（減少閃爍）。
- Tonemapping：**Neutral**（ACES 會改色相、壓暗 palette）。或 None + 自己控制。
- Color grading LUT：只做輕微統一（分鏡式「爐火感」），不改 palette 的 value 結構；`Color Lookup` contribution ≤ 0.5。
- **CRT/scanline 預設關閉**，設定選單提供開關與強度；Steam 截圖/預告片以「關閉」為主，最多 1 張開啟的截圖展示。
- Pixel Perfect Camera（URP 內建，不要裝舊 2D Pixel Perfect 套件）：Grid Snapping = Upscale Render Texture；Bloom 在放大後的解析度做，才不會出現方塊狀光暈。

---

## 6. UI 風格（Balatro 式 score-attack）

詳細時序見 `references/ui-juice.md`。必守：
- **顏色就是計分語言**：Chips = 藍、Mult = 紅、Money = 金、×Mult = 紅底白字。整個遊戲固定，不得挪用。
- **逐項結算**：反應一筆一筆跳出 (+chips / +mult)，每筆有 number pop（scale 1.0→1.3→1.0, overshoot easing）、音高遞升。
- **震動依數量級分級**：分數越大震幅越大、時間越長；最大不超過 8px / 1°。提供「減少畫面震動」選項（無障礙）。
- **數字永遠可讀**：粗描邊（2px 暗色）＋陰影；大數字用科學記號前先用千分位。
- **Juice 不得蓋住資訊**：粒子與閃光不准蓋住 chips×mult 與目標分數。

---

## 7. 圖示（16–32px）

- 先做 **16px 版本**，再放大到 32px 加細節（不要把 32px 縮成 16px）。
- 一個圖示 = 一個概念、一個剪影；1px 暗色外框（palette 最暗色）讓它在任何背景上成立。
- 每個圖示最多 4–5 色（外框、暗、中、亮、強調）。光源一律左上。
- Vial（材料瓶）圖示：統一瓶身外形，**只換液體色與一個小符號**（火焰、水滴、骷髏…）→ 玩家靠顏色＋符號雙重辨識（色盲友善）。
- Catalyst 遺物：外形依稀有度區分（圓 / 六角 / 星形框），框色依稀有度（灰、藍、紫、金）。
- 程序化產生：圖示可用 C# 或 Python 以「形狀 + palette index」繪製輸出 PNG，可重現、可批次修改。
- 測試：在實際 UI 背景、100% 縮放下看；縮成 50% 仍能分辨兩兩不同圖示。

---

## 8. Steam 膠囊圖

詳細見 `references/steam-capsule.md`。重點：
- 規格：Header 920×430、Small 462×174、Main 1232×706、Vertical 748×896、Library 600×900、Hero 3840×1240（無文字）、Logo 透明 PNG。
- Valve 規則：膠囊上只能有遊戲畫面/美術與遊戲名 logo（及正式副標）；**不能放評價、獎項、折扣字、其他文字**。
- 我們的做法（非插畫師也能做好）：**字體驅動的大 logo ＋ 高解析模擬渲染（爆炸性反應瞬間）＋ 1 個清楚焦點**。Logo 本身就是落沙：用模擬把字母「倒出來」或字母由不同材料組成。
- 先做 Small capsule（120×45 預覽仍要看得清 logo），再往大做。

---

## 9. 工作流程規則

1. 新顏色 → 先加進 palette 檔，再引用；PR/commit 說明列出新增 index。
2. 任何外部素材（字型、Kenney UI）→ 寫入 `docs/art/ASSET_LICENSES.md`（檔名、URL、作者、授權、日期）。
3. 所有程序化美術（圖示、logo、膠囊圖）保留產生腳本與參數，放 `Game/Tools/ArtGen/` 或 `tools/`，可重跑。
4. 不確定的參數標「起始值」，原型試玩後回填到 references。

---

## 10. 提交前視覺 QA 清單（pre-commit）

- [ ] 灰階截圖：背景 / 材料 / 發光 / UI 四層明度分得開
- [ ] 焦點（反應點、計分數字）是畫面最亮、最飽和的東西
- [ ] 新增顏色都來自 palette（無寫死 HEX）
- [ ] 相鄰易混材料（fire/lava/sand、acid/plant、steam/smoke）在 100% 與 50% 縮放都分得開
- [ ] 色盲模擬（deuteranopia、protanopia）下仍可辨識材料與 Chips/Mult
- [ ] 無 mixel：像素素材全為整數縮放、未旋轉
- [ ] 粒子顏色噪聲在移動時不閃爍
- [ ] Bloom：一般材料不溢光；500+ 反應同時發生時畫面不爆白（glow budget 生效）
- [ ] UI 文字有描邊、在最亮的爆炸上方仍可讀
- [ ] 螢幕震動 ≤ 8px，「減少震動」選項關閉後完全不震
- [ ] CRT 濾鏡預設關閉，開關有效
- [ ] 圖示 16px 原尺寸可辨識，兩兩可區分
- [ ] 1080p、1440p、Steam Deck 1280×800 皆為整數倍放大或有正確 letterbox
- [ ] 無生成式 AI 產出的圖；新素材已登記授權
- [ ] 截圖已存 `docs/art/qa/<日期>_<功能>.png` 供回顧

---

## Sources
- Slynyrd Pixelblog 1 – Color Palettes（hue shift ≤20°、飽和曲線）：https://www.slynyrd.com/blog/2018/1/10/pixelblog-1-color-palettes
- Lospec Palette List：https://lospec.com/palette-list ；Resurrect 64：https://lospec.com/palette-list/resurrect-64 ；Endesga 32：https://lospec.com/palette-list/endesga-32 ；Apollo：https://lospec.com/palette-list/apollo ；AAP-64：https://lospec.com/palette-list/aap-64
- Lospec 像素教學索引：https://lospec.com/pixel-art-tutorials
- GameDev.net – Color Palettes：https://www.gamedev.net/articles/visual-arts/color-palettes-r4964/
- Noita wiki – Making a custom material（`texture_file`、`gfx_glow`）：https://noita.wiki.gg/wiki/Modding:_Making_a_custom_material
- 80.lv – Noita 落沙模擬：https://80.lv/articles/noita-a-game-based-on-falling-sand-simulation/
- Making Sandspiel（per-particle `ra` 決定亮度、GPU 上色）：https://maxbittker.com/making-sandspiel
- The Powder Toy 原始碼：https://github.com/The-Powder-Toy/The-Powder-Toy
- Unity URP Bloom：https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@17.0/manual/post-processing-bloom.html
- Unity URP Pixel Perfect Camera：https://docs.unity3d.com/6000.0/Documentation/Manual/urp/2d-pixelperfect-ref.html
- Balatro 回饋設計拆解：https://blakecrosley.com/zh-Hant/guides/design/balatro
- Steamworks 商店圖像素材：https://partner.steamgames.com/doc/store/assets/standard
- presskit.gg Steam Capsule Art Guide：https://presskit.gg/field-guides/steam-capsule-art-guide
- Coblis 色盲模擬：https://www.color-blindness.com/coblis-color-blindness-simulator/
