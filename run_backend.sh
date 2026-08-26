#!/usr/bin/env bash
# Bash Run Script for Backend
echo "[*] Starting DocIntel AI Backend Server..."
cd "$(dirname "$0")/backend" || exit

if [ ! -d "venv" ]; then
    echo "[*] Creating virtual environment..."
    python3 -m venv venv
    ./venv/bin/pip install -r requirements.txt
fi

./venv/bin/python run.py
