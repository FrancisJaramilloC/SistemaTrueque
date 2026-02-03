import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import NotificationToast from '../components/NotificationToast';

const DialogContext = createContext();

export const DialogProvider = ({ children }) => {
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const confirm = useCallback(({
    title = 'Confirmar',
    message = '',
    confirmText = 'Aceptar',
    cancelText = 'Cancelar',
    variant = 'primary'
  } = {}) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        id: Date.now(),
        title,
        message,
        confirmText,
        cancelText,
        variant,
        onConfirm: () => {
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(null);
          resolve(false);
        }
      });
    });
  }, []);

  const notify = useCallback(({ message = '', type = 'info', duration = 3000 } = {}) => {
    const id = Date.now();
    const notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    if (duration) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const value = {
    confirm,
    notify,
    removeNotification
  };

  return (
    <DialogContext.Provider value={value}>
      {children}
      {confirmDialog && <ConfirmDialog {...confirmDialog} />}
      <NotificationToast notifications={notifications} onRemove={removeNotification} />
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog debe usarse dentro de DialogProvider');
  }
  return context;
};
