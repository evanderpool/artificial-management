<#
    Open the OPNsense firewall console in a browser.

    The firewall's management interface lives at 10.0.0.1 on the internal
    `am-edge` segment. Windows cannot reach that address directly, and that is
    deliberate: a management interface with a straight path to the operator's
    workstation is exactly the private-to-management leak the security review
    flagged as F-02.

    Instead this opens an SSH tunnel through the bastion (am-rtr01) and points
    the browser at the local end of it. Nothing about the network changes; the
    traffic simply rides an authenticated SSH session that already had a
    legitimate reason to exist.

    Cloud equivalent: AWS SSM port forwarding, or Azure Bastion. Same shape --
    reach a private-subnet management surface without exposing it.

    Usage:  right-click -> Run with PowerShell
            (or)  powershell -ExecutionPolicy Bypass -File open-firewall-console.ps1

    Leave the window open while you use the console. Closing it drops the tunnel.
#>
[CmdletBinding()]
param(
    [string]$SshConfig  = "C:\Users\Erick\CloudLab\build\ssh_config",
    [string]$Bastion    = "am-rtr01",
    [string]$Target     = "10.0.0.1",
    [int]   $LocalPort  = 8443
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $SshConfig)) { throw "SSH config not found at $SshConfig" }

# Refuse to collide with something already listening.
$inUse = Get-NetTCPConnection -LocalPort $LocalPort -State Listen -ErrorAction SilentlyContinue
if ($inUse) { throw "Local port $LocalPort is already in use. Close the other tunnel or pass -LocalPort <other>." }

Write-Host ""
Write-Host "  Opening tunnel:  localhost:$LocalPort  ->  $Bastion  ->  ${Target}:443" -ForegroundColor Cyan
Write-Host ""

$ssh = Start-Process ssh `
    -ArgumentList @('-F', $SshConfig, '-N', '-L', "${LocalPort}:${Target}:443", $Bastion) `
    -PassThru -WindowStyle Hidden

# Wait for the tunnel to actually carry traffic before launching the browser --
# opening it early just shows a connection error and teaches the user to distrust
# the script.
$ready = $false
foreach ($i in 1..20) {
    Start-Sleep -Milliseconds 750
    if ((Get-NetTCPConnection -LocalPort $LocalPort -State Listen -ErrorAction SilentlyContinue)) { $ready = $true; break }
}

if (-not $ready) {
    if (-not $ssh.HasExited) { Stop-Process -Id $ssh.Id -Force }
    throw "Tunnel did not come up. Is the router running?  ssh -F `"$SshConfig`" $Bastion hostname"
}

Write-Host "  Tunnel is up." -ForegroundColor Green
Write-Host ""
Write-Host "  URL:       https://localhost:$LocalPort"
Write-Host "  Username:  root"
Write-Host "  Password:  see C:\Users\Erick\CloudLab\build\credentials.txt"
Write-Host ""
Write-Host "  The browser will warn about the certificate. That is expected --" -ForegroundColor Yellow
Write-Host "  it is self-signed, and it is issued to 10.0.0.1 rather than to" -ForegroundColor Yellow
Write-Host "  localhost, so the name will not match either. Click through it." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Close this window to disconnect." -ForegroundColor Cyan
Write-Host ""

Start-Process "https://localhost:$LocalPort"

try   { Wait-Process -Id $ssh.Id }
finally {
    if (-not $ssh.HasExited) { Stop-Process -Id $ssh.Id -Force }
    Write-Host "  Tunnel closed."
}
