# MedNexus — Healthcare Management Platform

> **Healthcare connected. Secure. Intelligent.**  
> *Your trusted digital healthcare ecosystem for patients and healthcare professionals.*

**MedNexus** is an AI-powered secure multi-specialty healthcare management platform connecting patients, verified doctors, and healthcare administrators with high-assurance security and clinical workflow coordination.

---

## 🏥 Frontend Authentication Suite Overview

This implementation provides a modern healthcare SaaS authentication experience built with **React**, **Vite**, and **Vanilla CSS**.

### 🌟 Key Highlights & Design Philosophy
- **Modern Healthcare SaaS Aesthetic:** Clean, clinical teal and slate palettes, high-trust typography, and subtle micro-interactions.
- **Role-Adaptive Authentication:** Dedicated views and workflows for **Patient**, **Doctor**, and **Admin** personas.
- **Full Route Suite:**
  - `/login`: Split-screen desktop experience with custom SVG healthcare network illustrations, role switcher tabs, accessible password visibility toggle, inline error handling, and trust indicators.
  - `/register`: Registration selection portal with dedicated Patient and Doctor feature cards (Admin registration is strictly omitted from public access).
  - `/register/patient`: Comprehensive patient onboarding with dynamic password strength meter.
  - `/register/doctor`: Provider onboarding capturing specialty, Medical Council registration number, clinic details, consultation fee, and verification disclosure notice.
  - `/forgot-password`: Account recovery with email validation and mock reset link dispatch state.
  - `/reset-password`: Credential update form with interactive password security requirements checklist.
- **Accessibility & Responsiveness:** Built with semantic HTML, ARIA attributes, full keyboard accessibility, visible focus states, and responsive styling tested from 375px mobile screens up to 1920px widescreen displays.

---

## 📁 Component Architecture

```text
src/
├── components/
│   └── auth/
│       ├── AuthLayout.jsx            # Shell with desktop split-screen & centered modes
│       ├── AuthBranding.jsx          # MedNexus logo, taglines, and metadata
│       ├── RoleSelector.jsx          # Accessible Patient / Doctor / Admin role tabs
│       ├── LoginForm.jsx             # Role-adaptive login form with mock state
│       ├── RegisterCard.jsx          # Role cards for registration selection
│       ├── AuthInput.jsx             # Accessible input with icon and error states
│       ├── PasswordInput.jsx         # Input with password visibility toggle & lock icon
│       ├── PasswordStrength.jsx      # Visual strength bar & 4-point requirement checklist
│       ├── AuthButton.jsx            # Action button with loading spinner states
│       ├── AuthError.jsx             # Inline and alert error banners
│       ├── AuthSuccess.jsx           # Success notification banners
│       ├── TrustIndicators.jsx       # Subtle security & privacy trust badges
│       ├── HealthcareIllustration.jsx# Bespoke SVG medical network graphic
│       └── Toast.jsx                 # Global notification system
├── pages/
│   ├── LoginPage.jsx                 # /login route
│   ├── RegisterSelectPage.jsx        # /register route
│   ├── PatientRegisterPage.jsx       # /register/patient route
│   ├── DoctorRegisterPage.jsx        # /register/doctor route
│   ├── ForgotPasswordPage.jsx        # /forgot-password route
│   └── ResetPasswordPage.jsx         # /reset-password route
├── styles/
│   └── auth.css                      # Modular authentication stylesheets
├── index.css                         # Global design system tokens & resets
└── App.jsx                           # Application router & toast provider
```

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### Production Build
```bash
npm run build
npm run preview
```
