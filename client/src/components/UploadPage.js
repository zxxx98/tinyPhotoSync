/* eslint-disable react/no-unknown-property */
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { usePhotos } from '../context/PhotoContext';
import { X, CheckCircle, AlertCircle, Camera, Folder } from 'lucide-react';

function UploadPage({ showToast }) {
  const { uploadPhotos } = usePhotos();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState({
    totalFiles: 0,
    uploadedFiles: 0,
    totalSize: 0,
    uploadedSize: 0,
    speed: 0,
  });
  const [isMobile, setIsMobile] = useState(false);

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isMobileDevice || isTouchDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 文件拖拽处理
  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending', // pending, uploading, success, error
      progress: 0,
      error: null,
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // 更新统计信息
    const totalSize = [...files, ...newFiles].reduce((sum, f) => sum + f.file.size, 0);
    setUploadStats(prev => ({
      ...prev,
      totalFiles: files.length + newFiles.length,
      totalSize,
    }));
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.heic', '.heif'],
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading,
  });

  // 处理文件夹上传
  const handleFolderUpload = useCallback((event) => {
    const files = event.target.files;
    if (files.length === 0) return;

    // 将FileList转换为数组并过滤图片文件
    const imageFiles = Array.from(files).filter(file => {
      const allowedTypes = /jpeg|jpg|png|gif|webp|heic|heif/i;
      return allowedTypes.test(file.type) || allowedTypes.test(file.name);
    });

    if (imageFiles.length === 0) {
      showToast('所选文件夹中没有找到图片文件', 'warning');
      return;
    }

    // 检查文件大小
    const oversizedFiles = imageFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      showToast(`有 ${oversizedFiles.length} 个文件超过10MB限制，将被跳过`, 'warning');
    }

    // 过滤掉超大文件
    const validFiles = imageFiles.filter(file => file.size <= 10 * 1024 * 1024);

    // 按照多文件上传的逻辑处理
    const newFiles = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0,
      error: null,
    }));

    setFiles(prev => [...prev, ...newFiles]);
    
    // 更新统计信息
    const totalSize = [...files, ...newFiles].reduce((sum, f) => sum + f.file.size, 0);
    setUploadStats(prev => ({
      ...prev,
      totalFiles: files.length + newFiles.length,
      totalSize,
    }));

    showToast(`从文件夹中选择了 ${validFiles.length} 张图片`, 'success');
  }, [files, showToast]);

  // 移除文件
  const removeFile = (fileId) => {
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId);
      const totalSize = newFiles.reduce((sum, f) => sum + f.file.size, 0);
      setUploadStats(prevStats => ({
        ...prevStats,
        totalFiles: newFiles.length,
        totalSize,
      }));
      return newFiles;
    });
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // 上传文件
  const handleUpload = async () => {
    if (files.length === 0) {
      showToast('请先选择要上传的文件', 'warning');
      return;
    }

    setUploading(true);
    setUploadStats(prev => ({
      ...prev,
      uploadedFiles: 0,
      uploadedSize: 0,
      speed: 0,
    }));

    try {
      const fileObjects = files.map(f => f.file);
      const startTime = Date.now();
      
      const result = await uploadPhotos(fileObjects, (progress) => {
        // 更新总体进度
        const uploadedSize = (progress.loaded / progress.total) * uploadStats.totalSize;
        const elapsedTime = (Date.now() - startTime) / 1000;
        const speed = progress.loaded / elapsedTime;
        
        setUploadStats(prev => ({
          ...prev,
          uploadedSize,
          speed: speed / (1024 * 1024), // MB/s
        }));
        
        // 更新单个文件进度
        setFiles(prev => prev.map(fileItem => ({
          ...fileItem,
          progress: progress.percent,
          status: 'uploading',
        })));
      });

      showToast(`成功上传 ${result.photos.length} 张照片`, 'success');
      setFiles([]);
      
    } catch (error) {
      showToast('上传失败: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  // 清空所有文件
  const clearAllFiles = () => {
    setFiles([]);
    setUploadStats({
      totalFiles: 0,
      uploadedFiles: 0,
      totalSize: 0,
      uploadedSize: 0,
      speed: 0,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">上传照片</h1>
        <p className="text-gray-600 mt-1">
          选择或拖拽照片文件到下方区域进行上传
        </p>
      </div>

      {/* 上传区域 */}
      <div className="space-y-4">
        {/* 拖拽上传区域 */}
        <div
          {...getRootProps()}
          className={`upload-zone ${isDragActive ? 'active' : ''} ${
            uploading ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? '松开鼠标上传文件' : '点击或拖拽文件到此处'}
            </p>
            <p className="text-gray-600 text-sm">
              支持 JPEG、PNG、GIF、WebP、HEIC 格式，单个文件最大 10MB
            </p>
          </div>
        </div>

        {/* 文件夹上传区域 */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-gray-500">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span className="text-sm">或</span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>
          
          <div className="mt-4">
            <label 
              htmlFor="folder-upload"
              className={`inline-flex items-center px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors ${
                uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <Folder className="w-5 h-5 mr-3 text-primary-500" />
              {isMobile ? '选择文件夹' : '选择文件夹上传'}
            </label>
            <input
              id="folder-upload"
              type="file"
              webkitdirectory="true"
              directory="true"
              multiple
              onChange={handleFolderUpload}
              disabled={uploading}
              className="hidden"
              accept="image/*"
            />
          </div>
          
          <div className="mt-3 space-y-1">
            <p className="text-sm text-gray-600">
              选择包含图片的文件夹，将自动识别其中的所有图片文件
            </p>
            {isMobile && (
              <p className="text-xs text-blue-600">
                💡 移动端：在文件管理器中选择文件夹，系统会自动读取其中的所有图片
              </p>
            )}
            <p className="text-xs text-gray-500">
              支持递归读取子文件夹中的图片文件
            </p>
          </div>
        </div>
      </div>

      {/* 上传统计 */}
      {uploadStats.totalFiles > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">上传统计</h3>
            <div className="flex space-x-2">
              <button
                onClick={clearAllFiles}
                disabled={uploading}
                className="btn btn-secondary text-sm"
              >
                清空
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                className="btn btn-primary text-sm"
              >
                {uploading ? '上传中...' : '开始上传'}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {uploadStats.totalFiles}
              </div>
              <div className="text-sm text-gray-600">总文件数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {uploadStats.uploadedFiles}
              </div>
              <div className="text-sm text-gray-600">已上传</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatFileSize(uploadStats.totalSize)}
              </div>
              <div className="text-sm text-gray-600">总大小</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {uploadStats.speed.toFixed(1)} MB/s
              </div>
              <div className="text-sm text-gray-600">上传速度</div>
            </div>
          </div>
          
          {/* 总体进度条 */}
          {uploading && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>总体进度</span>
                <span>
                  {uploadStats.totalSize > 0 
                    ? Math.round((uploadStats.uploadedSize / uploadStats.totalSize) * 100)
                    : 0}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: uploadStats.totalSize > 0 
                      ? `${(uploadStats.uploadedSize / uploadStats.totalSize) * 100}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              待上传文件 ({files.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {files.map((fileItem) => (
              <div key={fileItem.id} className="p-4 flex items-center space-x-4">
                {/* 文件图标 */}
                <div className="flex-shrink-0">
                  {fileItem.status === 'success' ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : fileItem.status === 'error' ? (
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Camera className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                </div>
                
                {/* 文件信息 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileItem.file.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(fileItem.file.size)}
                  </p>
                  
                  {/* 进度条 */}
                  {fileItem.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${fileItem.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* 错误信息 */}
                  {fileItem.status === 'error' && fileItem.error && (
                    <p className="text-sm text-red-600 mt-1">
                      {fileItem.error}
                    </p>
                  )}
                </div>
                
                {/* 操作按钮 */}
                {!uploading && (
                  <button
                    onClick={() => removeFile(fileItem.id)}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadPage;
