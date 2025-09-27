/**
 * Toast通知组件
 * 提供优雅的通知反馈体验
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number; // 毫秒，0表示不自动消失
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

interface ToastContainerProps {
  messages: ToastMessage[];
  onClose: (id: string) => void;
}

// 单个Toast组件
const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // 进入动画
    setIsVisible(true);

    // 自动关闭
    if (message.duration && message.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, message.duration);

      return () => clearTimeout(timer);
    }
  }, [message.duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(message.id);
    }, 300); // 等待退出动画完成
  };

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBgColor = () => {
    switch (message.type) {
      case 'success':
        return 'bg-white border-l-4 border-l-green-500';
      case 'error':
        return 'bg-white border-l-4 border-l-red-500';
      case 'warning':
        return 'bg-white border-l-4 border-l-orange-500';
      case 'info':
        return 'bg-white border-l-4 border-l-blue-500';
      default:
        return 'bg-white border-l-4 border-l-gray-500';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out mb-4
        ${isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
        }
        ${getBgColor()}
        rounded-lg shadow-lg p-4 max-w-md w-full
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>

        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">
            {message.title}
          </p>
          {message.message && (
            <p className="mt-1 text-sm text-gray-500">
              {message.message}
            </p>
          )}

          {message.action && (
            <div className="mt-3">
              <button
                onClick={() => {
                  message.action!.onClick();
                  handleClose();
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                {message.action.label}
              </button>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 ml-4">
          <button
            onClick={handleClose}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 进度条（如果有持续时间） */}
      {message.duration && message.duration > 0 && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
          <div
            className={`h-1 rounded-full ${
              message.type === 'success'
                ? 'bg-green-500'
                : message.type === 'error'
                ? 'bg-red-500'
                : message.type === 'warning'
                ? 'bg-orange-500'
                : 'bg-blue-500'
            }`}
            style={{
              animation: `shrink ${message.duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
};

// Toast容器组件
export const ToastContainer: React.FC<ToastContainerProps> = ({ messages, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50">
      {messages.map((message) => (
        <Toast
          key={message.id}
          message={message}
          onClose={onClose}
        />
      ))}

      {/* CSS动画定义 */}
      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

// Toast管理Hook
export const useToast = () => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration ?? 4000 // 默认4秒
    };

    setMessages(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const clearAll = () => {
    setMessages([]);
  };

  // 便捷方法
  const toast = {
    success: (title: string, message?: string, options?: Partial<ToastMessage>) =>
      addToast({ ...options, type: 'success', title, message }),

    error: (title: string, message?: string, options?: Partial<ToastMessage>) =>
      addToast({ ...options, type: 'error', title, message, duration: 0 }), // 错误消息默认不自动消失

    warning: (title: string, message?: string, options?: Partial<ToastMessage>) =>
      addToast({ ...options, type: 'warning', title, message }),

    info: (title: string, message?: string, options?: Partial<ToastMessage>) =>
      addToast({ ...options, type: 'info', title, message }),

    custom: (toast: Omit<ToastMessage, 'id'>) => addToast(toast)
  };

  return {
    messages,
    toast,
    removeToast,
    clearAll
  };
};

export default Toast;