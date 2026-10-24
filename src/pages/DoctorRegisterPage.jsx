import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Stethoscope,
  FileBadge,
  Building2,
  MapPin,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Info
} from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthBranding from '../components/auth/AuthBranding';
import AuthInput from '../components/auth/AuthInput';
import PasswordInput from '../components/auth/PasswordInput';
import PasswordStrength from '../components/auth/PasswordStrength';
import AuthButton from '../components/auth/AuthButton';
import AuthError from '../components/auth/AuthError';
import AuthSuccess from '../components/auth/AuthSuccess';
import TrustIndicators from '../components/auth/TrustIndicators';

const MEDICAL_SPECIALTIES = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Gynecology & Obstetrics',
  'Oncology',
  'Endocrinology',
  'Pulmonology',
  'Ophthalmology'
];

export default function DoctorRegisterPage({ onToast }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    medicalSpeciality: '',
    registrationNumber: '',
    clinicName: '',
    clinicAddress: '',
    consultationFee: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Please enter your full professional name.';
    if (!formData.email.trim()) {
      errs.email = 'Please enter your professional email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.phoneNumber.trim()) {
      errs.phoneNumber = 'Please enter your contact phone number.';
    }

    if (!formData.medicalSpeciality) {
      errs.medicalSpeciality = 'Please select your medical speciality.';
    }

    if (!formData.registrationNumber.trim()) {
      errs.registrationNumber = 'Please enter your Medical Council / License registration number.';
    }

    if (!formData.clinicName.trim()) {
      errs.clinicName = 'Please enter your hospital or clinic name.';
    }

    if (!formData.clinicAddress.trim()) {
      errs.clinicAddress = 'Please enter your primary clinic address.';
    }

    if (!formData.consultationFee.trim()) {
      errs.consultationFee = 'Please specify your standard consultation fee.';
    } else if (isNaN(Number(formData.consultationFee)) || Number(formData.consultationFee) <= 0) {
      errs.consultationFee = 'Please enter a valid consultation fee amount.';
    }

    if (!formData.password) {
      errs.password = 'Please create a secure password.';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
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

    // Mock API registration
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage(
        `Registration submitted for Dr. ${formData.fullName}! Your credentials have been queued for administrative verification.`
      );
      if (onToast) {
        onToast({
          type: 'success',
          title: 'Doctor Application Received',
          message: `Application for License #${formData.registrationNumber} submitted successfully.`
        });
      }
    }, 1500);
  };

  return (
    <AuthLayout split={false}>
      <div className="auth-form-container animate-fade-in" style={{ maxWidth: '720px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <AuthBranding minimal />
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span
                style={{
                  background: 'var(--accent-50)',
                  color: 'var(--accent-600)',
                  border: '1px solid var(--accent-100)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  textTransform: 'uppercase',
                }}
              >
                Healthcare Provider
              </span>
            </div>
            <h1 className="auth-card-title">Register as Doctor</h1>
            <p className="auth-card-subtitle">
              Connect with your patients. Manage appointments, availability, and telehealth interactions on MedNexus.
            </p>
          </div>

          {/* Verification Informational Notice (Requirement 10) */}
          <div className="auth-alert auth-alert-info">
            <Info size={18} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary-700)' }} />
            <div>
              <strong>Credential Verification Notice:</strong> Doctor accounts require verification before
              accessing the professional dashboard.
            </div>
          </div>

          <AuthError message={generalError} onDismiss={() => setGeneralError('')} />
          <AuthSuccess
            message={successMessage}
            onDismiss={() => setSuccessMessage('')}
            action={
              <Link to="/login" style={{ fontWeight: 600, color: 'var(--success-700)', textDecoration: 'underline' }}>
                Proceed to Doctor Sign In &rarr;
              </Link>
            }
          />

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-grid-2col">
              <AuthInput
                id="doctor-fullName"
                name="fullName"
                label="Full Name (with title)"
                placeholder="Dr. Rajesh Patel, M.D."
                value={formData.fullName}
                onChange={handleChange}
                icon={User}
                error={errors.fullName}
                autoComplete="name"
                required
              />

              <AuthInput
                id="doctor-email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="doctor@hospital.org"
                value={formData.email}
                onChange={handleChange}
                icon={Mail}
                error={errors.email}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-grid-2col">
              <AuthInput
                id="doctor-phoneNumber"
                name="phoneNumber"
                type="tel"
                label="Phone Number"
                placeholder="+1 (555) 234-5678"
                value={formData.phoneNumber}
                onChange={handleChange}
                icon={Phone}
                error={errors.phoneNumber}
                autoComplete="tel"
                required
              />

              {/* Medical Speciality Select */}
              <div className="form-group">
                <label htmlFor="doctor-speciality" className="form-label">
                  Medical Speciality
                </label>
                <div className="input-wrapper">
                  <span className="input-leading-icon" aria-hidden="true">
                    <Stethoscope size={18} strokeWidth={2} />
                  </span>
                  <select
                    id="doctor-speciality"
                    name="medicalSpeciality"
                    value={formData.medicalSpeciality}
                    onChange={handleChange}
                    className={`auth-select-field ${errors.medicalSpeciality ? 'input-error' : ''}`}
                    style={{ paddingLeft: '2.625rem' }}
                    required
                  >
                    <option value="">Select your speciality...</option>
                    {MEDICAL_SPECIALTIES.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.medicalSpeciality && (
                  <div className="auth-error-message">
                    <span>{errors.medicalSpeciality}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-grid-2col">
              <AuthInput
                id="doctor-registrationNumber"
                name="registrationNumber"
                label="Professional Registration Number"
                placeholder="e.g. MCI-2018-84729"
                value={formData.registrationNumber}
                onChange={handleChange}
                icon={FileBadge}
                error={errors.registrationNumber}
                helperText="State Medical Council or National Registry ID"
                required
              />

              <AuthInput
                id="doctor-consultationFee"
                name="consultationFee"
                type="number"
                label="Consultation Fee ($ / ₹)"
                placeholder="e.g. 150"
                value={formData.consultationFee}
                onChange={handleChange}
                icon={CreditCard}
                error={errors.consultationFee}
                required
              />
            </div>

            <div className="form-grid-2col">
              <AuthInput
                id="doctor-clinicName"
                name="clinicName"
                label="Clinic / Hospital Name"
                placeholder="e.g. Metro Specialty Care Clinic"
                value={formData.clinicName}
                onChange={handleChange}
                icon={Building2}
                error={errors.clinicName}
                required
              />

              <AuthInput
                id="doctor-clinicAddress"
                name="clinicAddress"
                label="Clinic Address"
                placeholder="Suite 400, Healthcare Boulevard"
                value={formData.clinicAddress}
                onChange={handleChange}
                icon={MapPin}
                error={errors.clinicAddress}
                required
              />
            </div>

            <div className="form-grid-2col">
              <div>
                <PasswordInput
                  id="doctor-password"
                  name="password"
                  label="Password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div>
                <PasswordInput
                  id="doctor-confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {formData.password && <PasswordStrength password={formData.password} />}

            <AuthButton
              type="submit"
              loading={loading}
              loadingText="Submitting Doctor Registration..."
              icon={ShieldCheck}
            >
              Submit Doctor Registration
            </AuthButton>
          </form>

          <div className="auth-card-footer">
            <span>Already have an account?</span>
            <Link to="/login">Sign in</Link>
          </div>

          <TrustIndicators />
        </div>
      </div>
    </AuthLayout>
  );
}
