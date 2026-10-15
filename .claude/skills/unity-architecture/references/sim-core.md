# 模擬核心：完整骨架、效能、決定性

> 適用 `PourDecisions.Sim`（noEngineReferences）。所有程式碼是**骨架**：結構與不變量是規定，細節可調。標「假設」者需原型量測。

## 1. 資料佈局

```csharp
namespace PourDecisions.Sim {

public enum Kind : byte { Empty, Static, Powder, Liquid, Gas, Fire }

// 4 bytes/格。AoS 對單執行緒 cache 友善；若改 Burst SIMD 可再拆 SoA。
public struct Cell {
    public ushort Mat;   // MaterialTable 索引；0 = Empty
    public byte Aux;     // 用途依材料：剩餘壽命、溫度等級、顏色變化 seed
    public byte Stamp;   // 最後被更新的 tick（低 8 bit），避免同 tick 重複處理
}

public readonly struct MaterialDef {         // 從 JSON 編譯，執行期唯讀
    public readonly Kind Kind; public readonly short Density; public readonly byte Dispersion;
    public readonly byte Lifetime;           // 0 = 永久；>0 時 Aux 倒數，歸零變成 DecayTo
    public readonly ushort DecayTo;
    public MaterialDef(Kind k, short d, byte disp, byte life, ushort decay) { Kind=k; Density=d; Dispersion=disp; Lifetime=life; DecayTo=decay; }
}

public sealed class MaterialTable {
    public readonly MaterialDef[] Defs;      // index = Mat
    public MaterialTable(MaterialDef[] defs) => Defs = defs;
}

// 反應表：扁平 [a * N + b]，Rule=0 表示無反應。對稱反應在編譯時寫兩次（a,b 與 b,a）。
public struct ReactionRule { public ushort OutA, OutB; public ushort Chance; public ushort RuleId; public int Score; }

public sealed class ReactionTable {
    public readonly int N; public readonly ReactionRule[] Rules; // Rules[0] 保留為空
    public readonly ushort[] Lookup;                              // N*N → index into Rules
    public ReactionTable(int n, ReactionRule[] rules, ushort[] lookup) { N=n; Rules=rules; Lookup=lookup; }
    public ref readonly ReactionRule Get(ushort a, ushort b) => ref Rules[Lookup[a * N + b]];
}
}
```

## 2. 決定性 RNG

```csharp
public struct Pcg32 {                         // PCG-XSH-RR，32-bit 輸出
    ulong _state; const ulong Inc = 1442695040888963407UL;
    public Pcg32(ulong seed) { _state = 0; NextUInt(); _state += seed; NextUInt(); }
    public uint NextUInt() {
        ulong old = _state; _state = old * 6364136223846793005UL + Inc;
        uint xorshifted = (uint)(((old >> 18) ^ old) >> 27); int rot = (int)(old >> 59);
        return (xorshifted >> rot) | (xorshifted << ((-rot) & 31));
    }
    public int Range(int maxExclusive) => (int)(((ulong)NextUInt() * (ulong)maxExclusive) >> 32);
    public bool Chance16(ushort p) => (NextUInt() & 0xFFFF) < p;  // p: 0..65535
    public static Pcg32 ForChunk(ulong runSeed, uint tick, int cx, int cy)
        => new Pcg32(Hash.Mix(runSeed, tick, (uint)cx, (uint)cy));
}
public static class Hash {                   // SplitMix64 串接
    public static ulong Mix(ulong a, uint b, uint c, uint d) {
        ulong h = a ^ 0x9E3779B97F4A7C15UL;
        h = Sm(h ^ b); h = Sm(h ^ ((ulong)c << 32 | d)); return h;
    }
    static ulong Sm(ulong z) { z += 0x9E3779B97F4A7C15UL; z = (z ^ (z >> 30)) * 0xBF58476D1CE4E5B9UL; z = (z ^ (z >> 27)) * 0x94D049BB133111EBUL; return z ^ (z >> 31); }
}
```

規則：模擬內**每個隨機決策都從當前 chunk 的 RNG 取**；不要因為表現層狀態（例如是否快轉）多取或少取亂數。

## 3. Chunk 與 dirty rect（Noita 式）

```csharp
public struct Rect8 { public int MinX, MinY, MaxX, MaxY; public bool Empty => MaxX < MinX; }

public sealed class ChunkGrid {
    public const int Size = 32;               // Noita 用 64；燒杯小，32 粒度更細（假設，可調）
    public readonly int CountX, CountY;
    Rect8[] _cur, _next;                      // 本 tick 處理 / 下 tick 要處理
    public ChunkGrid(int w, int h) {
        CountX = (w + Size - 1) / Size; CountY = (h + Size - 1) / Size;
        _cur = new Rect8[CountX * CountY]; _next = new Rect8[CountX * CountY];
        for (int i = 0; i < _next.Length; i++) { _cur[i] = EmptyRect(); _next[i] = EmptyRect(); }
    }
    static Rect8 EmptyRect() => new Rect8 { MinX = int.MaxValue, MinY = int.MaxValue, MaxX = int.MinValue, MaxY = int.MinValue };

    public void SwapDirty() { (_cur, _next) = (_next, _cur); for (int i = 0; i < _next.Length; i++) _next[i] = EmptyRect(); }

    public bool TryGetRect(int cx, int cy, out Rect8 r) { r = _cur[cy * CountX + cx]; return !r.Empty; }

    // 格子 (x,y) 改變 → 它和 8 鄰格下 tick 都要再看一次；跨 chunk 邊界時同時標記鄰 chunk
    public void MarkDirty(int x, int y, int w, int h) {
        for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++) {
            int nx = x + dx, ny = y + dy;
            if ((uint)nx >= (uint)w || (uint)ny >= (uint)h) continue;
            ref var r = ref _next[(ny / Size) * CountX + nx / Size];
            if (nx < r.MinX) r.MinX = nx; if (nx > r.MaxX) r.MaxX = nx;
            if (ny < r.MinY) r.MinY = ny; if (ny > r.MaxY) r.MaxY = ny;
        }
    }
    public bool AllAsleep() { foreach (var r in _next) if (!r.Empty) return false; return true; }
}
```

（`MarkDirty` 的 9 次迴圈可優化為只擴張 rect 一次再處理邊界，先求正確。）

## 4. 主迴圈與更新規則

```csharp
public sealed class SimWorld {
    public readonly int W, H; public readonly Cell[] Cells;
    readonly ChunkGrid _chunks; readonly MaterialTable _mt; ReactionTable _rx;
    public readonly EventBuffer Events; public uint Tick; public readonly ulong Seed;
    Pcg32 _rng; byte _stamp;

    public SimWorld(int w, int h, ulong seed, MaterialTable mt, ReactionTable rx) {
        W = w; H = h; Seed = seed; _mt = mt; _rx = rx;
        Cells = new Cell[w * h]; _chunks = new ChunkGrid(w, h); Events = new EventBuffer(8192);
    }
    public void SetReactions(ReactionTable rx) => _rx = rx;   // 催化劑重編譯後於回合邊界替換

    public void Step() {
        Tick++; _stamp = (byte)Tick; bool ltr = (Tick & 1) == 0;
        _chunks.SwapDirty();
        for (int cy = 0; cy < _chunks.CountY; cy++)
        for (int i = 0; i < _chunks.CountX; i++) {
            int cx = ltr ? i : _chunks.CountX - 1 - i;
            if (!_chunks.TryGetRect(cx, cy, out var r)) continue;
            _rng = Pcg32.ForChunk(Seed, Tick, cx, cy);
            for (int y = r.MinY; y <= r.MaxY; y++)
            for (int k = 0, n = r.MaxX - r.MinX; k <= n; k++) {
                int x = ltr ? r.MinX + k : r.MaxX - k, idx = y * W + x;
                ref var c = ref Cells[idx];
                if (c.Mat == 0 || c.Stamp == _stamp) continue;
                UpdateCell(x, y, idx);
            }
        }
    }

    void UpdateCell(int x, int y, int idx) {
        ref readonly var def = ref _mt.Defs[Cells[idx].Mat];
        if (def.Kind == Kind.Static) { if (TryReact(x, y, idx)) return; return; }
        if (def.Lifetime > 0 && Decay(idx, in def)) return;
        if (TryReact(x, y, idx)) return;
        switch (def.Kind) {
            case Kind.Powder: MovePowder(x, y, idx, in def); break;
            case Kind.Liquid: MoveLiquid(x, y, idx, in def); break;
            case Kind.Gas: case Kind.Fire: MoveGas(x, y, idx, in def); break;
        }
    }

    // 反應：檢查 4 鄰格（下、左、右、上，固定順序），第一個命中就套用
    static readonly int[] Dx = { 0, -1, 1, 0 }, Dy = { -1, 0, 0, 1 };
    bool TryReact(int x, int y, int idx) {
        ushort a = Cells[idx].Mat;
        for (int d = 0; d < 4; d++) {
            int nx = x + Dx[d], ny = y + Dy[d];
            if ((uint)nx >= (uint)W || (uint)ny >= (uint)H) continue;
            int nIdx = ny * W + nx; ushort b = Cells[nIdx].Mat;
            ref readonly var rule = ref _rx.Get(a, b);
            if (rule.RuleId == 0 || !_rng.Chance16(rule.Chance)) continue;
            Write(idx, x, y, rule.OutA); Write(nIdx, nx, ny, rule.OutB);
            Events.Push(new ReactionEvent(x, y, rule.RuleId, Tick));
            return true;
        }
        return false;
    }

    void MovePowder(int x, int y, int idx, in MaterialDef def) {
        if (TrySwapDown(x, y, idx, 0, in def)) return;
        int first = _rng.Range(2) == 0 ? -1 : 1;              // 斜下左右隨機但決定性
        if (TrySwapDown(x, y, idx, first, in def)) return;
        TrySwapDown(x, y, idx, -first, in def);
    }
    void MoveLiquid(int x, int y, int idx, in MaterialDef def) {
        if (TrySwapDown(x, y, idx, 0, in def)) return;
        int dir = _rng.Range(2) == 0 ? -1 : 1;
        if (TrySwapDown(x, y, idx, dir, in def) || TrySwapDown(x, y, idx, -dir, in def)) return;
        // 側向 dispersion：最多走 def.Dispersion 格（≤ ChunkGrid.Size/2，平行化的前提）
        int cx = x, cur = idx;
        for (int s = 0; s < def.Dispersion; s++) {
            int nx = cx + dir; if ((uint)nx >= (uint)W) break;
            int nIdx = y * W + nx; if (!CanDisplace(def, Cells[nIdx].Mat)) break;
            Swap(cur, cx, y, nIdx, nx, y); cur = nIdx; cx = nx;
        }
    }
    void MoveGas(int x, int y, int idx, in MaterialDef def) { /* 鏡像 MovePowder/MoveLiquid，往上 */ }

    bool TrySwapDown(int x, int y, int idx, int dx, in MaterialDef def) {
        int nx = x + dx, ny = y - 1;
        if (ny < 0 || (uint)nx >= (uint)W) return false;
        int nIdx = ny * W + nx;
        if (!CanDisplace(def, Cells[nIdx].Mat)) return false;
        Swap(idx, x, y, nIdx, nx, ny); return true;
    }
    bool CanDisplace(in MaterialDef mover, ushort target) {
        if (target == 0) return true;
        ref readonly var t = ref _mt.Defs[target];
        return t.Kind != Kind.Static && t.Kind != Kind.Powder && t.Density < mover.Density;
    }
    bool Decay(int idx, in MaterialDef def) { /* Aux 倒數；歸零 → Write(DecayTo) 並 return true */ return false; }

    void Swap(int i, int x, int y, int j, int x2, int y2) {
        (Cells[i], Cells[j]) = (Cells[j], Cells[i]);
        Cells[i].Stamp = _stamp; Cells[j].Stamp = _stamp;
        _chunks.MarkDirty(x, y, W, H); _chunks.MarkDirty(x2, y2, W, H);
    }
    void Write(int i, int x, int y, ushort mat) {
        Cells[i] = new Cell { Mat = mat, Aux = (byte)_mt.Defs[mat].Lifetime, Stamp = _stamp };
        _chunks.MarkDirty(x, y, W, H);
    }

    public bool Settled => _chunks.AllAsleep();
    public ulong GridHash() { ulong h = 1469598103934665603UL; foreach (var c in Cells) { h ^= c.Mat | ((ulong)c.Aux << 16); h *= 1099511628211UL; } return h; }
}

public readonly struct ReactionEvent { public readonly short X, Y; public readonly ushort RuleId; public readonly uint Tick;
    public ReactionEvent(int x, int y, ushort r, uint t) { X=(short)x; Y=(short)y; RuleId=r; Tick=t; } }

public sealed class EventBuffer {               // 預配置，零 GC；滿了就計數丟棄（並在 debug 顯示）
    readonly ReactionEvent[] _buf; public int Count { get; private set; } public int Dropped { get; private set; }
    public EventBuffer(int cap) => _buf = new ReactionEvent[cap];
    public void Push(in ReactionEvent e) { if (Count < _buf.Length) _buf[Count++] = e; else Dropped++; }
    public ReadOnlySpan<ReactionEvent> AsSpan() => new ReadOnlySpan<ReactionEvent>(_buf, 0, Count);
    public void Clear() { Count = 0; Dropped = 0; }
}
```

**重要**：計分必須用所有事件（含 Dropped 的數量用另一個 per-rule 計數陣列記錄），否則緩衝區大小會影響分數 → 破壞決定性。建議 SimWorld 另維護 `int[] RuleCounts`，計分以它為準，事件只給表現層定位用。

### 倒料（玩家輸入 → 模擬）
`Pour(vial, x, tickOffset)` 由 Run 層排程：每 tick 在燒杯頂端 `x ± width` 依 vial 的 `pourShape` 產生 N 格材料（位置抖動用規則層 RNG）。倒料進行中與結算中都是相同的 `Step()`。

## 5. 渲染到貼圖（Presentation）

```csharp
// Presentation 層，可用 UnityEngine
public sealed class GridRenderer {
    readonly Texture2D _tex; readonly SimWorld _w; readonly Color32[] _palette; // palette[mat*4 + variant]
    public GridRenderer(SimWorld w, Color32[] palette) {
        _w = w; _palette = palette;
        _tex = new Texture2D(w.W, w.H, TextureFormat.RGBA32, mipChain: false, linear: false)
               { filterMode = FilterMode.Point, wrapMode = TextureWrapMode.Clamp };
    }
    public Texture2D Texture => _tex;
    public void Upload() {
        var px = _tex.GetPixelData<Color32>(0);          // 直接寫 GPU 上傳緩衝，無中介陣列
        var cells = _w.Cells;
        for (int i = 0; i < cells.Length; i++) px[i] = _palette[cells[i].Mat * 4 + (cells[i].Aux & 3)];
        _tex.Apply(updateMipmaps: false, makeNoLongerReadable: false);
    }
}
```

- 每幀一次（不是每 tick 一次）。y=0 在底部與 Texture2D 座標一致，免翻轉。
- 80k 格 × 4 B = 320 KB/幀上傳，Steam Deck 可承受（假設，需量測）。
- 進階：改上傳 `R16`（Mat）+ `R8`（Aux）貼圖，palette 與發光（熔岩、火）在 shader 處理；美術調色只改 palette 貼圖，不碰 C#。與 `art-direction` skill 協調。
- 顯示用 Sprite / 全螢幕 quad + Pixel Perfect Camera，整數倍放大。

## 6. 升級到 Burst + Jobs（只有 profiler 證明需要時）

1. 把 `UpdateCell` 等改成 `static unsafe` 方法，參數為 `Cell*`, `MaterialDef*`, `ReactionRule*`, `ushort* lookup`, `ref Pcg32`, `ChunkWriter`（不得使用 managed 陣列、class、static readonly 陣列 → 改成 `stackalloc` 或常數 switch）。這些方法放在 Sim（純 C#），純 C# 路徑也呼叫它們 → **只有一份規則程式碼**。
2. `PourDecisions.Sim.Burst` assembly（引用 Unity.Burst/Collections/Jobs）：`NativeArray<Cell>` 持有網格，`[BurstCompile] struct ChunkPassJob : IJobParallelFor`，每個 index 是一個 chunk。
3. **Checkerboard 4-pass**：pass p 只處理 `(cx%2, cy%2) == (p%2, p/2)` 的 chunk；同一 pass 中 chunk 彼此不相鄰，且每格每 tick 最遠只影響到半個 chunk 外 → 寫入範圍不重疊 → 結果與執行緒排程無關（決定性保持）。注意：pass 順序改變了「誰先更新」，所以 Burst 版與單執行緒版若要同 hash，**單執行緒版也必須用同樣的 4-pass 順序**。從第一天就用 4-pass 順序寫單執行緒版。
4. 事件：每 chunk 各自的 `NativeList`/固定區段，pass 結束依 chunk index 順序合併 → 決定性。
5. `RuleCounts` 用每 chunk 一列再加總。
6. 驗證：`BurstParityTests` 比對兩條路徑 1,000 tick 的 hash。

> 若採用此路徑，上方 §4 的單迴圈要改為「4 pass × chunk」順序；建議原型期就這樣寫，省下日後重寫 golden hash。

## 7. 為什麼不用 Compute Shader 做模擬
- GPU 浮點/原子操作順序跨廠商不保證 → 回放、每日挑戰、平衡模擬不一致。
- 每個反應要回報計分 → 需要 GPU→CPU readback（AsyncGPUReadback 有 1–3 幀延遲），計分 UI 會晚。
- headless 平衡模擬（dotnet）無法使用。
- 我們網格 ≤ 10 萬格，CPU 足夠。Noita 的世界遠大於此也用 CPU。

## 8. 效能量測方法
- `ProfilerMarker s_Step = new("Sim.Step")` 只能放在 Presentation 包裝層（Sim 不引用 Unity）：`using (s_Step.Auto()) world.Step();`。
- 最壞情境基準（PlayMode performance test）：燒杯 70% 填滿水 + 火藥全面引爆，量 300 tick 平均與 p99。
- SimRunner（dotnet）用 `Stopwatch` 量 ticks/sec，CI 中低於門檻就 fail。
- 常見瓶頸：dirty rect 被氣體/火焰長期撐大 → 給 Fire/Gas 壽命、粒子靜止判定（N tick 未移動則不標 dirty）。

## 9. 測試清單（EditMode）
- `Powder_FallsOneCellPerTick`、`Liquid_SpreadsWithinDispersion`、`Water_Fire_MakesSteam`（各反應一個）
- `Determinism_SameSeedSameHash`（10 回合 golden）、`Determinism_DifferentSeedDifferentHash`
- `Settle_TerminatesWithinMaxTicks`（隨機 1,000 個 seed）
- `Conservation_NoMaterialCreatedWithoutRule`（無反應時格數守恆）
- `Chunks_SleepWhenStatic`（靜止 2 tick 後 `Settled == true`）
