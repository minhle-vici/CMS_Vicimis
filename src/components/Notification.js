"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    
    // Tự động xóa sau 3 giây
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="notification-container">
        {notifications.map((n) => (
          <Toast key={n.id} message={n.message} type={n.type} onClose={() => setNotifications(prev => prev.filter(item => item.id !== n.id))} />
        ))}
      </div>

      <style jsx global>{`
        .notification-container {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
        }

        .toast-card {
          pointer-events: auto;
          min-width: 300px;
          max-width: 400px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(15px) saturate(180%);
          -webkit-backdrop-filter: blur(15px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          animation: toastSlideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          overflow: hidden;
        }

        @keyframes toastSlideIn {
          from { transform: translateX(100%) scale(0.9); opacity: 0; }
          to { transform: translateX(0) scale(1); opacity: 1; }
        }

        .toast-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .toast-success .toast-icon { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .toast-error .toast-icon { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
        .toast-info .toast-icon { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }

        .toast-content {
          flex: 1;
        }

        .toast-message {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.4;
        }

        .toast-close {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 20px;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s;
          display: flex;
        }

        .toast-close:hover {
          background: rgba(0, 0, 0, 0.05);
          color: #475569;
        }

        .toast-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: currentColor;
          opacity: 0.3;
          width: 100%;
          animation: toastProgress 3s linear forwards;
        }

        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </NotificationContext.Provider>
  );
};

const Toast = ({ message, type, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return 'bx-check-circle';
      case 'error': return 'bx-error-circle';
      case 'info': return 'bx-info-circle';
      default: return 'bx-bell';
    }
  };

  return (
    <div className={`toast-card toast-${type}`}>
      <div className="toast-icon">
        <i className={`bx ${getIcon()}`}></i>
      </div>
      <div className="toast-content">
        <div className="toast-message">{message}</div>
      </div>
      <button className="toast-close" onClick={onClose}>
        <i className='bx bx-x'></i>
      </button>
      <div className="toast-progress"></div>
    </div>
  );
};
