import React from 'react';
import { Loader2 } from 'lucide-react';

export default function AuthButton({
  type = 'submit',
  variant = 'primary',
  children,
  loading = false,
  loadingText = 'Processing...',
  disabled = false,
  onClick,
  icon: Icon,
  className = '',
}) {
  const isPrimary = variant === 'primary';
  const buttonClass = isPrimary ? 'auth-button-primary' : 'auth-button-secondary';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${buttonClass} ${className}`}
      aria-busy={loading}
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={18} strokeWidth={2.2} />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
