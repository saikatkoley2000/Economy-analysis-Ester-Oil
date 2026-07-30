@echo off
title Transformer Oil Setup
echo ==============================================================
echo    Transformer Oil Economic Analysis - Local App Launcher
echo ==============================================================
echo.

:: Check if Node.js/NPM is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js and NPM were not found on this computer.
    echo.
    echo To run this application, you need to install Node.js:
    echo 1. Go to: https://nodejs.org/
    echo 2. Download and install the "LTS" [Recommended] version.
    echo 3. During installation, make sure "Add to PATH" is checked.
    echo 4. After installation, restart your computer and try opening this file again.
    echo.
    echo Press any key to open the Node.js download page and exit...
    pause > nul
    start https://nodejs.org/
    exit
)

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
