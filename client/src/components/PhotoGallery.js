import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { usePhotos } from '../context/PhotoContext';
import { Calendar, Filter, Search, Trash2, Eye, Camera } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

function PhotoGallery({ showToast }) {
  const {
    photos,
    loading,
    error,
    pagination,
    filters,
    loadPhotos,
    deletePhoto,
    setFilters,
    setPage,
    clearError
  } = usePhotos();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // 无限滚动
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // 当滚动到底部时加载更多
  useEffect(() => {
    if (inView && !loading && pagination.page < pagination.totalPages) {
      setPage(pagination.page + 1);
      loadPhotos(pagination.page + 1, true);
    }
  }, [inView, loading, pagination.page, pagination.totalPages]);

  // 处理过滤器变化
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setSelectedPhotos(new Set());
  };

  // 处理照片选择
  const togglePhotoSelection = (photoId) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedPhotos.size === 0) return;

    try {
      const deletePromises = Array.from(selectedPhotos).map(id => deletePhoto(id));
      await Promise.all(deletePromises);
      
      showToast(`成功删除 ${selectedPhotos.size} 张照片`, 'success');
      setSelectedPhotos(new Set());
      setDeleteConfirm(null);
    } catch (error) {
      showToast('删除失败: ' + error.message, 'error');
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // 格式化日期
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 标题和操作栏 */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">照片库</h1>
            <p className="text-gray-600 mt-1">
              共 {pagination.total} 张照片
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* 过滤器按钮 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>筛选</span>
            </button>
            
            {/* 批量操作 */}
            {selectedPhotos.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  已选择 {selectedPhotos.size} 张
                </span>
                <button
                  onClick={() => setDeleteConfirm(selectedPhotos.size)}
                  className="btn btn-danger flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>删除</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 过滤器面板 */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  开始日期
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange({ startDate: e.target.value })}
                  className="input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  结束日期
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange({ endDate: e.target.value })}
                  className="input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  排序方式
                </label>
                <select
                  value={filters.orderBy}
                  onChange={(e) => handleFilterChange({ orderBy: e.target.value })}
                  className="input"
                >
                  <option value="upload_date">上传时间</option>
                  <option value="capture_date">拍摄时间</option>
                  <option value="file_size">文件大小</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  排序顺序
                </label>
                <select
                  value={filters.order}
                  onChange={(e) => handleFilterChange({ order: e.target.value })}
                  className="input"
                >
                  <option value="DESC">降序</option>
                  <option value="ASC">升序</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => handleFilterChange({ startDate: '', endDate: '' })}
                className="btn btn-secondary"
              >
                清除筛选
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* 照片网格 */}
      {photos.length > 0 ? (
        <div className="photo-grid">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`photo-item group ${
                selectedPhotos.has(photo.id) ? 'ring-2 ring-primary-500' : ''
              }`}
              onClick={() => togglePhotoSelection(photo.id)}
            >
              <img
                src={photo.thumbnailUrl}
                alt={photo.original_name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              
              {/* 悬停时显示的操作按钮 */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  <Link
                    to={`/photo/${photo.id}`}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Eye className="w-4 h-4 text-gray-700" />
                  </Link>
                </div>
              </div>
              
              {/* 选择指示器 */}
              {selectedPhotos.has(photo.id) && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              )}
              
              {/* 照片信息 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="truncate">{photo.original_name}</div>
                <div className="flex justify-between items-center mt-1">
                  <span>{formatFileSize(photo.file_size)}</span>
                  <span>{formatDate(photo.capture_date || photo.upload_date)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无照片</h3>
          <p className="text-gray-600 mb-4">开始上传您的第一张照片吧！</p>
          <Link to="/upload" className="btn btn-primary">
            上传照片
          </Link>
        </div>
      )}

      {/* 加载更多指示器 */}
      {pagination.page < pagination.totalPages && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {loading ? (
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
              <span>加载中...</span>
            </div>
          ) : (
            <div className="text-gray-500">滚动到底部加载更多</div>
          )}
        </div>
      )}

      {/* 删除确认对话框 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              确认删除
            </h3>
            <p className="text-gray-600 mb-6">
              确定要删除选中的 {deleteConfirm} 张照片吗？此操作不可撤销。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleBatchDelete}
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

export default PhotoGallery;
