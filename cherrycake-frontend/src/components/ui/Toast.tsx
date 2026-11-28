import { useEffect } from 'react';

type ToastProps = {
  message: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'warning';
};

export default function Toast({
  message,
  onClose,
  type = 'error',
}: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const bgStyles = {
    error: 'linear-gradient(135deg, rgba(142, 18, 48, 0.95), rgba(76, 5, 25, 0.98))',
    warning: 'linear-gradient(135deg, rgba(161, 98, 7, 0.95), rgba(113, 63, 18, 0.98))',
    success: 'linear-gradient(135deg, rgba(22, 101, 52, 0.95), rgba(20, 83, 45, 0.98))',
  };

  const borderColors = {
    error: 'rgba(230, 57, 96, 0.75)',
    warning: 'rgba(234, 179, 8, 0.75)',
    success: 'rgba(34, 197, 94, 0.75)',
  };

  const shadowColors = {
    error: '0 12px 36px rgba(230, 57, 96, 0.35)',
    warning: '0 12px 36px rgba(202, 138, 4, 0.35)',
    success: '0 12px 36px rgba(22, 101, 52, 0.35)',
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        bottom: 92,
        right: 28,
        background: bgStyles[type] || bgStyles.error,
        border: `1.5px solid ${borderColors[type] || borderColors.error}`,
        color: '#ffffff',
        padding: '14px 20px',
        borderRadius: '16px',
        boxShadow: shadowColors[type] || shadowColors.error,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 4000,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        maxWidth: 'min(460px, calc(100vw - 32px))',
        animation: 'slideUp 0.25s ease-out',
      }}
    >
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {type === 'error' && (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffb7c5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
        {type === 'warning' && (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fde047" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )}
        {type === 'success' && (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#86efac" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        )}
      </div>

      <div style={{ flex: 1, fontSize: '0.92rem', lineHeight: 1.4, fontWeight: 500 }}>
        {message}
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.75)',
          fontSize: '1.25rem',
          cursor: 'pointer',
          padding: '0 4px',
          lineHeight: 1,
          transition: 'color 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ×
      </button>
    </div>
  );
}
