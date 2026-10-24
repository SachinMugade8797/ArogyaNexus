import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function AuthSuccess({ message, onDismiss, action }) {
  if (!message) return null;

  return (
    <div className="auth-alert auth-alert-success" role="status">
      <CheckCircle2 size={18} strokeWidth={2.2} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>
        <div>{message}</div>
        {action && <div style={{ marginTop: '0.4rem' }}>{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          style={{ color: 'inherit', opacity: 0.8, cursor: 'pointer', padding: '0 4px', fontSize: '1.1rem' }}
          aria-label="Dismiss message"
        >
          &times;
        </button>
      )}
    </div>
  );
}
