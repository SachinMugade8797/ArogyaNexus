import React from 'react';
import { Lock, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function TrustIndicators() {
  return (
    <div className="trust-indicators-container" aria-label="Platform Trust Guarantees">
      <div className="trust-item">
        <span className="trust-item-icon" aria-hidden="true">
          <Lock size={14} strokeWidth={2.4} />
        </span>
        <span>Secure Access</span>
      </div>

      <div className="trust-item">
        <span className="trust-item-icon" aria-hidden="true">
          <ShieldCheck size={14} strokeWidth={2.4} />
        </span>
        <span>Privacy Focused</span>
      </div>

      <div className="trust-item">
        <span className="trust-item-icon" aria-hidden="true">
          <HeartHandshake size={14} strokeWidth={2.4} />
        </span>
        <span>Patient First</span>
      </div>
    </div>
  );
}
