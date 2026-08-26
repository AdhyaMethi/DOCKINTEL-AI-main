#!/usr/bin/env bash
# Bash Seed Database Script
echo "[*] Seeding DocIntel AI Database..."
cd "$(dirname "$0")/backend" || exit
./venv/bin/python -c "import sys, os; sys.path.insert(0, os.path.abspath('.')); sys.path.insert(0, os.path.abspath('..')); from backend.app import create_app; from backend.app.extensions import db; from backend.app.seed.seed_data import seed_database; app = create_app(); app.app_context().push(); db.create_all(); seed_database()"
echo "[+] Seed complete! Demo and Admin users are ready."
