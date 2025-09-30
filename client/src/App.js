import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import PhotoGallery from './components/PhotoGallery';
import UploadPage from './components/UploadPage';
import PhotoDetail from './components/PhotoDetail';
import Toast from './components/Toast';
import { PhotoProvider } from './context/PhotoContext';

function App() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <PhotoProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          
          <main className="pb-20">
            <Routes>
              <Route path="/" element={<PhotoGallery showToast={showToast} />} />
              <Route path="/upload" element={<UploadPage showToast={showToast} />} />
              <Route path="/photo/:id" element={<PhotoDetail showToast={showToast} />} />
            </Routes>
          </main>
          
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </div>
      </Router>
    </PhotoProvider>
  );
}

export default App;
