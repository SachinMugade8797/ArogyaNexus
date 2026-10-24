import React from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/LoginForm';

export default function LoginPage({ onToast }) {
  return (
    <AuthLayout
      split={true}
      pageTitle="Sign In — MedNexus"
      brandSubtitle="Healthcare, connected around you."
      brandDescription="Connect with trusted healthcare professionals, manage appointments, and keep your healthcare journey organized in one place."
    >
      <LoginForm onToast={onToast} />
    </AuthLayout>
  );
}
