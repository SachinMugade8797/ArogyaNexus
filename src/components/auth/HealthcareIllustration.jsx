import React from 'react';

export default function HealthcareIllustration() {
  return (
    <div style={{ width: '100%', maxWidth: '440px', margin: '1.5rem auto', position: 'relative' }}>
      <svg
        viewBox="0 0 500 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.25))' }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="medCardGrad" x1="0" y1="0" x2="380" y2="240" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0f766e" stopOpacity="0.45" />
            <stop offset="1" stopColor="#042f2e" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="pulseGrad" x1="0" y1="0" x2="360" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2dd4bf" stopOpacity="0.2" />
            <stop offset="0.5" stopColor="#2dd4bf" stopOpacity="1" />
            <stop offset="1" stopColor="#38bdf8" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="tealNodeGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#14b8a6" />
            <stop offset="1" stopColor="#0d9488" />
          </linearGradient>
          <linearGradient id="shieldGrad" x1="0" y1="0" x2="60" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38bdf8" />
            <stop offset="1" stopColor="#0284c7" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient background glows */}
        <circle cx="250" cy="180" r="140" fill="#0d9488" fillOpacity="0.12" filter="url(#softGlow)" />
        <circle cx="360" cy="110" r="90" fill="#0284c7" fillOpacity="0.12" filter="url(#softGlow)" />

        {/* Central Connected Medical Card */}
        <rect
          x="70"
          y="60"
          width="360"
          height="230"
          rx="24"
          fill="url(#medCardGrad)"
          stroke="rgba(45, 212, 191, 0.3)"
          strokeWidth="1.5"
        />

        {/* Medical Cross in Top-Left of Card */}
        <g transform="translate(110, 95)">
          <rect x="-6" y="-18" width="12" height="36" rx="4" fill="#2dd4bf" />
          <rect x="-18" y="-6" width="36" height="12" rx="4" fill="#2dd4bf" />
          <circle cx="0" cy="0" r="4" fill="#ffffff" />
        </g>

        {/* Medical Card Header Text Placeholders */}
        <rect x="145" y="85" width="120" height="10" rx="5" fill="#ffffff" fillOpacity="0.8" />
        <rect x="145" y="103" width="75" height="8" rx="4" fill="#99f6e4" fillOpacity="0.6" />

        {/* Security Shield Badge Top-Right */}
        <g transform="translate(380, 100)">
          <path
            d="M0 -16 C8 -16 16 -19 16 -19 C16 4 11 17 0 24 C-11 17 -16 4 -16 -19 C-16 -19 -8 -16 0 -16 Z"
            fill="url(#shieldGrad)"
          />
          <path
            d="M-5 1 L-1 5 L6 -3"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Network Connection Lines & Floating Nodes */}
        <path
          d="M120 185 L180 185 L200 150 L220 220 L245 160 L260 200 L280 185 L380 185"
          stroke="url(#pulseGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Floating Data Pill: Doctor Connection */}
        <g transform="translate(90, 220)">
          <rect width="130" height="38" rx="19" fill="#042f2e" stroke="rgba(45, 212, 191, 0.4)" strokeWidth="1" />
          <circle cx="20" cy="19" r="10" fill="#0d9488" />
          <circle cx="20" cy="16" r="4" fill="#ffffff" />
          <path d="M14 24 C14 21 17 21 20 21 C23 21 26 21 26 24" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="38" y="14" width="60" height="6" rx="3" fill="#ffffff" fillOpacity="0.85" />
          <rect x="38" y="23" width="40" height="5" rx="2.5" fill="#5eead4" fillOpacity="0.6" />
        </g>

        {/* Floating Data Pill: AI Health Telemetry */}
        <g transform="translate(260, 220)">
          <rect width="145" height="38" rx="19" fill="#042f2e" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" />
          <circle cx="22" cy="19" r="10" fill="#0284c7" />
          <path d="M17 19 L20 22 L27 15" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="40" y="14" width="70" height="6" rx="3" fill="#ffffff" fillOpacity="0.85" />
          <rect x="40" y="23" width="50" height="5" rx="2.5" fill="#7dd3fc" fillOpacity="0.6" />
        </g>

        {/* Outer Orbit Network Nodes */}
        <g transform="translate(60, 140)">
          <circle cx="0" cy="0" r="18" fill="url(#tealNodeGrad)" />
          <circle cx="0" cy="0" r="6" fill="#ffffff" />
          <line x1="18" y1="0" x2="65" y2="0" stroke="rgba(45, 212, 191, 0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
        </g>

        <g transform="translate(435, 170)">
          <circle cx="0" cy="0" r="18" fill="#0284c7" />
          <circle cx="0" cy="0" r="6" fill="#ffffff" />
          <line x1="-18" y1="0" x2="-50" y2="0" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
        </g>
      </svg>
    </div>
  );
}
