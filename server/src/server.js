const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs-extra');

const photoRoutes = require('./routes/photos');
const { initializeDatabase } = require('./database/database');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS 配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: '请求过于频繁，请稍后再试'
});
app.use('/api/', limiter);

// 文件上传限制
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 10, // 限制每个IP 1分钟内最多10次上传
  message: '上传过于频繁，请稍后再试'
});
app.use('/api/photos', uploadLimiter);

// 解析 JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务 - 托管前端应用
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: '1d',
  etag: true
}));

// API 路由
app.use('/api/photos', photoRoutes);

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 处理前端路由 - SPA 支持
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ 
      error: '文件过大', 
      message: '单个文件大小不能超过10MB' 
    });
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(413).json({ 
      error: '文件数量过多', 
      message: '单次最多上传10个文件' 
    });
  }
  
  res.status(500).json({ 
    error: '服务器内部错误', 
    message: process.env.NODE_ENV === 'production' ? '服务暂时不可用' : err.message 
  });
});

// 启动服务器
async function startServer() {
  try {
    // 确保存储目录存在
    await fs.ensureDir(path.join(__dirname, '../storage'));
    await fs.ensureDir(path.join(__dirname, '../data'));
    
    // 初始化数据库
    await initializeDatabase();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 PhotoSync 服务器启动成功！`);
      console.log(`📱 访问地址: http://localhost:${PORT}`);
      console.log(`📊 API 文档: http://localhost:${PORT}/api/health`);
      console.log(`📁 存储目录: ${path.join(__dirname, '../storage')}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
