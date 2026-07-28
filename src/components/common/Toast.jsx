import React from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: '100%',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-fade-in flex-row items-center justify-between gap-md"
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--eclipse)',
            color: 'var(--pure-white)',
            boxShadow: 'var(--shadow-medium)',
            fontSize: '14px',
          }}
        >
          <div className="flex-row items-center gap-sm">
            {toast.type === 'success' && <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />}
            {toast.type === 'error' && <AlertCircle size={18} style={{ color: 'var(--error)' }} />}
            {toast.type === 'warning' && <AlertCircle size={18} style={{ color: 'var(--warning)' }} />}
            {toast.type === 'info' && <Info size={18} style={{ color: 'var(--swiss-coffee)' }} />}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => removeToast(toast.id)} style={{ color: 'var(--zorba)' }}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
