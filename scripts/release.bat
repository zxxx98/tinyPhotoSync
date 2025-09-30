@echo off
setlocal enabledelayedexpansion

REM PhotoSync 发布脚本 (Windows版本)
REM 使用方法: scripts\release.bat [版本号] [选项]
REM 例如: scripts\release.bat 1.0.0 --dry-run

set "DRY_RUN=false"
set "PUSH_TAG=true"
set "UPDATE_CHANGELOG=true"
set "VERSION="

REM 解析参数
:parse_args
if "%~1"=="" goto :check_version
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
if "%VERSION%"=="" (
    set "VERSION=%~1"
    shift
    goto :parse_args
)
echo 错误: 未知参数 %~1
exit /b 1

:help
echo PhotoSync 发布脚本 (Windows版本)
echo.
echo 使用方法: %~nx0 [版本号] [选项]
echo.
echo 参数:
echo   版本号              要发布的版本号 (例如: 1.0.0)
echo.
echo 选项:
echo   --dry-run          只显示将要执行的操作，不实际执行
echo   --no-push          不推送标签到远程仓库
echo   --no-changelog     不更新 CHANGELOG.md
echo   -h, --help         显示此帮助信息
echo.
echo 示例:
echo   %~nx0 1.0.0                    # 发布版本 1.0.0
echo   %~nx0 1.0.0 --dry-run          # 预览发布操作
echo   %~nx0 1.0.0 --no-push          # 只创建本地标签
exit /b 0

:check_version
if "%VERSION%"=="" (
    echo 错误: 请提供版本号
    echo 使用方法: %~nx0 [版本号] [选项]
    echo 使用 %~nx0 --help 查看详细帮助
    exit /b 1
)

REM 检查工作目录是否干净
git status --porcelain >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 工作目录不干净，请先提交或暂存所有更改
    git status --short
    exit /b 1
)

REM 检查是否在正确的分支
for /f "tokens=*" %%i in ('git branch --show-current') do set "CURRENT_BRANCH=%%i"
if not "%CURRENT_BRANCH%"=="main" if not "%CURRENT_BRANCH%"=="master" (
    echo 警告: 当前不在主分支 (main/master)，当前分支: %CURRENT_BRANCH%
    set /p "continue=是否继续? (y/N): "
    if /i not "!continue!"=="y" exit /b 1
)

REM 检查标签是否已存在
git tag -l | findstr /x "v%VERSION%" >nul
if %errorlevel% equ 0 (
    echo 错误: 标签 v%VERSION% 已存在
    exit /b 1
)

echo 🚀 PhotoSync 发布流程
echo ====================
echo 版本号: v%VERSION%
echo 当前分支: %CURRENT_BRANCH%
echo 干运行: %DRY_RUN%
echo 推送标签: %PUSH_TAG%
echo 更新变更日志: %UPDATE_CHANGELOG%
echo.

REM 更新 package.json 版本
echo 📦 更新 package.json 版本...
if "%DRY_RUN%"=="true" (
    echo   [DRY RUN] 将更新根目录 package.json 版本为 %VERSION%
    echo   [DRY RUN] 将更新 client\package.json 版本为 %VERSION%
    echo   [DRY RUN] 将更新 server\package.json 版本为 %VERSION%
) else (
    pnpm version %VERSION% --no-git-tag-version
    cd client && pnpm version %VERSION% --no-git-tag-version && cd ..
    cd server && pnpm version %VERSION% --no-git-tag-version && cd ..
)

REM 更新 CHANGELOG.md
if "%UPDATE_CHANGELOG%"=="true" (
    echo 📝 更新 CHANGELOG.md...
    if "%DRY_RUN%"=="true" (
        echo   [DRY RUN] 将在 CHANGELOG.md 顶部添加版本 %VERSION% 的条目
    ) else (
        REM 创建 CHANGELOG.md 如果不存在
        if not exist "CHANGELOG.md" (
            (
                echo # 变更日志
                echo.
                echo 所有重要的项目更改都将记录在此文件中。
                echo.
                echo 格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
                echo 并且此项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。
                echo.
                echo ## [未发布]
                echo.
                echo ### 新增
                echo - 初始版本
                echo.
            ) > CHANGELOG.md
        )
        
        REM 获取当前日期
        for /f "tokens=1-3 delims=/" %%a in ('date /t') do set "DATE=%%c-%%a-%%b"
        
        REM 创建临时文件
        echo ## [%VERSION%] - %DATE% > temp_changelog.txt
        echo. >> temp_changelog.txt
        echo ### 新增 >> temp_changelog.txt
        echo - 请在此处添加新功能 >> temp_changelog.txt
        echo. >> temp_changelog.txt
        echo ### 更改 >> temp_changelog.txt
        echo - 请在此处添加更改 >> temp_changelog.txt
        echo. >> temp_changelog.txt
        echo ### 修复 >> temp_changelog.txt
        echo - 请在此处添加修复 >> temp_changelog.txt
        echo. >> temp_changelog.txt
        
        REM 合并到 CHANGELOG.md
        type temp_changelog.txt > temp_combined.txt
        type CHANGELOG.md >> temp_combined.txt
        move temp_combined.txt CHANGELOG.md
        del temp_changelog.txt
    )
)

REM 提交更改
echo 💾 提交更改...
if "%DRY_RUN%"=="true" (
    echo   [DRY RUN] 将提交 package.json 和 CHANGELOG.md 的更改
) else (
    git add package.json client\package.json server\package.json
    if "%UPDATE_CHANGELOG%"=="true" git add CHANGELOG.md
    git commit -m "chore: prepare release v%VERSION%"
)

REM 创建标签
echo 🏷️  创建标签...
if "%DRY_RUN%"=="true" (
    echo   [DRY RUN] 将创建标签 v%VERSION%
) else (
    git tag -a "v%VERSION%" -m "Release v%VERSION%"
)

REM 推送更改和标签
if "%PUSH_TAG%"=="true" (
    echo 📤 推送更改和标签...
    if "%DRY_RUN%"=="true" (
        echo   [DRY RUN] 将推送提交和标签到远程仓库
    ) else (
        git push origin %CURRENT_BRANCH%
        git push origin v%VERSION%
    )
)

echo.
echo ✅ 发布流程完成！
echo.
echo 下一步:
echo 1. GitHub Actions 将自动构建 Docker 镜像
echo 2. 镜像将推送到: ghcr.io/用户名/photosync:v%VERSION%
echo 3. 将自动创建 GitHub Release
echo.
echo 手动操作 (如果需要):
echo - 编辑 CHANGELOG.md 添加详细的变更内容
echo - 检查 GitHub Release 页面并完善发布说明
echo - 通知团队成员新版本已发布

if "%DRY_RUN%"=="true" (
    echo.
    echo 💡 这是干运行模式，没有实际执行任何操作
    echo 要实际执行发布，请运行: %~nx0 %VERSION%
)

endlocal
