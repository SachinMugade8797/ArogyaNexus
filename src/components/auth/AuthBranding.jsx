import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function AuthBranding({ minimal = false, light = false }) {
  return (
    <div className="auth-branding-wrapper">
      <Link 
        to="/login" 
        className="auth-logo-link"
        aria-label="MedNexus Homepage"
      >
        <div 
          className="auth-logo-icon-box"
          style={
            light
              ? { background: 'rgba(20, 184, 166, 0.2)', border: '1px solid rgba(45, 212, 191, 0.4)', color: '#2dd4bf' }
              : undefined
          }
        >
          <Activity size={24} strokeWidth={2.4} />
        </div>
        <div className="auth-logo-text-group">
          <span 
            className="auth-logo-name"
            style={light ? { color: '#ffffff' } : undefined}
          >
            Med<span>Nexus</span>
          </span>
          <span 
            className="auth-logo-tagline"
            style={light ? { color: '#94a3b8' } : undefined}
          >
            Healthcare connected. Secure. Intelligent.
          </span>
        </div>
      </Link>

      {!minimal && !light && (
        <p className="auth-branding-support-text" style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '-0.75rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
          Your trusted digital healthcare ecosystem for patients and healthcare professionals.
        </p>
      )}
    </div>
  );
}
