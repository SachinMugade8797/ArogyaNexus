import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function AuthError({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="auth-alert auth-alert-error" role="alert">
      <AlertCircle size={18} strokeWidth={2.2} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>{message}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          style={{ color: 'inherit', opacity: 0.8, cursor: 'pointer', padding: '0 4px', fontSize: '1.1rem' }}
          aria-label="Dismiss error"
        >
          &times;
        </button>
      )}
    </div>
  );
}
