# 材料調色盤（起始值）

> 全部取自 **Resurrect 64**（https://lospec.com/palette-list/resurrect-64）。這是「起始值」，原型試玩後依灰階測試與色盲測試調整，調整後更新本檔。
> 格式：ramp 由暗到亮。`noise` = 生成時固定的 random byte 對 ramp index / 亮度的影響範圍。`emit` = HDR 強度倍數（0 = 不發光；Bloom threshold 約 1.0）。

## 背景與容器
| 用途 | HEX | 備註 |
|---|---|---|
| 燒杯內背景 | `#2e222f` | 全場最暗，低飽和偏紫 → 發光材料最顯眼 |
| 背景細格/刻度 | `#3e3546` | 只用 dither 或 1px 線，不做大面積 |
| 燒杯玻璃 | `#9babb2` @ 15–25% alpha，邊緣 `#c7dcd0` 1px highlight | |
| UI 面板 | `#3e3546` 底、`#625565` 邊框、`#c7dcd0` 文字 | 不可用材料色 |

## 材料 ramp
| 材料 | Ramp（暗→亮） | noise | emit | 辨識特徵（非色彩） |
|---|---|---|---|---|
| Sand | `#9e4539` `#cd683d` `#e6904e` `#fbb954` | 選 ramp index（偏中間兩格 80%） | 0 | 顆粒噪聲、堆成斜坡 |
| Water | `#323353` `#4d65b4` `#4d9be6` + 表面 `#8fd3ff` | ±3% L | 0 | 70% 不透明、表面 1px 亮線、流動閃爍 |
| Oil | `#2e222f` `#45293f` `#6b3e75` + 表面虹彩 `#905ea9` | ±3% L | 0 | 浮在水上、表面偶發紫色 sheen |
| Fire | `#e83b3b` `#fb6b1d` `#f9c22b` 核心 `#ffffff` | 每幀依壽命移動 index（老→紅） | 2.0–4.0 | 上竄、閃爍、壽命短 |
| Lava | `#6e2727` `#ae2334` `#ea4f36` `#f79617` | 低頻 cell hash 流紋 | 1.2–2.0（亮紋） | 緩慢、暗底亮紋、冷卻變 stone |
| Acid | `#239063` `#91db69` `#d5e04b` 氣泡 `#fbff86` | ±5% L | 0.3–0.6 | 黃綠、偶發氣泡亮點 |
| Ice | `#9babb2` `#c7dcd0` `#8ff8e2` 高光 `#ffffff` | cell hash 稀疏高光 | 0 | 靜止、晶格高光 |
| Gunpowder | `#2e222f` `#3e3546` `#625565` 斑點 `#6e2727` | 5% 機率出現紅斑點 | 0 | 深灰帶紅點，與 stone 明度不同 |
| Seeds | `#4c3e24` `#676633` `#a2a947` | 選 index | 0 | 小顆粒、比 sand 暗且偏綠 |
| Plant | `#165a4c` `#239063` `#1ebc73` 嫩芽 `#91db69` | 依生長年齡 | 0 | 向上分枝、深藍綠（與 acid 分開） |
| Steam | `#c7dcd0` `#ffffff` @ 40–70% alpha | alpha dither（螢幕空間 Bayer 4×4） | 0–0.2 | 快速上升、消散 |
| Smoke | `#3e3546` `#625565` `#7f708a` @ 50–80% alpha | alpha dither | 0 | 慢速擴散、比 steam 暗 |
| Glass | `#4d9be6` @ 30% + 高光 `#c7dcd0`/`#ffffff` | cell hash 斜向高光 | 熾熱時 0.8–1.5（`#f57d4a`） | 透明、斜向高光 |
| Stone | `#374e4a` `#547e64` `#92a984` → 若太綠改 `#625565` `#7f708a` `#9babb2` | cell hash（穩定紋理） | 0 | 靜止、粗紋理 |

## 熱度色（溫度上升時疊加）
黑體色序：`#6e2727` → `#b33831` → `#ea4f36` → `#fb6b1d` → `#f9c22b` → `#ffffff`。
`final = lerp(materialColor, heatColor(T), saturate((T - T_glow) / range))`，`emit += heatT * 1.5`。

## 反應閃光
反應發生的 cell：當幀 `emit = 4.0`、顏色 lerp 往 `#ffffff` 50%，2–4 幀指數衰減（`emit *= 0.5` / frame）。
這是「讓玩家看見反應」的主要手段，優先級高於所有裝飾。

## 已知衝突（需原型驗證）
- Fire / Lava / Sand 同為暖色 → 依 value（fire 最亮）、emit、運動速度區分。
- Acid / Plant 同為綠 → acid 偏黃且微發光、plant 偏藍且不發光。
- Gunpowder / Smoke / Stone 同為灰紫 → gunpowder 有紅斑點、smoke 半透明、stone 改用綠灰 ramp。
- 若灰階測試失敗：先調 value（換 ramp 中的位置），最後才換 hue。

## Shader 資料流
- Sim → `Texture2D`（RGBA8，point filter）：R = material id、G = random byte、B = temperature（0–255）、A = flags/emission。
- Palette LUT：`materials × 8` 的小貼圖（每列一種材料的 ramp），point filter，無 mipmap，sRGB。
- Fragment：`col = LUT(id, rampIndex(G)); col = heat(col, B); col.rgb *= 1 + emit;` → 輸出到 HDR target。
