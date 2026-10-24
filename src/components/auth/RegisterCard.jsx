import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';

export default function RegisterCard({
  title,
  subtitle,
  tagline,
  icon: Icon,
  features = [],
  ctaText,
  ctaLink,
  variant = 'patient',
  badge
}) {
  return (
    <div className={`register-choice-card ${variant}`}>
      {badge && <span className="register-choice-badge">{badge}</span>}

      <div>
        <div className="register-choice-icon-wrap">
          <Icon size={28} strokeWidth={2.2} />
        </div>

        <h2 className="register-choice-title">{title}</h2>
        <div className="register-choice-tagline">{tagline}</div>
        <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
          {subtitle}
        </p>

        <ul className="register-choice-features">
          {features.map((feature, idx) => (
            <li key={idx} className="register-choice-feature-item">
              <span className="register-choice-feature-bullet" aria-hidden="true">
                <Check size={16} strokeWidth={2.5} />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        to={ctaLink}
        className="auth-button-primary"
        style={{ textDecoration: 'none', textAlign: 'center' }}
      >
        <span>{ctaText}</span>
        <ArrowRight size={18} strokeWidth={2.2} />
      </Link>
    </div>
  );
}
