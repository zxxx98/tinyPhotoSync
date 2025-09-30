#!/bin/bash

# PhotoSync 启动脚本

echo "🚀 启动 PhotoSync 应用..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 创建必要的目录
echo "📁 创建存储目录..."
mkdir -p photo-storage
mkdir -p server/data

# 构建并启动容器
echo "🔨 构建 Docker 镜像..."
docker-compose build

echo "🚀 启动服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
if curl -f http://localhost:8080/api/health > /dev/null 2>&1; then
    echo "✅ PhotoSync 启动成功！"
    echo "📱 访问地址: http://localhost:8080"
    echo "📊 API 健康检查: http://localhost:8080/api/health"
    echo ""
    echo "📋 常用命令:"
    echo "  查看日志: docker-compose logs -f"
    echo "  停止服务: docker-compose down"
    echo "  重启服务: docker-compose restart"
else
    echo "❌ 服务启动失败，请检查日志: docker-compose logs"
    exit 1
fi
