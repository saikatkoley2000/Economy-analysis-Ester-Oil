@echo off
title Transformer Oil Setup
echo ==============================================================
echo    Transformer Oil Economic Analysis - Local App Launcher
echo ==============================================================
echo.
echo Checking for updates and installing dependencies...
call npm install

echo.
echo Stopping any existing server running on port 5000...
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr :5000') DO (
    TaskKill.exe /F /PID %%T 2>nul
)

echo.
echo Launching the application server in a new window...
start "Transformer Oil Server - DO NOT CLOSE" cmd /k "echo Starting server... && echo Keep this window open while using the app! && npm run dev"

echo Waiting 10 seconds for the server to fully start...
timeout /t 10 /nobreak > nul

echo.
echo Opening your web browser...
start http://localhost:5000

echo.
echo Done! You can now close this setup window.
timeout /t 3 > nul
exit
