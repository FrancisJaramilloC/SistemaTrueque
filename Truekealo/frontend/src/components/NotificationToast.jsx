import React, { useEffect } from 'react';

const NotificationToast = ({ notifications, onRemove }) => {
  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          {...notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

const Notification = ({ id, message, type, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        {message}
      </div>
      <button
        className="notification-close"
        onClick={() => onRemove(id)}
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  );
};

export default NotificationToast;
