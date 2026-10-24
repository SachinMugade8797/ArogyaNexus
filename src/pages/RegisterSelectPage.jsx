import React from 'react';
import { Link } from 'react-router-dom';
import { User, Stethoscope } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthBranding from '../components/auth/AuthBranding';
import RegisterCard from '../components/auth/RegisterCard';
import TrustIndicators from '../components/auth/TrustIndicators';

export default function RegisterSelectPage() {
  return (
    <AuthLayout split={false}>
      <div className="register-select-container animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <AuthBranding minimal />
        </div>

        <div className="register-select-header">
          <h1 className="register-select-title">Create your MedNexus account</h1>
          <p className="register-select-subtitle">Choose how you want to use MedNexus.</p>
        </div>

        <div className="register-cards-grid">
          {/* Patient Card */}
          <RegisterCard
            variant="patient"
            badge="For Individuals & Families"
            title="Patient"
            tagline="Your healthcare, organized."
            subtitle="Take charge of your health records, consult verified doctors, and schedule seamless appointments."
            icon={User}
            features={[
              'Find doctors across multiple medical specialties',
              'Manage appointments and clinical consults',
              'Manage and share secure medical records',
            ]}
            ctaText="Register as Patient"
            ctaLink="/register/patient"
          />

          {/* Doctor Card */}
          <RegisterCard
            variant="doctor"
            badge="For Medical Practitioners"
            title="Doctor"
            tagline="Connect with your patients."
            subtitle="Expand your digital practice with smart scheduling, telehealth workflows, and records management."
            icon={Stethoscope}
            features={[
              'Manage appointments & consultation queues',
              'Manage clinical availability & office hours',
              'Manage patient interactions & prescriptions',
            ]}
            ctaText="Register as Doctor"
            ctaLink="/register/doctor"
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9375rem', color: 'var(--slate-600)' }}>
          <span>Already have an account?</span>
          <Link to="/login" style={{ marginLeft: '0.4rem', fontWeight: 600 }}>
            Sign in
          </Link>
        </div>

        <div style={{ maxWidth: '520px', margin: '2rem auto 0 auto' }}>
          <TrustIndicators />
        </div>
      </div>
    </AuthLayout>
  );
}
