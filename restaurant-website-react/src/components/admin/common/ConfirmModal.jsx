import React from 'react';

const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  variant = 'danger', // 'danger' or 'warning' or 'info'
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      button: 'bg-red-500 hover:bg-red-600 text-white',
      icon: '⚠️',
    },
    warning: {
      button: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      icon: '⚡',
    },
    info: {
      button: 'bg-blue-500 hover:bg-blue-600 text-white',
      icon: 'ℹ️',
    },
  };

  const style = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center text-4xl mx-auto">
            {style.icon}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-sans text-dark text-center mb-2">{title}</h2>

        {/* Message */}
        <p className="text-dark-gray text-center mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-xl bg-gray-200 text-dark font-semibold hover:bg-gray-300 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors ${style.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
