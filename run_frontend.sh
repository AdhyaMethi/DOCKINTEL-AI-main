#!/usr/bin/env bash
# Bash Run Script for Frontend
echo "[*] Starting DocIntel AI React Frontend..."
cd "$(dirname "$0")/frontend" || exit
npm run dev
