@echo off
chcp 65001 >nul

echo 🚀 启动 PhotoSync 应用...

REM 检查 Docker 是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未安装，请先安装 Docker
    pause
    exit /b 1
)

REM 检查 Docker Compose 是否安装
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose 未安装，请先安装 Docker Compose
    pause
    exit /b 1
)

REM 创建必要的目录
echo 📁 创建存储目录...
if not exist "photo-storage" mkdir photo-storage
if not exist "server\data" mkdir server\data

REM 构建并启动容器
echo 🔨 构建 Docker 镜像...
docker-compose build

echo 🚀 启动服务...
docker-compose up -d

REM 等待服务启动
echo ⏳ 等待服务启动...
timeout /t 10 /nobreak >nul

REM 检查服务状态
curl -f http://localhost:8080/api/health >nul 2>&1
if errorlevel 1 (
    echo ❌ 服务启动失败，请检查日志: docker-compose logs
    pause
    exit /b 1
) else (
    echo ✅ PhotoSync 启动成功！
    echo 📱 访问地址: http://localhost:8080
    echo 📊 API 健康检查: http://localhost:8080/api/health
    echo.
    echo 📋 常用命令:
    echo   查看日志: docker-compose logs -f
    echo   停止服务: docker-compose down
    echo   重启服务: docker-compose restart
)

pause
