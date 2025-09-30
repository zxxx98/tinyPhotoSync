import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api',
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // 服务器返回错误状态码
      const message = error.response.data?.message || error.response.data?.error || '请求失败';
      throw new Error(message);
    } else if (error.request) {
      // 请求已发出但没有收到响应
      throw new Error('网络连接失败，请检查网络设置');
    } else {
      // 其他错误
      throw new Error(error.message || '未知错误');
    }
  },
);

// 照片相关API
export const photoAPI = {
  // 获取照片列表
  getPhotos: async (params = {}) => {
    const response = await api.get('/photos', { params });
    return response.data;
  },

  // 获取单张照片信息
  getPhoto: async (id) => {
    const response = await api.get(`/photos/${id}`);
    return response.data;
  },

  // 上传照片
  uploadPhotos: async (files, onProgress) => {
    const formData = new FormData();
    
    // 添加文件到FormData
    Array.from(files).forEach((file) => {
      formData.append('photos', file);
    });

    const response = await api.post('/photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          
          // 计算上传速度
          const speed = progressEvent.loaded / (Date.now() - progressEvent.startTime) * 1000;
          const speedMBps = (speed / (1024 * 1024)).toFixed(2);
          
          onProgress({
            percent: percentCompleted,
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            speed: speedMBps,
          });
        }
      },
    });

    return response.data;
  },

  // 删除照片
  deletePhoto: async (id) => {
    const response = await api.delete(`/photos/${id}`);
    return response.data;
  },

  // 获取照片图片URL
  getPhotoImageUrl: (id) => {
    return `/api/photos/${id}/image`;
  },

  // 获取照片缩略图URL
  getPhotoThumbnailUrl: (id) => {
    return `/api/photos/${id}/thumbnail`;
  },
};

// 健康检查API
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
