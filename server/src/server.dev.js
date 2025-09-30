const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs-extra');

const photoRoutes = require('./routes/photos');
const { initializeDatabase } = require('./database/database');

const app = express();
const PORT = process.env.PORT || 3000;

// 开发环境配置
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS 配置 - 开发环境允许所有来源
app.use(cors({
  origin: true,
  credentials: true
}));

// 解析 JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务 - 开发环境代理到前端开发服务器
app.use('/api', photoRoutes);

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: 'development'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    error: '服务器内部错误', 
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
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
      console.log(`🚀 PhotoSync 开发服务器启动成功！`);
      console.log(`📱 API 地址: http://localhost:${PORT}/api`);
      console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
      console.log(`📁 存储目录: ${path.join(__dirname, '../storage')}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
