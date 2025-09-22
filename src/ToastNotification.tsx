import React, { useState, useEffect } from 'react';
import { Toast } from '../types';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XIcon } from './icons/Icons';

interface ToastNotificationProps extends Toast {
  onDismiss: () => void;
}

const ICONS = {
  success: <CheckCircleIcon className="h-6 w-6 text-success" aria-hidden="true" />,
  error: <XCircleIcon className="h-6 w-6 text-danger" aria-hidden="true" />,
  info: <InformationCircleIcon className="h-6 w-6 text-info" aria-hidden="true" />,
};

const ToastNotification: React.FC<ToastNotificationProps> = ({ message, type, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onDismiss, 300); // Wait for exit animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 300);
  };
  
  const animationClasses = isExiting
    ? 'animate-[slide-out-right_0.3s_ease-in-out_forwards]'
    : 'animate-[slide-in-right_0.3s_ease-in-out_forwards]';


  return (
    <div
      className={`max-w-sm w-full bg-surface/80 dark:bg-neutral-800/80 backdrop-blur-md shadow-lg rounded-box pointer-events-auto ring-1 ring-black ring-opacity-5 border border-white/20 dark:border-white/10 overflow-hidden ${animationClasses}`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {ICONS[type]}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-surface-content dark:text-neutral-100">
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleDismiss}
              className="inline-flex text-gray-400 rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <span className="sr-only">Close</span>
              <XIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add keyframes for custom animations to index.html if not already present.
// For the purpose of this component, let's assume the keyframes are defined in CSS.
const style = document.createElement('style');
style.innerHTML = `
  @keyframes slide-in-right {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slide-out-right {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);


export default ToastNotification;
