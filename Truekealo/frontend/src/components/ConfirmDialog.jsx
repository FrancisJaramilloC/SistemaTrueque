import React, { useEffect, useRef } from 'react';

const ConfirmDialog = ({
  id,
  title,
  message,
  confirmText,
  cancelText,
  variant,
  onConfirm,
  onCancel
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="dialog-overlay" onClick={handleBackdropClick}>
      <div className="dialog-content" ref={dialogRef}>
        <div className="dialog-header">
          <h2>{title}</h2>
        </div>
        <div className="dialog-body">
          <p>{message}</p>
        </div>
        <div className="dialog-footer">
          <button
            onClick={onCancel}
            className="btn btn-secondary"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`btn btn-${variant}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
