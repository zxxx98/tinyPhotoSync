# PhotoSync - 照片同步应用

一个自托管的照片同步应用，允许用户通过手机浏览器将照片上传到远端服务器，并按拍摄日期自动组织存储。

## 项目特性

- 📱 移动端优先的响应式设计
- 📸 支持多张照片同时上传
- 📅 按拍摄日期自动组织存储
- 📊 实时上传进度显示
- 🐳 单容器部署，易于管理
- 💾 数据持久化存储

## 技术栈

### 后端
- Node.js + Express.js
- Multer (文件上传处理)
- EXIF-parser (照片元数据读取)
- SQLite (元数据存储)

### 前端
- React
- Tailwind CSS
- Axios (HTTP客户端)

### 部署
- Docker + Docker Compose
- 多阶段构建

## 快速开始

1. 克隆项目
```bash
git clone <repository-url>
cd photosync
```

2. 启动应用
```bash
docker-compose up -d
```

3. 访问应用
打开浏览器访问 `http://localhost:8080`

## 项目结构

```
photosync/
├── client/                 # 前端应用
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # 后端应用
│   ├── src/
│   ├── package.json
│   └── storage/           # 照片存储目录
├── Dockerfile             # 多阶段构建配置
├── docker-compose.yml     # 容器编排配置
└── README.md
```

## API 接口

- `POST /api/photos` - 上传照片
- `GET /api/photos` - 查询照片列表
- `GET /api/photos/:id` - 获取单张照片信息
- `DELETE /api/photos/:id` - 删除照片

## 许可证

MIT License
