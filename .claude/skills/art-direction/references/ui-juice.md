# UI 與 Juice（Balatro 拆解 → Pour Decisions）

> Balatro 數值來自 blakecrosley.com 的拆解示意實作（非遊戲原始碼）→ 視為參考起始值。

## Balatro 做對的事
1. **顏色 = 計分語言**：Chips 藍 `#009dff`、Mult 紅 `#fe5f55`、Money 金 `#f0c040`、Hands 綠、Planet 紫。玩家不讀字也知道在加什麼。
2. **逐項結算**：每張牌/每個 Joker 依序觸發，左到右，每次觸發都有脈動＋累計值更新。玩家「看」計算過程，期待感來自序列。
3. **音高遞升**：連續觸發的音逐級上升（C D E F G…），聽覺上就知道「越來越多」。
4. **震動強度分級**：分數越大震越久越大，數字還沒出現前就傳達大小。
5. **卡牌有重量**：hover 上浮＋放大、選取再上浮＋金色光、落定帶 ±3° 隨機旋轉。
6. **CRT/背景漩渦**：低調、可關。

## 我們的對應
| Balatro | Pour Decisions |
|---|---|
| 打出牌 | 倒出 vial（傾倒動畫 → 材料進燒杯） |
| 牌計分 | 每個反應發生時在反應位置跳 `+chips`（藍）或 `+mult`（紅），並飛向計分面板 |
| Joker 觸發 | Catalyst 遺物圖示脈動（scale 1→1.25→1，0.18s）＋其效果文字 |
| 最終 chips × mult | 回合結算：兩個數字相撞 → 乘積 roll up → 依數量級震動 |

## 時序（起始值）
| 事件 | 動畫 | 時長 | Easing |
|---|---|---|---|
| 反應飄字 | 出現 scale 0.6→1.2→1.0；上飄 8–12 px；淡出 | 0.5–0.6s | `easeOutBack`（overshoot 1.7） |
| 飄字飛向面板 | 曲線路徑 | 0.25s | `easeInCubic` |
| 面板數字增加 | number pop：scale 1.0→1.3→1.0 | 0.12s | `easeOutBack` |
| 數字滾動（大數字） | 各位數錯開 50ms 滾動 | 0.4s | `cubic-bezier(0.34,1.56,0.64,1)` |
| 遺物觸發 | 脈動＋白閃 1 幀 | 0.18s | `easeOutQuad` |
| 結算乘法 | 停頓 0.15s → 乘積 roll up | 0.6–1.2s（依數量級） | `easeOutExpo` |
| 達成目標分 | 全螢幕白閃 1–2 幀（alpha 0.3）＋低頻音 | 0.2s | — |

## 震動分級（螢幕/面板）
| 分數級 | 時長 | 位移 | 旋轉 |
|---|---|---|---|
| < 1e3 | 0.2s | ±1–2 px | 0 |
| 1e3–1e4 | 0.3s | ±3–4 px | 0 |
| > 1e4 | 0.5s | ±4–8 px | ±0.5–1° |
- 用 Perlin noise trauma 模型（`shake = trauma²`，trauma 每秒衰減 ~1.5）而非純隨機，會更順。
- 震動的是**相機/UI root**，不是 sim 本身（sim 像素位移要整數，否則 mixel）。
- 設定：Screen shake 0–100%，0% = 完全不震；Flash 可關（光敏）。

## 規則
- **節奏限制**：大量反應（>50/秒）時飄字合併成「+N chips ×k」群組，每 0.1s 最多產生 6 個飄字。不然畫面被數字淹沒。
- **音畫同步**：每個 number pop 一定有聲音（見 `audio` skill），pitch 隨連擊上升。
- **可略過**：結算動畫可按鍵/點擊加速到 4×；設定中有「快速動畫」。
- **數字格式**：< 1e6 用千分位（`12,345`）；≥ 1e6 用 `1.23e6` 或 `1.23M`（設定可選）；字體用等寬數字（tabular figures）避免跳動。
- **描邊**：所有遊戲中數字 2px 暗色描邊（palette 最暗色）＋ 1px 下方陰影。
- **按鈕**：hover 上浮 2px＋亮一階；按下下沉 2px＋暗一階＋點擊音；disabled 去飽和 50%。
- **卡片/vial 物件**：hover `translateY -12px`、scale 1.05、0.15s ease-out；選取 -24px、1.08、外框亮色。

## Easing 公式（C#）
```csharp
static float EaseOutBack(float t, float s = 1.70158f) { t -= 1; return t * t * ((s + 1) * t + s) + 1; }
static float EaseOutExpo(float t) => t >= 1 ? 1 : 1 - Mathf.Pow(2, -10 * t);
static float EaseInCubic(float t) => t * t * t;
```
用 unscaled time 驅動 UI 動畫（暫停時 UI 仍可動）。可用 DOTween（免費版授權需確認後登記，**未驗證**）或自寫 tween — 優先自寫，零依賴。
