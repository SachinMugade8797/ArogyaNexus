import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthBranding from '../components/auth/AuthBranding';
import PasswordInput from '../components/auth/PasswordInput';
import PasswordStrength from '../components/auth/PasswordStrength';
import AuthButton from '../components/auth/AuthButton';
import AuthError from '../components/auth/AuthError';
import AuthSuccess from '../components/auth/AuthSuccess';
import TrustIndicators from '../components/auth/TrustIndicators';

export default function ResetPasswordPage({ onToast }) {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [completed, setCompleted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.newPassword) {
      errs.newPassword = 'Please enter your new password.';
    } else if (formData.newPassword.length < 8) {
      errs.newPassword = 'Password must be at least 8 characters long.';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Please confirm your new password.';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    // Mock password update
    setTimeout(() => {
      setLoading(false);
      setCompleted(true);
      setSuccessMessage('Your password has been successfully updated.');
      if (onToast) {
        onToast({
          type: 'success',
          title: 'Password Updated',
          message: 'Your account credentials have been securely refreshed. You may now sign in.'
        });
      }
    }, 1300);
  };

  return (
    <AuthLayout split={false}>
      <div className="auth-form-container animate-fade-in" style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <AuthBranding minimal />
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <h1 className="auth-card-title">Create a new password</h1>
            <p className="auth-card-subtitle">
              Ensure your new password is secure and meets strength requirements.
            </p>
          </div>

          <AuthError message={generalError} onDismiss={() => setGeneralError('')} />

          {completed ? (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--success-50)',
                  color: 'var(--success-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                  border: '1px solid var(--success-200)',
                }}
              >
                <CheckCircle2 size={32} />
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
                Password Updated Successfully
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', lineHeight: '1.5', marginBottom: '1.75rem' }}>
                Your account password has been changed. You can now use your new password to sign in to MedNexus.
              </p>

              <Link
                to="/login"
                className="auth-button-primary"
                style={{ textDecoration: 'none', textAlign: 'center' }}
              >
                Sign In to Your Account &rarr;
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <PasswordInput
                id="reset-newPassword"
                name="newPassword"
                label="New Password"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                error={errors.newPassword}
                autoComplete="new-password"
                required
              />

              {formData.newPassword && <PasswordStrength password={formData.newPassword} />}

              <PasswordInput
                id="reset-confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                autoComplete="new-password"
                required
              />

              <AuthButton
                type="submit"
                loading={loading}
                loadingText="Updating Password..."
                icon={ShieldCheck}
              >
                Update Password
              </AuthButton>
            </form>
          )}

          <div className="auth-card-footer" style={{ display: 'flex', justifyContent: 'center' }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.875rem',
                color: 'var(--slate-600)',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </Link>
          </div>

          <TrustIndicators />
        </div>
      </div>
    </AuthLayout>
  );
}
