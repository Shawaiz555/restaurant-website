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
      className={`fixed top-20 sm:top-24 right-3 sm:right-4 ${styles.bg} text-white px-3.5 py-2.5 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-2xl z-[9999] transform transition-all duration-300 w-72 sm:w-80 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex items-start gap-2 sm:gap-2.5">
        <div className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 rounded-full bg-white/20 flex items-center justify-center font-bold flex-shrink-0 text-[10px] sm:text-xs">
          {styles.icon}
        </div>
        <span className="font-medium text-xs sm:text-sm leading-snug">{message}</span>
      </div>
    </div>
  );
};

export default Notification;
