# 協同原型（Archetype）草案與內容配額

> 全部是**假設**，供原型與模擬起步用；以模擬與試玩結果修正。

## 1. 原型草案
| 原型 | 核心材料 | 核心反應 | Enabler 範例 | Payoff 範例 | 與誰 Bridge |
|---|---|---|---|---|---|
| 燃燒 Combustion | 油、火、木屑 | 燃燒、延燒 | 「油燃燒時間 ×2」 | 「每個燃燒反應 +2 mult」 | 爆破（火點火藥）、熱力（燃燒產生熱） |
| 爆破 Demolition | 火藥、火 | 爆炸、連鎖爆炸 | 「爆炸半徑 +1」 | 「每層連鎖深度 ×1.2」（rare） | 燃燒、腐蝕（爆炸打碎容器壁） |
| 熱力循環 Thermal | 熔岩、水、冰 | 凝固成石、蒸發、結冰、融化 | 「蒸氣上升碰頂會凝回水」 | 「每完成一次狀態循環 +15 chips」 | 燃燒、生長（溫水促進生長） |
| 腐蝕 Corrosion | 酸、金屬、石 | 溶解 | 「酸不會被稀釋」 | 「每溶解 50 像素 +1 mult 永久（Scaling）」 | 爆破、熱力 |
| 生長 Growth | 種子、水、泥 | 發芽、蔓延 | 「植物會吸水生長」 | 「回合結束時每株植物 +5 chips」 | 燃燒（植物是燃料：先種後燒） |
| 層疊 Strata | 沙、鹽、密度不同的液體 | 分層、沉澱 | 「每個完整水平層 +10 chips」 | 「層數 ≥ 5 時 ×2」（rare） | 熱力（熔岩加熱分層） |
| 經濟 Economy | 金粉、鹽 | 結晶 | 「每回合 +$1 per 晶體群」 | 「持有的錢每 $10 → +1 mult」 | 任何（橫向） |
| 多樣 Variety | 任意 | 不同反應類型 | 「第一次出現的反應類型 chips ×2」 | 「本倒每多 1 種反應 +3 mult」 | 天然的 bridge 原型 |

要求：
- 首發至少 6 個可行原型，每個至少 2 enabler + 3 payoff + 1 bridge。
- Variety 與 Economy 是「萬用膠水」，避免它們比專精更強（模擬監控佔勝場 ≤ 25%）。
- 每個原型都要有一段「好剪片」的高潮畫面：整杯連爆、蒸氣噴發、植物燒成火牆。

## 2. 內容量（首發目標，Balatro 150 小丑作為上限參考）
| 類別 | 首發 | Demo |
|---|---|---|
| 材料（vial 基礎種類） | 14–18 | 8 |
| 反應類型 | 25–35 | 12 |
| 催化劑 | 80–120 | 25–30 |
| 升級（voucher 類） | 16–24 | 4 |
| 燒杯形狀/起始牌組 | 6–8 | 2 |
| Boss 規則 | 16–20 | 4 |
| 難度階梯 | 8 | 2 |

稀有度配額（催化劑）：Common 45%、Uncommon 35%、Rare 15%、Legendary 5%（數量配額；出現機率另外用 70/25/5 權重）。

## 3. 催化劑寫作模板（資料表欄位）
```
id, name_key, desc_key, rarity, price, role(Enabler/Payoff/Bridge/Economy/Scaling/Utility),
archetypes[], trigger(on_reaction/on_pour/on_round_end/passive), condition, effect(type,value),
score_layer(chips/plus_mult/x_mult/none), icon, vfx_id, sfx_id, design_note
```
- `score_layer = x_mult` 只允許 rarity ≥ uncommon。
- `design_note` 寫「什麼時候選它」一句話 + 審查清單勾選結果。
