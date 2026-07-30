@echo off
title Transformer Oil Launcher

:: Set current directory to the app folder
cd /d "D:\Economic Analysis Transformer Oil\transformer-oil-app"

:: Check if Node.js/NPM is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ==============================================================
    echo    ERROR: Node.js and NPM Not Found
    echo ==============================================================
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

:: Check if port 5000 is already in use
netstat -ano | findstr :5000 | findstr LISTENING > nul
if %errorlevel% equ 0 (
    echo Server is already running. Launching app...
    goto launch_app
)

echo Server is not running. Starting server...
:: Start the server in a new window
start "Transformer Oil Server - DO NOT CLOSE" cmd /k "cd /d D:\Economic Analysis Transformer Oil\transformer-oil-app && echo Starting server... && echo Keep this window open while using the app! && npm run dev"

:: Wait for port 5000 to become active (check up to 15 seconds)
echo Waiting for server to initialize...
for /L %%i in (1,1,15) do (
    netstat -ano | findstr :5000 | findstr LISTENING > nul
    if %errorlevel% equ 0 (
        goto launch_app
    )
    :: Use ping for delay to avoid input redirection errors in headless sessions
    ping 127.0.0.1 -n 2 > nul
)

:launch_app
echo Launching application...
:: Attempt to launch Chrome PWA if the shortcut exists, otherwise open standard browser
if exist "C:\Program Files\Google\Chrome\Application\chrome_proxy.exe" (
    echo Opening PWA...
    start "" "C:\Program Files\Google\Chrome\Application\chrome_proxy.exe" --profile-directory=Default --app-id=mleldakmoebeolhcnjndafbokokbkgcn
    :: Wait a second and check if Chrome proxy actually opened. Since we can't easily check, we also open default browser as backup
    echo If the PWA window did not open, you can manually open http://localhost:5000 in your browser.
) else (
    start http://localhost:5000
)
exit
