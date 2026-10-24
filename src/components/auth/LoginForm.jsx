import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import RoleSelector from './RoleSelector';
import AuthInput from './AuthInput';
import PasswordInput from './PasswordInput';
import AuthButton from './AuthButton';
import AuthError from './AuthError';
import AuthSuccess from './AuthSuccess';
import TrustIndicators from './TrustIndicators';
import AuthBranding from './AuthBranding';

export default function LoginForm({ onToast }) {
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Role changes reset field-level errors and update context
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setErrors({});
    setGeneralError('');
    setSuccessMessage('');
  };

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Please enter your password.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
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

    // Mock authentication interaction
    setTimeout(() => {
      setLoading(false);
      const roleCapitalized = role.charAt(0).toUpperCase() + role.slice(1);
      
      setSuccessMessage(`Welcome back! Authenticated successfully as ${roleCapitalized}.`);
      if (onToast) {
        onToast({
          type: 'success',
          title: 'Sign In Successful',
          message: `Logged in as ${roleCapitalized} (${email}). Demo session established.`
        });
      }
    }, 1200);
  };

  return (
    <div className="auth-card animate-fade-in">
      {/* Branding for Mobile view where left panel is hidden */}
      <div className="auth-mobile-header" style={{ marginBottom: '1.25rem' }}>
        <AuthBranding minimal />
      </div>

      <div className="auth-card-header">
        <h2 className="auth-card-title">Welcome Back</h2>
        <p className="auth-card-subtitle">Sign in to continue to MedNexus.</p>
      </div>

      {/* Role Selector */}
      <RoleSelector selectedRole={role} onSelectRole={handleRoleChange} />

      {/* Dynamic Role Greeting & Subheading */}
      <div style={{ marginBottom: '1.25rem' }}>
        {role === 'patient' && (
          <h3 style={{ fontSize: '1.125rem', color: 'var(--slate-800)', fontWeight: 600 }}>
            Welcome back, Patient
          </h3>
        )}

        {role === 'doctor' && (
          <h3 style={{ fontSize: '1.125rem', color: 'var(--slate-800)', fontWeight: 600 }}>
            Welcome back, Doctor
          </h3>
        )}

        {role === 'admin' && (
          <div className="admin-badge-notice">
            <ShieldAlert size={18} color="var(--slate-700)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>Administrator Access</div>
              <div>Secure access for authorized platform administrators.</div>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Alerts */}
      <AuthError message={generalError} onDismiss={() => setGeneralError('')} />
      <AuthSuccess message={successMessage} onDismiss={() => setSuccessMessage('')} />

      {/* Form */}
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <AuthInput
          id="login-email"
          name="email"
          type="email"
          label="Email address"
          placeholder={role === 'doctor' ? 'doctor@hospital.org' : 'name@example.com'}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          icon={Mail}
          error={errors.email}
          autoComplete="email"
          required
        />

        <PasswordInput
          id="login-password"
          name="password"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={errors.password}
          autoComplete="current-password"
          required
          headerAction={
            <Link to="/forgot-password" className="form-forgot-link">
              Forgot password?
            </Link>
          }
        />

        <AuthButton
          type="submit"
          loading={loading}
          loadingText="Signing in..."
          icon={ArrowRight}
        >
          Sign In
        </AuthButton>
      </form>

      {/* Bottom Switcher Links depending on Selected Role */}
      {role === 'patient' && (
        <div className="auth-card-footer">
          <span>New to MedNexus?</span>
          <Link to="/register/patient">Create Patient Account</Link>
        </div>
      )}

      {role === 'doctor' && (
        <div className="auth-card-footer">
          <span>Are you a healthcare professional?</span>
          <Link to="/register/doctor">Register as Doctor</Link>
        </div>
      )}

      {role === 'admin' && (
        <div className="auth-card-footer" style={{ color: 'var(--slate-500)', fontSize: '0.8125rem' }}>
          <span>Administrator accounts are provisioned via platform governance only.</span>
        </div>
      )}

      {/* Trust Indicators */}
      <TrustIndicators />
    </div>
  );
}
