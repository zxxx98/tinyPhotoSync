@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo PhotoSync Release Script
echo =======================

set "VERSION=%1"
if "%VERSION%"=="" (
    echo Error: Please provide version number
    echo Usage: release-simple.bat [version]
    exit /b 1
)

echo Version: v%VERSION%
echo Current branch: 
for /f "tokens=*" %%i in ('git branch --show-current') do echo %%i

echo.
echo Ready to release v%VERSION%
pause
