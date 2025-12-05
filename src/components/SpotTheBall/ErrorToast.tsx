'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

interface ErrorToastProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  onRetry?: () => void;
}

/**
 * ErrorToast - Inline error notification for transaction failures
 * Features:
 * - Clear error description
 * - "Try Again" button
 * - Auto-dismiss after 4 seconds
 * - Manual close option
 */
export const ErrorToast: React.FC<ErrorToastProps> = ({
  isOpen,
  message,
  onClose,
  onRetry,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Handle open/close animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (!isOpen) return;

    const dismissTimer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(dismissTimer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed top-4 left-4 right-4
        z-50
        transition-all duration-300
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}
    >
      <div
        className="
          flex items-start gap-3
          bg-red-950/95 backdrop-blur-lg
          border border-red-500/30
          rounded-2xl
          p-4
          shadow-lg shadow-red-500/20
        "
      >
        {/* Error Icon */}
        <div
          className="
            flex-shrink-0
            w-10 h-10
            bg-red-500/20
            rounded-full
            flex items-center justify-center
          "
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-red-400 font-semibold text-sm mb-0.5">
            Transaction Failed
          </h4>
          <p className="text-red-300/80 text-xs leading-relaxed truncate">
            {message || 'Something went wrong. Please try again.'}
          </p>

          {/* Retry Button */}
          {onRetry && (
            <button
              onClick={onRetry}
              className="
                flex items-center gap-1.5
                mt-2
                text-red-400 text-xs font-medium
                hover:text-red-300
                transition-colors
              "
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="
            flex-shrink-0
            w-6 h-6
            flex items-center justify-center
            rounded-full
            text-red-400/60
            hover:text-red-400 hover:bg-red-500/20
            transition-colors
          "
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ErrorToast;
