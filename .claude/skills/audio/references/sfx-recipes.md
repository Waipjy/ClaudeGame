# SFX 配方（起始方向）

> 「jfxr/ChipTone」= 程序化合成；「FS」= Freesound CC0 錄音素材；所有輸出 48 kHz、mono、短 SFX peak -3 dBFS。
> 參數為方向性描述（工具 UI 會變）；jfxr 的 JSON 存到 `docs/audio/sfx/<name>.jfxr`，可重現。

## 材料落下/倒出（倒 vial）
| 聲音 | 做法 | 層 |
|---|---|---|
| 倒沙 | FS 沙粒/米倒入錄音，loop；音量 = 倒出速率 | Bed |
| 倒水 | FS 倒水 loop，pitch 隨燒杯水位升高（容器共鳴感） | Bed |
| 倒油 | 倒水錄音 pitch -20%、low-pass 2 kHz（更黏稠） | Bed |
| vial 拔塞 | jfxr：短正弦下滑 + 噪聲 click（20ms） | UI |
| vial 空了 | 玻璃輕敲（FS 或 jfxr 高頻 sine + 快速衰減） | UI |

## 反應（B 層單發 + C 層音床）
| 反應 | Transient | Body | Bed |
|---|---|---|---|
| Water + Lava → steam + stone | 低頻「噗」(jfxr square 80Hz 30ms) | 白噪音 band-pass 3–6 kHz，200ms 下滑 | 沸騰嘶聲 loop（FS sizzle） |
| Fire 點燃 Oil | 「呼」(噪聲 attack 30ms + low-pass 掃升) | 火焰轟聲 300ms | 燃燒 crackle loop（FS fire crackle） |
| Gunpowder 爆炸 | ChipTone explosion，短 | FS 低頻 boom 加 sub（60Hz sine 150ms） | 無；限制每 120ms 一次，數量大時用更大的單一爆炸 |
| Acid 溶解 | 小泡泡 pop（jfxr 高頻 sine 上滑 15ms） | 嘶嘶（噪聲 high-pass 4 kHz） | 冒泡 loop |
| Water + Ice / 凍結 | 冰裂 crack（FS ice crack，或 jfxr 噪聲 + 短 resonance） | 細碎晶體聲 | 無 |
| Ice 融化 | 水滴（jfxr sine 下滑） | — | 滴水 loop（稀疏） |
| Sand + Fire → Glass | 玻璃「叮」（高頻 sine 2–4 kHz + 長尾） | 溫和嘶聲 | — |
| Seeds 發芽 / Plant 生長 | 柔軟「啵」+ 上行音 | 木質 creak（FS） | 低音量窸窣 loop |
| Steam 凝結 | 輕「嘶」短 | — | — |
| 連鎖反應（chain ≥ N） | 上升 riser（jfxr 掃頻 0.5s） | — | 所有 bed 的 low-pass 打開 |

## 計分（A 層）
| 聲音 | 做法 |
|---|---|
| +chips | jfxr：柔和方波/三角波 plink，50–80ms，基準音 C5；依連擊在音階上升 |
| +mult | jfxr：更亮、帶 vibrato 或雙音（五度），比 chips 高一個音域 |
| ×mult | 「ka-ching」：mult 音 + 金屬敲擊（FS coin/cash register CC0） |
| Catalyst 觸發 | 短琶音 3 音（上行），每種稀有度不同音色 |
| 達成目標分 | 低音 drop（sub sine 50Hz + 下滑）+ 和弦 stab + 0.2s 後音樂 L4 開 |
| 回合失敗 | 下行三音 + low-pass 收掉音樂 |
| 結算數字 roll up | 快速 tick（jfxr 5ms click），每 30–50ms 一次，pitch 隨數值慢慢升；結束時一聲「定格」 |

## UI
| 聲音 | 做法 |
|---|---|
| Hover | 極短 tick（jfxr sine 3 kHz，8ms），-12 dB |
| Click | Kenney Interface Sounds（CC0）或 jfxr click |
| 購買 | 收銀「叮」+ 硬幣 |
| 錢不夠 | 低沉 buzz（square 120Hz 150ms），不刺耳 |
| 卡片/vial 拿起/放下 | 紙/玻璃輕碰（FS），pitch ±5% |
| 回合開始 | 短 jingle（BeepBox 2 小節） |

## 加工鏈（Audacity）
1. 剪掉頭尾靜音（頭部留 0ms，尾部 fade-out 10–30ms）。
2. High-pass 40–60 Hz（去除無用低頻，筆電喇叭也聽不到）。
3. EQ：反應音避開 1–3 kHz 的「計分音區」或降 2–3 dB，讓計分音穿透。
4. 正規化 peak -3 dBFS（短 SFX）；loop 素材正規化到約 -20 LUFS。
5. 匯出 WAV 16-bit 48 kHz mono → Unity 再壓縮。
