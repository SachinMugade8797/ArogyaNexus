import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function AuthInput({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  required = false,
  optional = false,
  autoComplete,
  disabled = false,
  headerAction,
  helperText,
}) {
  return (
    <div className="form-group">
      <div className="form-label-row">
        <label htmlFor={id} className="form-label">
          {label}
          {optional && <span className="form-label-optional"> (Optional)</span>}
        </label>
        {headerAction && <div>{headerAction}</div>}
      </div>

      <div className="input-wrapper">
        {Icon && (
          <span className="input-leading-icon" aria-hidden="true">
            <Icon size={18} strokeWidth={2} />
          </span>
        )}

        <input
          id={id}
          name={name || id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`auth-input-field ${Icon ? 'has-leading-icon' : ''} ${error ? 'input-error' : ''}`}
        />
      </div>

      {helperText && !error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
          {helperText}
        </span>
      )}

      {error && (
        <div id={`${id}-error`} className="auth-error-message" role="alert">
          <AlertCircle size={14} strokeWidth={2.2} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
