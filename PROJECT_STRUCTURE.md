# PhotoSync 项目结构

## 整体架构

```
PhotoSync/
├── 📁 client/                    # 前端应用 (React)
│   ├── 📁 public/                # 静态资源
│   │   ├── index.html            # HTML 模板
│   │   └── manifest.json          # PWA 配置
│   ├── 📁 src/                   # 源代码
│   │   ├── 📁 components/         # React 组件
│   │   │   ├── Header.js         # 头部导航
│   │   │   ├── PhotoGallery.js   # 照片库
│   │   │   ├── UploadPage.js     # 上传页面
│   │   │   ├── PhotoDetail.js    # 照片详情
│   │   │   └── Toast.js          # 消息提示
│   │   ├── 📁 context/           # React Context
│   │   │   └── PhotoContext.js   # 照片状态管理
│   │   ├── 📁 services/          # API 服务
│   │   │   └── api.js            # HTTP 客户端
│   │   ├── App.js                # 主应用组件
│   │   ├── index.js              # 应用入口
│   │   └── index.css             # 全局样式
│   ├── package.json              # 前端依赖
│   ├── tailwind.config.js         # Tailwind 配置
│   └── postcss.config.js          # PostCSS 配置
├── 📁 server/                    # 后端应用 (Node.js)
│   ├── 📁 src/                   # 源代码
│   │   ├── 📁 database/          # 数据库相关
│   │   │   └── database.js       # SQLite 操作
│   │   ├── 📁 routes/            # API 路由
│   │   │   └── photos.js         # 照片相关接口
│   │   ├── server.js             # 生产环境服务器
│   │   └── server.dev.js         # 开发环境服务器
│   ├── 📁 storage/               # 照片存储目录
│   ├── 📁 data/                  # 数据库文件
│   └── package.json              # 后端依赖
├── 📄 Dockerfile                 # 生产环境构建
├── 📄 Dockerfile.dev             # 开发环境构建
├── 📄 docker-compose.yml         # 生产环境编排
├── 📄 docker-compose.dev.yml     # 开发环境编排
├── 📄 package.json               # 根项目配置
├── 📄 start.sh                   # Linux/macOS 启动脚本
├── 📄 start.bat                  # Windows 启动脚本
├── 📄 .gitignore                 # Git 忽略文件
├── 📄 .dockerignore              # Docker 忽略文件
├── 📄 README.md                  # 项目说明
├── 📄 DEPLOYMENT.md              # 部署指南
├── 📄 API.md                     # API 文档
└── 📄 PROJECT_STRUCTURE.md       # 项目结构说明
```

## 技术栈详解

### 后端技术栈
- **Node.js 18+**: JavaScript 运行时
- **Express.js**: Web 框架
- **Multer**: 文件上传处理
- **EXIF-parser**: 照片元数据提取
- **SQLite3**: 轻量级数据库
- **Helmet**: 安全中间件
- **CORS**: 跨域资源共享
- **Rate Limiting**: 请求频率限制

### 前端技术栈
- **React 18**: 用户界面库
- **React Router**: 路由管理
- **Tailwind CSS**: 样式框架
- **Axios**: HTTP 客户端
- **React Dropzone**: 文件拖拽上传
- **Lucide React**: 图标库
- **React Intersection Observer**: 无限滚动

### 部署技术栈
- **Docker**: 容器化
- **Docker Compose**: 容器编排
- **多阶段构建**: 优化镜像大小
- **数据卷挂载**: 数据持久化

## 核心功能模块

### 1. 照片上传模块
```
📁 server/src/routes/photos.js
├── POST /api/photos              # 多文件上传
├── 文件类型验证                  # 支持 JPEG, PNG, GIF, WebP, HEIC
├── 文件大小限制                  # 单个文件最大 10MB
├── EXIF 数据提取                 # 拍摄日期、相机信息
├── 按日期组织存储                # 年/月/日 目录结构
└── 数据库记录创建                # 元数据存储
```

### 2. 照片管理模块
```
📁 server/src/routes/photos.js
├── GET /api/photos               # 分页查询
├── GET /api/photos/:id           # 单张照片信息
├── GET /api/photos/:id/image     # 原图访问
├── GET /api/photos/:id/thumbnail # 缩略图访问
└── DELETE /api/photos/:id        # 删除照片
```

### 3. 数据库模块
```
📁 server/src/database/database.js
├── SQLite 数据库初始化           # 自动创建表和索引
├── 照片元数据存储                # 文件名、大小、日期等
├── 分页查询支持                  # 高效的数据检索
├── 日期范围过滤                  # 按拍摄日期筛选
└── 数据完整性保证                # 事务处理
```

### 4. 前端界面模块
```
📁 client/src/components/
├── PhotoGallery.js               # 照片库展示
│   ├── 瀑布流布局                # 响应式网格
│   ├── 无限滚动加载              # 性能优化
│   ├── 批量选择操作              # 多选删除
│   ├── 日期筛选功能              # 按时间过滤
│   └── 搜索和排序                # 多种排序方式
├── UploadPage.js                 # 文件上传界面
│   ├── 拖拽上传支持              # 直观的文件选择
│   ├── 多文件同时上传            # 批量处理
│   ├── 实时进度显示              # 上传状态反馈
│   ├── 上传速度计算              # 性能监控
│   └── 错误处理和重试            # 稳定性保证
└── PhotoDetail.js                # 照片详情页面
    ├── 大图预览                  # 高质量显示
    ├── EXIF 信息展示             # 元数据显示
    ├── 下载功能                  # 文件下载
    └── 删除确认                  # 安全操作
```

## 数据流架构

### 上传流程
```
用户选择文件 → 前端验证 → 拖拽到上传区域 → 
FormData 构建 → POST /api/photos → 
Multer 处理 → EXIF 提取 → 
文件存储 → 数据库记录 → 返回结果
```

### 查询流程
```
用户访问照片库 → GET /api/photos → 
数据库查询 → 分页处理 → 
URL 生成 → JSON 响应 → 
前端渲染 → 无限滚动加载
```

### 存储结构
```
storage/
├── 2023/
│   ├── 11/
│   │   ├── 30/
│   │   │   ├── uuid-1.jpg
│   │   │   └── uuid-2.png
│   │   └── 31/
│   │       └── uuid-3.jpg
│   └── 12/
│       └── 01/
│           └── uuid-4.jpg
└── ...
```

## 安全特性

### 1. 文件安全
- 文件类型白名单验证
- 文件大小限制
- 恶意文件检测
- 安全文件名生成

### 2. 请求安全
- CORS 跨域保护
- Helmet 安全头设置
- 请求频率限制
- 输入参数验证

### 3. 数据安全
- SQL 注入防护
- 文件路径安全
- 错误信息脱敏
- 日志安全记录

## 性能优化

### 1. 前端优化
- 图片懒加载
- 虚拟滚动
- 组件缓存
- 代码分割

### 2. 后端优化
- 数据库索引
- 文件缓存
- 压缩中间件
- 连接池管理

### 3. 部署优化
- 多阶段构建
- 镜像层缓存
- 静态资源 CDN
- 负载均衡支持

## 扩展性设计

### 1. 水平扩展
- 无状态服务设计
- 数据库分离支持
- 负载均衡兼容
- 容器化部署

### 2. 功能扩展
- 插件化架构
- API 版本管理
- 中间件系统
- 配置外部化

### 3. 存储扩展
- 多存储后端支持
- 云存储集成
- 备份恢复机制
- 数据迁移工具
