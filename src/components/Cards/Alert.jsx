// Alert.jsx
import React, { useState, useEffect } from 'react';

const Alert = ({ message, type = 'success', onClose, autoClose = true, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          if (onClose) onClose();
        }, 300); // Wait for fade-out animation
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);
  
  const getAlertColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };
  
  return isVisible ? (
    <div className={`fixed top-4 right-4 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`px-4 py-3 rounded-lg shadow-md border ${getAlertColor()} flex items-center`}>
        <div className="flex-grow">{message}</div>
        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => {
              if (onClose) onClose();
            }, 300);
          }}
          className="ml-3 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
    </div>
  ) : null;
};

export default Alert;