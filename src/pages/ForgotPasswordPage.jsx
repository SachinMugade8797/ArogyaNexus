import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthBranding from '../components/auth/AuthBranding';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';
import AuthError from '../components/auth/AuthError';
import AuthSuccess from '../components/auth/AuthSuccess';
import TrustIndicators from '../components/auth/TrustIndicators';

export default function ForgotPasswordPage({ onToast }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    // Mock reset link generation
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      if (onToast) {
        onToast({
          type: 'success',
          title: 'Reset Link Dispatched',
          message: `Password reset link sent to ${email}. Check your inbox or spam folder.`
        });
      }
    }, 1200);
  };

  return (
    <AuthLayout split={false}>
      <div className="auth-form-container animate-fade-in" style={{ maxWidth: '460px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <AuthBranding minimal />
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <h1 className="auth-card-title">Forgot your password?</h1>
            <p className="auth-card-subtitle">
              Enter your email address and we'll help you reset your password.
            </p>
          </div>

          <AuthError message={error} onDismiss={() => setError('')} />

          {submitted ? (
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
                Check your inbox
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                We've dispatched a secure password reset link to <strong>{email}</strong>.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link
                  to="/reset-password"
                  className="auth-button-primary"
                  style={{ textDecoration: 'none', textAlign: 'center' }}
                >
                  Proceed to Reset Password UI (Demo)
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                  }}
                  className="auth-button-secondary"
                >
                  Send another link
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <AuthInput
                id="forgot-email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                icon={Mail}
                error={error}
                autoComplete="email"
                required
              />

              <AuthButton
                type="submit"
                loading={loading}
                loadingText="Sending Reset Link..."
                icon={Send}
              >
                Send Reset Link
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
