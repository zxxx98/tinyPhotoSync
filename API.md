# PhotoSync API 文档

## 基础信息

- 基础 URL: `http://localhost:8080/api`
- 内容类型: `application/json` (除文件上传外)
- 文件上传: `multipart/form-data`

## 认证

当前版本无需认证，所有 API 接口均可直接访问。

## 错误处理

所有 API 响应都遵循以下格式：

### 成功响应
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误类型",
  "message": "错误描述"
}
```

### HTTP 状态码
- `200` - 成功
- `400` - 请求参数错误
- `404` - 资源不存在
- `413` - 文件过大或数量过多
- `429` - 请求过于频繁
- `500` - 服务器内部错误

## API 接口

### 1. 健康检查

#### GET /api/health
检查服务状态

**响应示例:**
```json
{
  "status": "ok",
  "timestamp": "2023-12-01T10:00:00.000Z",
  "uptime": 3600
}
```

---

### 2. 照片管理

#### POST /api/photos
上传照片

**请求参数:**
- `photos`: 文件数组 (multipart/form-data)
- 支持格式: JPEG, PNG, GIF, WebP, HEIC
- 单个文件最大: 10MB
- 单次最多: 10个文件

**请求示例:**
```javascript
const formData = new FormData();
formData.append('photos', file1);
formData.append('photos', file2);

fetch('/api/photos', {
  method: 'POST',
  body: formData
});
```

**响应示例:**
```json
{
  "success": true,
  "message": "成功上传 2 张照片",
  "photos": [
    {
      "id": 1,
      "filename": "uuid-filename.jpg",
      "originalName": "IMG_001.jpg",
      "fileSize": 2048576,
      "captureDate": "2023-11-30",
      "width": 1920,
      "height": 1080,
      "cameraMake": "Apple",
      "cameraModel": "iPhone 13",
      "uploadDate": "2023-12-01T10:00:00.000Z"
    }
  ]
}
```

#### GET /api/photos
获取照片列表

**查询参数:**
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20)
- `startDate`: 开始日期 (YYYY-MM-DD)
- `endDate`: 结束日期 (YYYY-MM-DD)
- `orderBy`: 排序字段 (upload_date/capture_date/file_size)
- `order`: 排序顺序 (ASC/DESC)

**请求示例:**
```javascript
fetch('/api/photos?page=1&limit=10&startDate=2023-11-01&endDate=2023-11-30')
```

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "filename": "uuid-filename.jpg",
      "original_name": "IMG_001.jpg",
      "file_path": "/app/storage/2023/11/30/uuid-filename.jpg",
      "file_size": 2048576,
      "mime_type": "image/jpeg",
      "capture_date": "2023-11-30",
      "upload_date": "2023-12-01T10:00:00.000Z",
      "width": 1920,
      "height": 1080,
      "camera_make": "Apple",
      "camera_model": "iPhone 13",
      "url": "/api/photos/1/image",
      "thumbnailUrl": "/api/photos/1/thumbnail"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### GET /api/photos/:id
获取单张照片信息

**路径参数:**
- `id`: 照片ID

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "filename": "uuid-filename.jpg",
    "original_name": "IMG_001.jpg",
    "file_path": "/app/storage/2023/11/30/uuid-filename.jpg",
    "file_size": 2048576,
    "mime_type": "image/jpeg",
    "capture_date": "2023-11-30",
    "upload_date": "2023-12-01T10:00:00.000Z",
    "width": 1920,
    "height": 1080,
    "camera_make": "Apple",
    "camera_model": "iPhone 13",
    "created_at": "2023-12-01T10:00:00.000Z",
    "updated_at": "2023-12-01T10:00:00.000Z",
    "url": "/api/photos/1/image",
    "thumbnailUrl": "/api/photos/1/thumbnail"
  }
}
```

#### GET /api/photos/:id/image
获取照片原图

**路径参数:**
- `id`: 照片ID

**响应:**
- 直接返回图片文件
- Content-Type: 根据文件类型设置
- Cache-Control: public, max-age=31536000

#### GET /api/photos/:id/thumbnail
获取照片缩略图

**路径参数:**
- `id`: 照片ID

**响应:**
- 直接返回缩略图文件
- Content-Type: 根据文件类型设置
- Cache-Control: public, max-age=31536000

#### DELETE /api/photos/:id
删除照片

**路径参数:**
- `id`: 照片ID

**响应示例:**
```json
{
  "success": true,
  "message": "照片删除成功"
}
```

## 数据模型

### Photo 对象
```typescript
interface Photo {
  id: number;                    // 照片ID
  filename: string;             // 存储文件名
  original_name: string;         // 原始文件名
  file_path: string;            // 文件路径
  file_size: number;            // 文件大小(字节)
  mime_type: string;            // MIME类型
  capture_date: string;         // 拍摄日期(YYYY-MM-DD)
  upload_date: string;         // 上传日期(ISO 8601)
  width: number;               // 图片宽度
  height: number;              // 图片高度
  camera_make: string;          // 相机品牌
  camera_model: string;         // 相机型号
  created_at: string;          // 创建时间(ISO 8601)
  updated_at: string;          // 更新时间(ISO 8601)
  url: string;                 // 原图访问URL
  thumbnailUrl: string;         // 缩略图访问URL
}
```

### Pagination 对象
```typescript
interface Pagination {
  page: number;        // 当前页码
  limit: number;        // 每页数量
  total: number;        // 总记录数
  totalPages: number;   // 总页数
}
```

## 使用示例

### JavaScript/TypeScript

#### 上传照片
```typescript
async function uploadPhotos(files: File[]): Promise<any> {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('photos', file);
  });

  const response = await fetch('/api/photos', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('上传失败');
  }

  return response.json();
}
```

#### 获取照片列表
```typescript
async function getPhotos(params: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}): Promise<any> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`/api/photos?${queryParams}`);
  return response.json();
}
```

#### 删除照片
```typescript
async function deletePhoto(id: number): Promise<void> {
  const response = await fetch(`/api/photos/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('删除失败');
  }
}
```

### Python

#### 上传照片
```python
import requests

def upload_photos(file_paths):
    files = []
    for path in file_paths:
        files.append(('photos', open(path, 'rb')))
    
    response = requests.post('http://localhost:8080/api/photos', files=files)
    
    for file in files:
        file[1].close()
    
    return response.json()
```

#### 获取照片列表
```python
import requests

def get_photos(page=1, limit=20, start_date=None, end_date=None):
    params = {
        'page': page,
        'limit': limit
    }
    
    if start_date:
        params['startDate'] = start_date
    if end_date:
        params['endDate'] = end_date
    
    response = requests.get('http://localhost:8080/api/photos', params=params)
    return response.json()
```

### cURL

#### 上传照片
```bash
curl -X POST \
  -F "photos=@/path/to/image1.jpg" \
  -F "photos=@/path/to/image2.jpg" \
  http://localhost:8080/api/photos
```

#### 获取照片列表
```bash
curl "http://localhost:8080/api/photos?page=1&limit=10"
```

#### 删除照片
```bash
curl -X DELETE http://localhost:8080/api/photos/1
```

## 限制和注意事项

1. **文件大小限制**: 单个文件最大 10MB
2. **文件数量限制**: 单次最多上传 10 个文件
3. **速率限制**: 15分钟内最多 100 个请求，1分钟内最多 10 次上传
4. **支持格式**: JPEG, PNG, GIF, WebP, HEIC, HEIF
5. **存储结构**: 按年/月/日自动组织存储
6. **EXIF 支持**: 自动提取拍摄日期和相机信息

## 错误码说明

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| `LIMIT_FILE_SIZE` | 文件过大 | 压缩图片或选择更小的文件 |
| `LIMIT_FILE_COUNT` | 文件数量过多 | 分批上传 |
| `LIMIT_UNEXPECTED_FILE` | 文件类型不支持 | 使用支持的图片格式 |
| `RATE_LIMIT_EXCEEDED` | 请求过于频繁 | 等待后重试 |
| `FILE_NOT_FOUND` | 文件不存在 | 检查文件路径 |
| `DATABASE_ERROR` | 数据库错误 | 检查服务状态 |
