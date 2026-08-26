# PowerShell Run Script for Frontend
Write-Host "[*] Starting DocIntel AI React Frontend..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\frontend"
npm run dev
