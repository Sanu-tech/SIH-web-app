import React from 'react';
import { Toast } from '../types';
import ToastNotification from './ToastNotification';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            // Fix: The 'id' prop was missing. Spreading the 'toast' object passes 'id', 'message', and 'type'.
            {...toast}
            onDismiss={() => onDismiss(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;