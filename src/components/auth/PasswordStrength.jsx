import React from 'react';
import { Check, X } from 'lucide-react';

export default function PasswordStrength({ password = '' }) {
  const criteria = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = criteria.filter((c) => c.met).length;

  let strengthLabel = 'Too weak';
  let strengthClass = 'weak';

  if (score === 0) {
    strengthLabel = 'Enter password';
    strengthClass = '';
  } else if (score <= 1) {
    strengthLabel = 'Weak';
    strengthClass = 'weak';
  } else if (score <= 3) {
    strengthLabel = 'Moderate';
    strengthClass = 'medium';
  } else {
    strengthLabel = 'Strong';
    strengthClass = 'strong';
  }

  return (
    <div className="password-strength-container" aria-live="polite">
      <div className="password-strength-bars">
        <div className={`strength-bar-segment ${score >= 1 ? strengthClass : ''}`} />
        <div className={`strength-bar-segment ${score >= 2 ? strengthClass : ''}`} />
        <div className={`strength-bar-segment ${score >= 3 ? strengthClass : ''}`} />
        <div className={`strength-bar-segment ${score >= 4 ? strengthClass : ''}`} />
      </div>

      <div className="password-strength-info">
        <span>Password strength:</span>
        <span className={`password-strength-badge ${strengthClass}`}>
          {password ? strengthLabel : 'Required'}
        </span>
      </div>

      <div className="password-requirements-list">
        {criteria.map((item, idx) => (
          <div key={idx} className={`password-req-item ${item.met ? 'met' : ''}`}>
            {item.met ? (
              <Check size={12} strokeWidth={2.6} />
            ) : (
              <X size={12} strokeWidth={2.4} />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
