# 在 HSU 電腦上執行指令（透過 Unity MCP eval）

雲端 session 沒有電腦的命令列，但 Unity MCP 的 `eval` 能在 Unity 編輯器裡執行任意 C#，用它呼叫 git 或其他程式。

## 規則（違反會讓 Unity 卡死）
1. **一定要關掉互動提示**：環境變數 `GIT_TERMINAL_PROMPT=0`、`GCM_INTERACTIVE=never`。
2. **一定要有逾時**：stdout/stderr 用 `ReadToEndAsync()`，`WaitForExit(ms)` 逾時就 `Kill()`；eval 的 timeout 參數要比內部逾時再大一點。
3. eval 跑在 Unity 主執行緒，執行期間 Unity 不能動，單次操作控制在 30 秒內。
4. 被中斷的 git 可能留下 `.git/index.lock`，確認沒有 git 在跑才刪。
5. commit 訊息用暫存檔 `-F` 傳，避免引號跳脫問題。

## 範本
```csharp
string Run(string args, int ms){
  var p = new System.Diagnostics.Process(); var si = p.StartInfo;
  si.FileName = "git"; si.Arguments = "-C \"C:/Users/waipj/Documents/ClaudeGame\" " + args;
  si.RedirectStandardOutput = true; si.RedirectStandardError = true;
  si.UseShellExecute = false; si.CreateNoWindow = true;
  si.EnvironmentVariables["GIT_TERMINAL_PROMPT"] = "0";
  si.EnvironmentVariables["GCM_INTERACTIVE"] = "never";
  p.Start(); var o = p.StandardOutput.ReadToEndAsync(); var e = p.StandardError.ReadToEndAsync();
  if (!p.WaitForExit(ms)) { try { p.Kill(); } catch {} return "$ git " + args + "\n[TIMEOUT]\n"; }
  return "$ git " + args + "\n" + o.Result + e.Result;
}
return Run("status --short", 5000);
```

## 同步流程
- 雲端改 docs/腳本 → 雲端 push → 電腦端 `git pull --ff-only`（eval）。
- Unity 產生的檔案（.meta、場景、設定）→ 電腦端 `add/commit/push`（eval）→ 雲端 `git pull`。
- 兩邊都改同一檔案前先 pull，避免衝突。
- `.claude/` 可以透過 eval 的 `System.IO.File` 寫入電腦（橋接的 device_commit_files 不行）。
