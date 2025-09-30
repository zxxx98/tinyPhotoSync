const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');

const DB_PATH = path.join(__dirname, '../../data/photos.db');

let db = null;

// 初始化数据库
async function initializeDatabase() {
  try {
    // 确保数据目录存在
    await fs.ensureDir(path.dirname(DB_PATH));
    
    return new Promise((resolve, reject) => {
      db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('数据库连接失败:', err);
          reject(err);
          return;
        }
        
        console.log('📊 SQLite 数据库连接成功');
        
        // 创建照片表
        db.serialize(() => {
          db.run(`
            CREATE TABLE IF NOT EXISTS photos (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              filename TEXT NOT NULL,
              original_name TEXT NOT NULL,
              file_path TEXT NOT NULL,
              file_size INTEGER NOT NULL,
              mime_type TEXT NOT NULL,
              capture_date DATE,
              upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
              width INTEGER,
              height INTEGER,
              camera_make TEXT,
              camera_model TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `, (err) => {
            if (err) {
              console.error('创建照片表失败:', err);
              reject(err);
              return;
            }
            
            // 创建索引
            db.run(`
              CREATE INDEX IF NOT EXISTS idx_photos_capture_date 
              ON photos(capture_date)
            `);
            
            db.run(`
              CREATE INDEX IF NOT EXISTS idx_photos_upload_date 
              ON photos(upload_date)
            `);
            
            console.log('📊 数据库表初始化完成');
            resolve();
          });
        });
      });
    });
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

// 获取数据库实例
function getDatabase() {
  if (!db) {
    throw new Error('数据库未初始化');
  }
  return db;
}

// 插入照片记录
function insertPhoto(photoData) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const sql = `
      INSERT INTO photos (
        filename, original_name, file_path, file_size, mime_type,
        capture_date, width, height, camera_make, camera_model
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      photoData.filename,
      photoData.originalName,
      photoData.filePath,
      photoData.fileSize,
      photoData.mimeType,
      photoData.captureDate,
      photoData.width,
      photoData.height,
      photoData.cameraMake,
      photoData.cameraModel
    ];
    
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
}

// 查询照片列表
function getPhotos(options = {}) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const { 
      page = 1, 
      limit = 20, 
      startDate, 
      endDate,
      orderBy = 'upload_date',
      order = 'DESC'
    } = options;
    
    let sql = 'SELECT * FROM photos WHERE 1=1';
    const params = [];
    
    // 日期范围过滤
    if (startDate) {
      sql += ' AND capture_date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      sql += ' AND capture_date <= ?';
      params.push(endDate);
    }
    
    // 排序
    sql += ` ORDER BY ${orderBy} ${order}`;
    
    // 分页
    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      // 获取总数
      let countSql = 'SELECT COUNT(*) as total FROM photos WHERE 1=1';
      const countParams = [];
      
      if (startDate) {
        countSql += ' AND capture_date >= ?';
        countParams.push(startDate);
      }
      
      if (endDate) {
        countSql += ' AND capture_date <= ?';
        countParams.push(endDate);
      }
      
      db.get(countSql, countParams, (err, countResult) => {
        if (err) {
          reject(err);
          return;
        }
        
        resolve({
          photos: rows,
          pagination: {
            page,
            limit,
            total: countResult.total,
            totalPages: Math.ceil(countResult.total / limit)
          }
        });
      });
    });
  });
}

// 根据ID查询单张照片
function getPhotoById(id) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const sql = 'SELECT * FROM photos WHERE id = ?';
    
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

// 删除照片记录
function deletePhoto(id) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const sql = 'DELETE FROM photos WHERE id = ?';
    
    db.run(sql, [id], function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes > 0);
    });
  });
}

// 关闭数据库连接
function closeDatabase() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('关闭数据库连接失败:', err);
      } else {
        console.log('数据库连接已关闭');
      }
    });
  }
}

module.exports = {
  initializeDatabase,
  getDatabase,
  insertPhoto,
  getPhotos,
  getPhotoById,
  deletePhoto,
  closeDatabase
};
