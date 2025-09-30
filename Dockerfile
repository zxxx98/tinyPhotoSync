# 多阶段构建 Dockerfile

# 第一阶段：构建前端应用
FROM node:18-alpine AS builder

# 使用 npm 作为包管理器

WORKDIR /app/client

# 复制前端 package.json 和 package-lock.json 并安装依赖
COPY client/package*.json client/package-lock.json ./
RUN npm ci

# 复制前端源代码
COPY client/ .

# 构建前端应用
RUN npm run build

# 第二阶段：构建最终镜像
FROM node:18-alpine AS production

# 使用 npm 作为包管理器

WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache curl

# 复制后端 package.json 和 package-lock.json 并安装生产依赖
COPY server/package*.json server/package-lock.json ./
RUN npm ci --only=production

# 复制后端源代码
COPY server/ .

# 从第一阶段复制构建好的前端静态文件
COPY --from=builder /app/client/dist ./public

# 创建必要的目录
RUN mkdir -p storage data

# 设置权限
RUN chown -R node:node /app
USER node

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# 启动命令
CMD ["node", "src/server.js"]
