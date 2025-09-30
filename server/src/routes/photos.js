const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const ExifParser = require('exif-parser');

const { insertPhoto, getPhotos, getPhotoById, deletePhoto } = require('../database/database');

const router = express.Router();

// 配置 multer 用于文件上传
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // 创建基于日期的目录结构
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      
      const uploadPath = path.join(__dirname, '../../storage', year.toString(), month, day);
      await fs.ensureDir(uploadPath);
      
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10 // 最多10个文件
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    const allowedTypes = /jpeg|jpg|png|gif|webp|heic|heif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件 (JPEG, PNG, GIF, WebP, HEIC)'));
    }
  }
});

// 从文件提取EXIF信息
async function extractExifData(filePath) {
  try {
    const buffer = await fs.readFile(filePath);
    const parser = ExifParser.create(buffer);
    const result = parser.parse();
    
    let captureDate = null;
    let width = null;
    let height = null;
    let cameraMake = null;
    let cameraModel = null;
    
    if (result.tags) {
      // 提取拍摄日期
      if (result.tags.DateTimeOriginal) {
        captureDate = result.tags.DateTimeOriginal.split(' ')[0].replace(/:/g, '-');
      } else if (result.tags.DateTime) {
        captureDate = result.tags.DateTime.split(' ')[0].replace(/:/g, '-');
      }
      
      // 提取图片尺寸
      if (result.imageSize) {
        width = result.imageSize.width;
        height = result.imageSize.height;
      }
      
      // 提取相机信息
      cameraMake = result.tags.Make || null;
      cameraModel = result.tags.Model || null;
    }
    
    return {
      captureDate,
      width,
      height,
      cameraMake,
      cameraModel
    };
  } catch (error) {
    console.warn('提取EXIF信息失败:', error.message);
    return {
      captureDate: null,
      width: null,
      height: null,
      cameraMake: null,
      cameraModel: null
    };
  }
}

// 上传照片
router.post('/', upload.array('photos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '没有上传文件' });
    }
    
    const uploadedPhotos = [];
    
    for (const file of req.files) {
      try {
        // 提取EXIF信息
        const exifData = await extractExifData(file.path);
        
        // 如果没有拍摄日期，使用上传日期
        const captureDate = exifData.captureDate || 
          new Date().toISOString().split('T')[0];
        
        // 保存到数据库
        const photoData = {
          filename: file.filename,
          originalName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype,
          captureDate,
          width: exifData.width,
          height: exifData.height,
          cameraMake: exifData.cameraMake,
          cameraModel: exifData.cameraModel
        };
        
        const photoId = await insertPhoto(photoData);
        
        uploadedPhotos.push({
          id: photoId,
          filename: file.filename,
          originalName: file.originalname,
          fileSize: file.size,
          captureDate,
          width: exifData.width,
          height: exifData.height,
          cameraMake: exifData.cameraMake,
          cameraModel: exifData.cameraModel,
          uploadDate: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('处理文件失败:', file.originalname, error);
        // 删除已上传的文件
        await fs.remove(file.path);
      }
    }
    
    res.json({
      success: true,
      message: `成功上传 ${uploadedPhotos.length} 张照片`,
      photos: uploadedPhotos
    });
    
  } catch (error) {
    console.error('上传失败:', error);
    res.status(500).json({ 
      error: '上传失败', 
      message: error.message 
    });
  }
});

// 查询照片列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      orderBy = 'upload_date',
      order = 'DESC'
    } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate,
      orderBy,
      order: order.toUpperCase()
    };
    
    const result = await getPhotos(options);
    
    // 为每张照片添加访问URL
    const photosWithUrls = result.photos.map(photo => ({
      ...photo,
      url: `/api/photos/${photo.id}/image`,
      thumbnailUrl: `/api/photos/${photo.id}/thumbnail`
    }));
    
    res.json({
      success: true,
      data: photosWithUrls,
      pagination: result.pagination
    });
    
  } catch (error) {
    console.error('查询照片失败:', error);
    res.status(500).json({ 
      error: '查询失败', 
      message: error.message 
    });
  }
});

// 获取单张照片信息
router.get('/:id', async (req, res) => {
  try {
    const photoId = parseInt(req.params.id);
    
    if (isNaN(photoId)) {
      return res.status(400).json({ error: '无效的照片ID' });
    }
    
    const photo = await getPhotoById(photoId);
    
    if (!photo) {
      return res.status(404).json({ error: '照片不存在' });
    }
    
    // 添加访问URL
    photo.url = `/api/photos/${photo.id}/image`;
    photo.thumbnailUrl = `/api/photos/${photo.id}/thumbnail`;
    
    res.json({
      success: true,
      data: photo
    });
    
  } catch (error) {
    console.error('获取照片信息失败:', error);
    res.status(500).json({ 
      error: '获取失败', 
      message: error.message 
    });
  }
});

// 获取照片图片文件
router.get('/:id/image', async (req, res) => {
  try {
    const photoId = parseInt(req.params.id);
    
    if (isNaN(photoId)) {
      return res.status(400).json({ error: '无效的照片ID' });
    }
    
    const photo = await getPhotoById(photoId);
    
    if (!photo) {
      return res.status(404).json({ error: '照片不存在' });
    }
    
    // 检查文件是否存在
    const fileExists = await fs.pathExists(photo.file_path);
    if (!fileExists) {
      return res.status(404).json({ error: '照片文件不存在' });
    }
    
    // 设置响应头
    res.setHeader('Content-Type', photo.mime_type);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 缓存1年
    
    // 发送文件
    res.sendFile(path.resolve(photo.file_path));
    
  } catch (error) {
    console.error('获取照片文件失败:', error);
    res.status(500).json({ 
      error: '获取失败', 
      message: error.message 
    });
  }
});

// 获取照片缩略图
router.get('/:id/thumbnail', async (req, res) => {
  try {
    const photoId = parseInt(req.params.id);
    
    if (isNaN(photoId)) {
      return res.status(400).json({ error: '无效的照片ID' });
    }
    
    const photo = await getPhotoById(photoId);
    
    if (!photo) {
      return res.status(404).json({ error: '照片不存在' });
    }
    
    // 检查文件是否存在
    const fileExists = await fs.pathExists(photo.file_path);
    if (!fileExists) {
      return res.status(404).json({ error: '照片文件不存在' });
    }
    
    // 设置响应头
    res.setHeader('Content-Type', photo.mime_type);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 缓存1年
    
    // 发送文件（这里简化处理，实际应该生成缩略图）
    res.sendFile(path.resolve(photo.file_path));
    
  } catch (error) {
    console.error('获取缩略图失败:', error);
    res.status(500).json({ 
      error: '获取失败', 
      message: error.message 
    });
  }
});

// 删除照片
router.delete('/:id', async (req, res) => {
  try {
    const photoId = parseInt(req.params.id);
    
    if (isNaN(photoId)) {
      return res.status(400).json({ error: '无效的照片ID' });
    }
    
    const photo = await getPhotoById(photoId);
    
    if (!photo) {
      return res.status(404).json({ error: '照片不存在' });
    }
    
    // 删除文件
    try {
      await fs.remove(photo.file_path);
    } catch (error) {
      console.warn('删除文件失败:', error.message);
    }
    
    // 删除数据库记录
    const deleted = await deletePhoto(photoId);
    
    if (deleted) {
      res.json({
        success: true,
        message: '照片删除成功'
      });
    } else {
      res.status(500).json({ 
        error: '删除失败', 
        message: '数据库操作失败' 
      });
    }
    
  } catch (error) {
    console.error('删除照片失败:', error);
    res.status(500).json({ 
      error: '删除失败', 
      message: error.message 
    });
  }
});

module.exports = router;
