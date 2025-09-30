/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Download, Calendar, Camera, FileText } from 'lucide-react';
import { photoAPI } from '../services/api';

function PhotoDetail({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    loadPhoto();
  }, [id]);

  const loadPhoto = async () => {
    try {
      setLoading(true);
      const response = await photoAPI.getPhoto(id);
      setPhoto(response.data);
    } catch (error) {
      setError(error.message);
      showToast('加载照片失败: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await photoAPI.deletePhoto(id);
      showToast('照片删除成功', 'success');
      navigate('/');
    } catch (error) {
      showToast('删除失败: ' + error.message, 'error');
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photoAPI.getPhotoImageUrl(id);
    link.download = photo.original_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <FileText className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">照片不存在</h3>
          <p className="text-gray-600 mb-4">{error || '请求的照片不存在或已被删除'}</p>
          <Link to="/" className="btn btn-primary">
            返回照片库
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 头部导航 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">照片详情</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>下载</span>
          </button>
          <button
            onClick={() => setDeleteConfirm(true)}
            className="btn btn-danger flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>删除</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 照片显示区域 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              <img
                src={photoAPI.getPhotoImageUrl(id)}
                alt={photo.original_name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden flex-col items-center justify-center text-gray-500">
                <FileText className="w-16 h-16 mb-4" />
                <p>无法加载图片</p>
              </div>
            </div>
          </div>
        </div>

        {/* 照片信息 */}
        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">文件名</label>
                <p className="text-sm text-gray-900 mt-1 break-all">{photo.original_name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">文件大小</label>
                <p className="text-sm text-gray-900 mt-1">{formatFileSize(photo.file_size)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">文件类型</label>
                <p className="text-sm text-gray-900 mt-1">{photo.mime_type}</p>
              </div>
              
              {photo.width && photo.height && (
                <div>
                  <label className="text-sm font-medium text-gray-700">图片尺寸</label>
                  <p className="text-sm text-gray-900 mt-1">{photo.width} × {photo.height}</p>
                </div>
              )}
            </div>
          </div>

          {/* 拍摄信息 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">拍摄信息</h3>
            
            <div className="space-y-3">
              {photo.capture_date && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">拍摄日期</label>
                    <p className="text-sm text-gray-900">{formatDate(photo.capture_date)}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-700">上传日期</label>
                  <p className="text-sm text-gray-900">{formatDate(photo.upload_date)}</p>
                </div>
              </div>
              
              {(photo.camera_make || photo.camera_model) && (
                <div className="flex items-center space-x-3">
                  <Camera className="w-4 h-4 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">拍摄设备</label>
                    <p className="text-sm text-gray-900">
                      {[photo.camera_make, photo.camera_model].filter(Boolean).join(' ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 操作历史 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">操作历史</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">创建时间</span>
                <span className="text-gray-900">{formatDate(photo.created_at)}</span>
              </div>
              
              {photo.updated_at !== photo.created_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">更新时间</span>
                  <span className="text-gray-900">{formatDate(photo.updated_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 删除确认对话框 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              确认删除
            </h3>
            <p className="text-gray-600 mb-6">
              确定要删除这张照片吗？此操作不可撤销。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="btn btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoDetail;
