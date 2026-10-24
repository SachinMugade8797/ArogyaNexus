import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function PasswordInput({
  id = 'password',
  name = 'password',
  label = 'Password',
  value,
  onChange,
  placeholder = '••••••••',
  error,
  autoComplete = 'current-password',
  headerAction,
  disabled = false,
  required = false
}) {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="form-group">
      <div className="form-label-row">
        <label htmlFor={id} className="form-label">
          {label}
        </label>
        {headerAction && <div>{headerAction}</div>}
      </div>

      <div className="input-wrapper">
        <span className="input-leading-icon" aria-hidden="true">
          <Lock size={18} strokeWidth={2} />
        </span>

        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`auth-input-field has-leading-icon has-trailing-icon ${error ? 'input-error' : ''}`}
        />

        <button
          type="button"
          className="input-trailing-btn"
          onClick={toggleVisibility}
          disabled={disabled}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          title={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff size={18} strokeWidth={2} />
          ) : (
            <Eye size={18} strokeWidth={2} />
          )}
        </button>
      </div>

      {error && (
        <div id={`${id}-error`} className="auth-error-message" role="alert">
          <AlertCircle size={14} strokeWidth={2.2} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
