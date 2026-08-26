# PowerShell Seed Database Script
Write-Host "[*] Seeding DocIntel AI Database..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\backend"
.\venv\Scripts\python.exe -c "import sys, os; sys.path.insert(0, os.path.abspath('.')); sys.path.insert(0, os.path.abspath('..')); from backend.app import create_app; from backend.app.extensions import db; from backend.app.seed.seed_data import seed_database; app = create_app(); app.app_context().push(); db.create_all(); seed_database()"
Write-Host "[+] Seed complete! Demo and Admin users are ready." -ForegroundColor Green
