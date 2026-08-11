@echo off
REM ===================================================================
REM  Open the OPNsense firewall console.
REM
REM  Double-click this file. It opens an SSH tunnel through the bastion
REM  (am-rtr01) to the firewall's management interface at 10.0.0.1, then
REM  opens your browser at the local end of that tunnel.
REM
REM  A .bat rather than a .ps1 because PowerShell's execution policy
REM  silently refuses some scripts and closes the window before you can
REM  read the error. This forces a bypass for this one run only and keeps
REM  the window open either way.
REM
REM  Leave this window open while using the console. Closing it disconnects.
REM ===================================================================
title OPNsense Firewall Console - tunnel
color 0B

echo.
echo   ==========================================================
echo    OPNsense Firewall Console
echo   ==========================================================
echo.
echo    URL       : https://localhost:8443
echo    Username  : root
echo    Password  : C:\Users\Erick\CloudLab\build\credentials.txt
echo.
echo    Your browser WILL warn about the certificate.
echo    That is expected - it is self-signed and issued to
echo    10.0.0.1, not to localhost, so the name cannot match.
echo.
echo      Chrome / Edge : click "Advanced" then "Proceed"
echo      If no Advanced link appears, click the page once
echo      and type:  thisisunsafe
echo.
echo   ==========================================================
echo.
echo    Opening tunnel... leave this window OPEN.
echo.

start "" "https://localhost:8443"

ssh -F "C:\Users\Erick\CloudLab\build\ssh_config" -N ^
    -o ServerAliveInterval=30 ^
    -o ExitOnForwardFailure=yes ^
    -L 8443:10.0.0.1:443 am-rtr01

echo.
echo    Tunnel closed.
echo.
pause
