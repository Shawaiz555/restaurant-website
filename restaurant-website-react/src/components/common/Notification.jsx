import React, { useEffect, useState } from 'react';

const Notification = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-primary to-primary-dark',
          icon: '✓',
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-red-600',
          icon: '✕',
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
          icon: 'ℹ',
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-primary to-primary-dark',
          icon: '✓',
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`fixed top-24 right-4 ${styles.bg} text-white px-6 py-4 rounded-2xl shadow-2xl z-[9999] transform transition-all duration-300 max-w-md ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold">
          {styles.icon}
        </div>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};

export default Notification;
