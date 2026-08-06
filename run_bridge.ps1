# EA Agent Mobile Bridge launcher
# Usage:  powershell -ExecutionPolicy Bypass -File run_bridge.ps1  [stop]
$ErrorActionPreference = "Stop"
$port = 8100
$pidFile = Join-Path $env:LOCALAPPDATA "ea-bridge\server.pid"

if ($args -contains "stop") {
  if (Test-Path $pidFile) {
    $procId = Get-Content $pidFile
    try { Stop-Process -Id $procId -Force -Confirm:$false; Write-Host "Bridge stopped (pid $procId)." }
    catch { Write-Host "No running bridge with pid $procId." }
    Remove-Item $pidFile -Force -Confirm:$false
  } else { Write-Host "No pid file - bridge not running (or started manually)." }
  exit 0
}

# 1. Tailscale must be up - the server itself also refuses to bind otherwise
$ts = & "C:\Program Files\Tailscale\tailscale.exe" ip -4 2>$null | Select-Object -First 1
if (-not $ts) { Write-Host "FATAL: Tailscale is not connected. Start Tailscale first." -ForegroundColor Red; exit 2 }

# 2. Port free? (only a real LISTENER blocks us - TimeWait sockets are harmless)
$busy = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($busy) { Write-Host "FATAL: port $port already has a listener (stale bridge? run: run_bridge.ps1 stop)" -ForegroundColor Red; exit 3 }

# 3. Firewall rule scoped to the tailnet (created once; needs admin - skip quietly if not)
try {
  if (-not (Get-NetFirewallRule -DisplayName "EABridge8100" -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -DisplayName "EABridge8100" -Direction Inbound -Action Allow `
      -Protocol TCP -LocalPort $port -RemoteAddress 100.64.0.0/10 -Profile Any | Out-Null
    Write-Host "Firewall rule EABridge8100 created (tailnet-only)."
  }
} catch { Write-Host "Note: run once as admin to add the scoped firewall rule." }

# 4. Rebuild the private dashboard so the phone sees current state
node "$PSScriptRoot\dashboard\build.js" --private | Out-Null

# 5. Launch
$proc = Start-Process -FilePath "python" -ArgumentList "`"$PSScriptRoot\bridge\server.py`" --port $port" -PassThru -WindowStyle Hidden
New-Item -ItemType Directory -Force (Split-Path $pidFile) | Out-Null
$proc.Id | Out-File -FilePath $pidFile -Encoding utf8
Start-Sleep 2
Write-Host ""
Write-Host "EA Bridge running (pid $($proc.Id))" -ForegroundColor Green
Write-Host "Phone URL:   http://$ts`:$port/app"
Write-Host "Access key:  $env:LOCALAPPDATA\ea-bridge\app.key  (paste its contents on the phone once)"
Write-Host "Stop with:   powershell -File run_bridge.ps1 stop"
Write-Host ""
Write-Host "Remember: arm the watcher inside the Claude Code session (see CLAUDE.md bridge protocol)."
