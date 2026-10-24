import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, ShieldCheck, HeartPulse, Network, Sparkles } from 'lucide-react';
import AuthBranding from './AuthBranding';
import HealthcareIllustration from './HealthcareIllustration';

export default function AuthLayout({
  children,
  split = false,
  pageTitle = 'Authentication',
  brandSubtitle = 'Healthcare, connected around you.',
  brandDescription = 'Connect with trusted healthcare professionals, manage appointments, and keep your healthcare journey organized in one place.'
}) {
  return (
    <div className="auth-layout-container">
      {/* Top Demonstration & Evaluation Navigation Bar */}
      <header className="demo-top-bar" aria-label="Evaluation Route Bar">
        <div className="demo-top-bar-brand">
          <Activity size={16} color="#2dd4bf" />
          <span>MedNexus UI</span>
          <span className="demo-top-bar-badge">Frontend Auth Suite</span>
        </div>

        <nav className="demo-top-bar-links" aria-label="Authentication routes">
          <NavLink to="/login" className={({ isActive }) => `demo-nav-link ${isActive ? 'active' : ''}`}>
            /login
          </NavLink>
          <NavLink to="/register" end className={({ isActive }) => `demo-nav-link ${isActive ? 'active' : ''}`}>
            /register
          </NavLink>
          <NavLink to="/register/patient" className={({ isActive }) => `demo-nav-link ${isActive ? 'active' : ''}`}>
            /register/patient
          </NavLink>
          <NavLink to="/register/doctor" className={({ isActive }) => `demo-nav-link ${isActive ? 'active' : ''}`}>
            /register/doctor
          </NavLink>
          <NavLink to="/forgot-password" className={({ isActive }) => `demo-nav-link ${isActive ? 'active' : ''}`}>
            /forgot-password
          </NavLink>
          <NavLink to="/reset-password" className={({ isActive }) => `demo-nav-link ${isActive ? 'active' : ''}`}>
            /reset-password
          </NavLink>
        </nav>
      </header>

      {split ? (
        /* Desktop Split Screen Layout */
        <main className="auth-split-layout">
          {/* Left Visual & Brand Section */}
          <section className="auth-brand-panel" aria-label="Brand Information">
            <div className="auth-brand-grid-pattern" aria-hidden="true" />
            
            <div className="auth-brand-panel-header">
              <AuthBranding minimal light />
            </div>

            <div className="auth-brand-panel-body">
              <div className="auth-brand-panel-tagline">
                <Sparkles size={14} />
                <span>Next-Generation Healthcare Intelligence</span>
              </div>

              <h1 className="auth-brand-panel-title">{brandSubtitle}</h1>
              <p className="auth-brand-panel-desc">{brandDescription}</p>

              {/* Bespoke SVG Healthcare Illustration */}
              <HealthcareIllustration />

              <div className="auth-brand-feature-list">
                <div className="auth-brand-feature-item">
                  <div className="auth-brand-feature-icon">
                    <HeartPulse size={14} />
                  </div>
                  <span>Unified patient records and doctor consultation portal</span>
                </div>
                <div className="auth-brand-feature-item">
                  <div className="auth-brand-feature-icon">
                    <ShieldCheck size={14} />
                  </div>
                  <span>High-assurance encrypted medical data ecosystem</span>
                </div>
                <div className="auth-brand-feature-item">
                  <div className="auth-brand-feature-icon">
                    <Network size={14} />
                  </div>
                  <span>Seamless multi-specialty clinical workflow coordination</span>
                </div>
              </div>
            </div>

            <div className="auth-brand-panel-footer">
              <div className="brand-telemetry-badge">
                <span className="brand-status-dot" aria-hidden="true" />
                <span>System Operational • Multi-Specialty Secure Grid</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>v2.4.0 UI Demo</span>
            </div>
          </section>

          {/* Right Form Section */}
          <section className="auth-form-panel" aria-label="Authentication Form Section">
            <div className="auth-form-container">
              {children}
            </div>
          </section>
        </main>
      ) : (
        /* Centered Layout for Registration, Forgot Password, Reset Password */
        <main className="auth-centered-layout">
          {children}
        </main>
      )}
    </div>
  );
}
