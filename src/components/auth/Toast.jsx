import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts = [], onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="assertive">
      {toasts.map((toast) => {
        const Icon = toast.type === 'error' ? AlertCircle : toast.type === 'info' ? Info : CheckCircle2;
        return (
          <div key={toast.id} className={`toast-item ${toast.type || 'info'}`} role="alert">
            <Icon
              size={18}
              strokeWidth={2.2}
              style={{
                flexShrink: 0,
                color:
                  toast.type === 'error'
                    ? 'var(--error-600)'
                    : toast.type === 'info'
                    ? 'var(--primary-600)'
                    : 'var(--success-600)',
              }}
            />
            <div style={{ flex: 1 }}>
              {toast.title && <div style={{ fontWeight: 600, marginBottom: '2px' }}>{toast.title}</div>}
              <div>{toast.message}</div>
            </div>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => onRemove(toast.id)}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
