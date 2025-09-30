@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM PhotoSync Release Script (Windows Version)
REM Usage: scripts\release.bat [options]
REM Example: scripts\release.bat --dry-run
REM Note: Version should be updated separately using npm run version

REM Ensure we're in the project root directory
cd /d "%~dp0.."

REM Debug: Show current directory
echo Current working directory: %CD%

set "DRY_RUN=false"
set "PUSH_TAG=true"
set "UPDATE_CHANGELOG=true"

REM Parse arguments
:parse_args
if "%~1"=="" goto :check_prerequisites
if "%~1"=="--dry-run" (
    set "DRY_RUN=true"
    shift
    goto :parse_args
)
if "%~1"=="--no-push" (
    set "PUSH_TAG=false"
    shift
    goto :parse_args
)
if "%~1"=="--no-changelog" (
    set "UPDATE_CHANGELOG=false"
    shift
    goto :parse_args
)
if "%~1"=="-h" goto :help
if "%~1"=="--help" goto :help
echo Error: Unknown parameter %~1
pause
exit /b 1

:help
echo PhotoSync Release Script (Windows Version)
echo.
echo Usage: %~nx0 [options]
echo.
echo Options:
echo   --dry-run            Show operations to be performed without executing
echo   --no-push            Do not push tags to remote repository
echo   --no-changelog       Do not update CHANGELOG.md
echo   -h, --help           Show this help information
echo.
echo Examples:
echo   %~nx0                    # Create release tag and push
echo   %~nx0 --dry-run          # Preview release operations
echo   %~nx0 --no-push          # Create local tags only
echo.
echo Note: Version should be updated separately using npm run version
pause
exit /b 0

:check_prerequisites
REM Get current version from package.json
for /f "tokens=2 delims=:" %%a in ('findstr /r "\"version\"" package.json') do (
    set "VERSION=%%a"
    set "VERSION=!VERSION: =!"
    set "VERSION=!VERSION:"=!"
    set "VERSION=!VERSION:,=!"
)
if "%VERSION%"=="" (
    echo Error: Could not read version from package.json
    pause
    exit /b 1
)

REM Check if working directory is clean
echo Checking working directory status...
git status --porcelain >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Working directory is not clean, please commit or stash all changes
    git status --short
    pause
    exit /b 1
)

REM Check if tag already exists
echo Checking if tag already exists...
git tag -l | findstr /x "v%VERSION%" >nul
if %errorlevel% equ 0 (
    echo Error: Tag v%VERSION% already exists
    pause
    exit /b 1
)

echo PhotoSync Release Process
echo =========================
echo Version: v%VERSION%
echo Current branch: Check manually, default is main
echo Dry run: %DRY_RUN%
echo Push tags: %PUSH_TAG%
echo Update changelog: %UPDATE_CHANGELOG%
echo.

REM Update CHANGELOG.md
if "%UPDATE_CHANGELOG%"=="true" (
    echo Updating CHANGELOG.md...
    if "%DRY_RUN%"=="true" (
        echo   [DRY RUN] Will add version %VERSION% entry to top of CHANGELOG.md
    ) else (
        REM Create CHANGELOG.md if it doesn't exist
        if not exist "CHANGELOG.md" (
            (
                echo # Changelog
                echo.
                echo All notable changes to this project will be documented in this file.
                echo.
                echo The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
                echo and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
                echo.
                echo ## [Unreleased]
                echo.
                echo ### Added
                echo - Initial version
                echo.
            ) > CHANGELOG.md
        )
        
        REM Get current date
        for /f "tokens=1-3 delims=/" %%a in ('date /t') do set "DATE=%%c-%%a-%%b"
        
        REM Create temporary file
        echo ## [%VERSION%] - %DATE% > temp_changelog.txt
        echo. >> temp_changelog.txt
        echo ### Added >> temp_changelog.txt
        echo - Please add new features here >> temp_changelog.txt
        echo. >> temp_changelog.txt
        echo ### Changed >> temp_changelog.txt
        echo - Please add changes here >> temp_changelog.txt
        echo. >> temp_changelog.txt
        echo ### Fixed >> temp_changelog.txt
        echo - Please add fixes here >> temp_changelog.txt
        echo. >> temp_changelog.txt
        
        REM Merge into CHANGELOG.md
        type temp_changelog.txt > temp_combined.txt
        type CHANGELOG.md >> temp_combined.txt
        move temp_combined.txt CHANGELOG.md
        del temp_changelog.txt
    )
)

REM Commit changes
echo Committing changes...
if "%DRY_RUN%"=="true" (
    echo   [DRY RUN] Will commit CHANGELOG.md changes
) else (
    if "%UPDATE_CHANGELOG%"=="true" git add CHANGELOG.md
    git commit -m "chore: prepare release v%VERSION%"
)

REM Create tag
echo Creating tag...
if "%DRY_RUN%"=="true" (
    echo   [DRY RUN] Will create tag v%VERSION%
) else (
    git tag -a "v%VERSION%" -m "Release v%VERSION%"
)

REM Push changes and tags
if "%PUSH_TAG%"=="true" (
    echo Pushing changes and tags...
    if "%DRY_RUN%"=="true" (
        echo   [DRY RUN] Will push commits and tags to remote repository
    ) else (
        git push origin %CURRENT_BRANCH%
        git push origin v%VERSION%
    )
)

echo.
echo Release process completed!
echo.
echo Next steps:
echo 1. GitHub Actions will automatically build Docker images
echo 2. Images will be pushed to: ghcr.io/username/photosync:v%VERSION%
echo 3. GitHub Release will be automatically created
echo.
echo Manual operations (if needed):
echo - Edit CHANGELOG.md to add detailed change descriptions
echo - Check GitHub Release page and improve release notes
echo - Notify team members about the new release
echo.
echo Note: To update version numbers, use: npm run version [new-version]

if "%DRY_RUN%"=="true" (
    echo.
    echo This is dry run mode, no actual operations were performed
    echo To actually execute the release, run: %~nx0
)

echo.
echo Press any key to exit...
pause >nul

endlocal
