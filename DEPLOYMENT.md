# PhotoSync 部署指南

## 系统要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存
- 至少 10GB 可用磁盘空间

## 快速部署

### 1. 克隆项目
```bash
git clone <repository-url>
cd photosync
```

### 2. 启动应用

#### Linux/macOS
```bash
chmod +x start.sh
./start.sh
```

#### Windows
```cmd
start.bat
```

#### 手动启动
```bash
# 创建存储目录
mkdir -p photo-storage server/data

# 构建并启动
docker-compose up -d

# 查看状态
docker-compose ps
```

### 3. 访问应用
打开浏览器访问: http://localhost:8080

## 配置说明

### 环境变量
在 `docker-compose.yml` 中可以配置以下环境变量：

- `NODE_ENV`: 运行环境 (production/development)
- `PORT`: 服务端口 (默认: 3000)

### 端口配置
- 主机端口: 8080
- 容器端口: 3000
- 如需修改，编辑 `docker-compose.yml` 中的端口映射

### 存储配置
- 照片存储: `./photo-storage` → `/app/storage`
- 数据库: `./server/data` → `/app/data`

## 数据管理

### 备份数据
```bash
# 备份照片
tar -czf photos-backup-$(date +%Y%m%d).tar.gz photo-storage/

# 备份数据库
cp server/data/photos.db photos-db-backup-$(date +%Y%m%d).db
```

### 恢复数据
```bash
# 恢复照片
tar -xzf photos-backup-20231201.tar.gz

# 恢复数据库
cp photos-db-backup-20231201.db server/data/photos.db
```

### 清理数据
```bash
# 停止服务
docker-compose down

# 删除所有数据（谨慎操作！）
rm -rf photo-storage/* server/data/*

# 重新启动
docker-compose up -d
```

## 维护操作

### 查看日志
```bash
# 查看所有日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f photosync
```

### 重启服务
```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart photosync
```

### 更新应用
```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose down
docker-compose build
docker-compose up -d
```

### 清理系统
```bash
# 清理未使用的镜像和容器
docker system prune -f

# 清理所有数据（谨慎操作！）
docker-compose down -v
docker system prune -af
```

## 性能优化

### 1. 增加上传限制
编辑 `server/src/routes/photos.js`:
```javascript
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 20 // 最多20个文件
  }
});
```

### 2. 启用压缩
在 `server/src/server.js` 中添加:
```javascript
const compression = require('compression');
app.use(compression());
```

### 3. 配置缓存
在 `docker-compose.yml` 中添加:
```yaml
environment:
  - NODE_ENV=production
  - REDIS_URL=redis://redis:6379
```

## 安全配置

### 1. 启用 HTTPS
使用反向代理（如 Nginx）配置 SSL 证书。

### 2. 设置访问控制
在 `server/src/server.js` 中添加认证中间件:
```javascript
const auth = require('./middleware/auth');
app.use('/api/photos', auth);
```

### 3. 限制上传来源
在 `server/src/server.js` 中配置 CORS:
```javascript
app.use(cors({
  origin: ['https://yourdomain.com'],
  credentials: true
}));
```

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查看端口占用
   netstat -tulpn | grep :8080
   
   # 修改端口
   # 编辑 docker-compose.yml 中的端口映射
   ```

2. **存储空间不足**
   ```bash
   # 查看磁盘使用
   df -h
   
   # 清理旧照片
   find photo-storage -name "*.jpg" -mtime +365 -delete
   ```

3. **内存不足**
   ```bash
   # 查看内存使用
   docker stats
   
   # 增加内存限制
   # 在 docker-compose.yml 中添加:
   # deploy:
   #   resources:
   #     limits:
   #       memory: 2G
   ```

4. **数据库损坏**
   ```bash
   # 停止服务
   docker-compose down
   
   # 备份数据库
   cp server/data/photos.db server/data/photos.db.backup
   
   # 重新初始化
   rm server/data/photos.db
   docker-compose up -d
   ```

### 日志分析
```bash
# 查看错误日志
docker-compose logs | grep ERROR

# 查看上传日志
docker-compose logs | grep "POST /api/photos"

# 查看性能日志
docker-compose logs | grep "upload"
```

## 监控

### 健康检查
```bash
# API 健康检查
curl http://localhost:8080/api/health

# 容器健康检查
docker-compose ps
```

### 资源监控
```bash
# 查看容器资源使用
docker stats

# 查看存储使用
du -sh photo-storage/
du -sh server/data/
```

## 扩展部署

### 多实例部署
```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  photosync:
    scale: 3
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

### 负载均衡
使用 Nginx 或 Traefik 进行负载均衡。

### 数据库分离
将 SQLite 替换为 PostgreSQL 或 MySQL 进行集群部署。

## 联系支持

如遇到问题，请：
1. 查看日志文件
2. 检查系统资源
3. 参考故障排除部分
4. 提交 Issue 到项目仓库
