@echo off
powershell Write-Host "Starting NPM install %1" -ForegroundColor blue
start /B npm install %1
powershell Write-Host "Starting NPM install -t %1" -ForegroundColor blue
start /B npm install -t %1