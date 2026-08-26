# PowerShell Run Script for Backend
Write-Host "[*] Starting DocIntel AI Backend Server..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\backend"

if (-not (Test-Path ".\venv\Scripts\python.exe")) {
    Write-Host "[*] Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    .\venv\Scripts\pip.exe install -r requirements.txt
}

.\venv\Scripts\python.exe run.py
