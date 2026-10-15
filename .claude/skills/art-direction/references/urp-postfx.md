# URP 後處理配方（Unity 6）

> 數值為起始值，原型後回填。Volume 用一個 Global Volume（`PostFX_Default`）＋玩家設定在 runtime 改參數。

## 相機與渲染
- URP Asset：**HDR 開啟**（Bloom 需要 >1.0 的值）、HDR precision 32-bit 不必要（用預設）。
- Sim 渲染：低解析 render texture（例如 384×216），**Filter = Point**、無 mipmap。
- Pixel Perfect Camera（URP 內建元件；**不要**裝舊的 com.unity.2d.pixel-perfect 套件，它只支援 Built-in）：
  - Assets Pixels Per Unit = sim/UI 像素素材的 PPU（例如 1 cell = 1 unit 或 16）
  - Reference Resolution = 384×216（或 320×180）
  - Grid Snapping = **Upscale Render Texture**（得到不旋轉、無 AA 的乾淨像素）
  - Crop Frame = Windowbox 或 None（Steam Deck 16:10 會有邊）
- 注意：若 Bloom 在低解析做，光暈會是方塊狀。若出現，改成「sim 低解析 → 整數放大到螢幕解析 → 再做 Bloom」（自訂 Renderer Feature 或 UI RawImage 顯示 sim RT，再由主相機後處理）。

## Bloom
| 參數 | 起始值 | 理由 |
|---|---|---|
| Threshold | 1.0（範圍 0.95–1.2） | Unity 預設 0.9（gamma 空間）。設到 ≥1.0 → 只有 HDR emissive 會溢光，一般亮色（sand 高光、UI 白字）不 bloom |
| Intensity | 0.8（0.5–1.2） | 預設 0 = 關閉 |
| Scatter | 0.7 | 光暈半徑；太大會糊成一片 |
| Tint | 白或極淡暖色 `#fff2e0` | |
| Clamp | 預設 65472；若爆炸閃白可降到 ~20 | |
| High Quality Filtering | 開 | 減少像素邊緣閃爍 |
| Downscale | Half（效能不足再 Quarter） | |
| Max Iterations | 6 | |

搭配 §glow budget：同時發光 cell 過多時按比例降低 emission，不要靠降 Bloom 強度。

## Tonemapping / Color
- Tonemapping：**Neutral**（ACES 會偏移色相、壓低飽和，破壞 palette）。
- Color Adjustments：Post Exposure 0、Contrast 0–10、Saturation 0。不要用它修 palette，修 palette 本身。
- Color Lookup（LUT）：用於主題/情境（例如 boss 回合偏冷），Contribution ≤ 0.5。LUT 用 Unity 的中性 LUT 匯出，程式或 Krita 調色後匯回（不要用來源不明的 LUT 包）。
- Vignette：Intensity 0.15–0.25，Smoothness 0.4。把視線拉回燒杯中心。
- 不用：Depth of Field、Motion Blur、Chromatic Aberration（> 0.1 會讓像素邊緣變彩色、損可讀性；只在大爆炸瞬間 0.2 → 0 衰減 0.15s 可以）、Film Grain（與粒子噪聲打架）。

## CRT / Scanline（選用濾鏡，預設關）
自寫 Fullscreen Pass Renderer Feature（Unity 6 URP：Full Screen Pass Renderer Feature + Shader Graph Fullscreen）。不要抓網路上授權不明的 CRT shader；若參考公有領域實作（例如 Timothy Lottes 的 CRT 公開範例），在 ASSET_LICENSES.md 註明（授權狀態 **未驗證**）。
建議元素（每項可在設定調整強度）：
1. Scanline：每個 sim 像素列 → `1 - k * (0.5 + 0.5*cos(2π * y_sim))`，k = 0.15–0.25。**跟 sim 像素對齊**，不要跟螢幕像素對齊（會產生 moiré）。
2. 輕微曲面 barrel distortion：0–0.03（預設 0.0）。
3. Aperture/mask：預設關（低解析畫面上會變髒）。
4. 先算 CRT 再 Bloom，或 Bloom 後再疊 scanline——兩者都試，選發光材料最好看者；記錄決定。
設定選單：`CRT: Off / Subtle / Strong`。商店截圖預設 Off。

## UI 相機
- UI 用 Screen Space – Overlay 或獨立相機，**不吃 Bloom**（避免白字溢光）。若想讓計分數字發光，用 TMP 的 Glow/Underlay 而非 Bloom。
- 例外：遊戲世界中的浮動計分數字可放在 sim 相機層吃 Bloom，但要控制顏色值 ≤ 1.2。

## 效能檢查
- 1080p 下後處理總耗時 < 1.5ms（GPU，Steam Deck 目標 < 3ms）。用 Frame Debugger / Profiler 量。
