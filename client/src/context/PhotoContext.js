import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { photoAPI } from '../services/api';

const PhotoContext = createContext();

// 初始状态
const initialState = {
  photos: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  filters: {
    startDate: '',
    endDate: '',
    orderBy: 'upload_date',
    order: 'DESC'
  }
};

// Reducer
function photoReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_PHOTOS':
      return {
        ...state,
        photos: action.payload.photos,
        pagination: action.payload.pagination,
        loading: false,
        error: null
      };
    
    case 'ADD_PHOTOS':
      return {
        ...state,
        photos: [...action.payload, ...state.photos],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + action.payload.length
        }
      };
    
    case 'REMOVE_PHOTO':
      return {
        ...state,
        photos: state.photos.filter(photo => photo.id !== action.payload),
        pagination: {
          ...state.pagination,
          total: Math.max(0, state.pagination.total - 1)
        }
      };
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 }
      };
    
    case 'SET_PAGE':
      return {
        ...state,
        pagination: { ...state.pagination, page: action.payload }
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
}

// Provider 组件
export function PhotoProvider({ children }) {
  const [state, dispatch] = useReducer(photoReducer, initialState);

  // 加载照片列表
  const loadPhotos = async (page = 1, append = false) => {
    try {
      if (!append) {
        dispatch({ type: 'SET_LOADING', payload: true });
      }
      
      const response = await photoAPI.getPhotos({
        page,
        limit: state.pagination.limit,
        ...state.filters
      });
      
      if (append) {
        dispatch({ type: 'ADD_PHOTOS', payload: response.data.photos });
      } else {
        dispatch({ type: 'SET_PHOTOS', payload: response.data });
      }
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // 上传照片
  const uploadPhotos = async (files, onProgress) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await photoAPI.uploadPhotos(files, onProgress);
      
      // 将新上传的照片添加到列表顶部
      dispatch({ type: 'ADD_PHOTOS', payload: response.photos });
      
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // 删除照片
  const deletePhoto = async (photoId) => {
    try {
      await photoAPI.deletePhoto(photoId);
      dispatch({ type: 'REMOVE_PHOTO', payload: photoId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // 设置过滤器
  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  // 设置页码
  const setPage = (page) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  };

  // 清除错误
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // 初始加载
  useEffect(() => {
    loadPhotos();
  }, [state.filters]);

  const value = {
    ...state,
    loadPhotos,
    uploadPhotos,
    deletePhoto,
    setFilters,
    setPage,
    clearError
  };

  return (
    <PhotoContext.Provider value={value}>
      {children}
    </PhotoContext.Provider>
  );
}

// Hook
export function usePhotos() {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error('usePhotos must be used within a PhotoProvider');
  }
  return context;
}
