@echo off
echo [1/2] Starting Flask API...
start cmd /k "cd Model && venv\Scripts\activate && python api_server.py"

timeout /t 3 > nul
echo [2/2] Starting React App...
start cmd /k "cd src && npm run dev -- --host"
