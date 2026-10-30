# 🏥 ArogyaNexus — Next-Gen Healthcare Platform & AI Clinical Assistant

[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.3-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Google Gemini AI](https://img.shields.io/badge/Google%20Gemini-Flash%203.5%20%2F%203.8-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Vitest](https://img.shields.io/badge/Tested%20with-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

> **ArogyaNexus** is a full-stack, enterprise-grade healthcare management ecosystem designed to bridge patients and doctors with real-time consultation tools, automated medical record verification, and a Google Gemini-powered Clinical Decision Support engine featuring automated multi-key rotation and limit fallback.

---

## 🌟 Key Highlights & Capabilities

### 🩺 1. AI Clinical Assistant & Patient Summary Generator
- **Comprehensive Patient Synthesis**: Analyzes chief complaints, recorded vitals, chronic conditions, and patient PDFs to create structured briefs for attending physicians.
- **Critical Alert Detection**: Automatically surfaces life-critical alerts (e.g., acute cardiac symptoms, drug allergy interactions, Stage 2 HTN).
- **Automated Lab Extraction**: Analyzes uploaded CBC, lipid, thyroid, and radiological reports into clear clinical implications.
- **Rule-Based Clinical Fallback Engine**: If external AI services are unreachable, an intelligent internal clinical engine synthesizes high-grade recommendations without service interruption.

### 🔑 2. Multi-Key Automatic Gemini Rotation & Quota Fallback
- **Tiered Multi-Key Failover**: Seamlessly cycles through Primary (`GEMINI_API_KEY`), Secondary (`GEMINI_API_KEY_2`), and Tertiary (`GEMINI_API_KEY_3`) keys.
- **Immediate Quota Sensing**: Detects `HTTP 429` (Rate Limit) and `HTTP 403` (`RESOURCE_EXHAUSTED`) and rotates to the next available key with zero latency.
- **In-Memory Cooldowns**: Places rate-limited keys on cooldown so subsequent calls don't waste time on exhausted quotas.
- **Active Model Support**: Fully optimized for `gemini-3.5-flash-lite`, `gemini-3.5-flash`, and `gemini-3.8-flash`.

### 🛡️ 3. Intelligent Document AI Verification
- **Automated Medical File Screening**: Parses patient-uploaded clinical PDFs to verify readability, document categories, and metadata alignment.
- **Doctor Review Escalation**: Documents with ambiguities or low confidence scores automatically route to an attending doctor with a complete audit trail.

### 👨‍⚕️ 4. Doctor Dashboard & Clinical Workflows
- **Queue & Token Management**: Track daily patient appointments with live queue statuses (`PENDING`, `CONFIRMED`, `IN_PERSON`, `COMPLETED`, `MISSED`).
- **Interactive Medical Summaries**: Review detailed medical summaries with inline copy, printing, and download options.
- **Live Consultation Chat**: Secure messaging between verified doctors and patients during active consultations.

### 🧑‍💼 5. Patient Portal & Family Profiles
- **Multi-Profile Family Health Hub**: Manage dependent records (Self, Children, Parents) under a single authenticated account.
- **Vitals & Health History**: Log and monitor BP, pulse, SpO2, and blood sugar trends over time.
- **Granular Consent Management**: Patients retain full control over which doctors can inspect their health records and medical summaries.

### ⚡ 6. Dual Database Engine (Zero-Downtime Development)
- Seamlessly connects to **PostgreSQL** via Prisma in production.
- Automatically falls back to a persistent local JSON datastore (`.local_db.json`) during local development if PostgreSQL is offline.

---

## 🛠️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, React Router 7, Lucide Icons, Modern CSS3 |
| **Backend** | Node.js (v20+), Express 5, TypeScript 7 |
| **Database & ORM** | PostgreSQL, Prisma ORM 6, Local Persistence Engine |
| **Artificial Intelligence** | Google Gemini Generative AI (`gemini-3.5-flash`, `gemini-3.8-flash`) |
| **Document Processing**| `pdf-parse`, stream parsing regex engine |
| **Security & Auth** | HTTP-only session cookies, bcrypt password hashing, input validation via Zod |
| **Testing & Quality** | Vitest 5, Oxlint, TypeScript strict typechecking |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or later (Node 22 / 24 supported)
- **pnpm / corepack**: Installed with Node.js (`corepack enable`)
- **PostgreSQL**: Optional for local development (automatic local fallback enabled)

---

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SachinMugade8797/ArogyaNexus.git
   cd ArogyaNexus
   ```

2. **Install project dependencies:**
   ```bash
   corepack pnpm install --frozen-lockfile
   ```

3. **Configure Environment Variables:**
   ```powershell
   # Windows PowerShell
   Copy-Item .env.example .env

   # Linux / macOS
   cp .env.example .env
   ```

4. **Add your Gemini API Keys in `.env`:**
   ```env
   # Primary and fallback Gemini API keys
   GEMINI_API_KEY=your_primary_api_key_here
   GEMINI_API_KEY_2=your_secondary_api_key_here
   GEMINI_API_KEY_3=your_tertiary_api_key_here

   # PostgreSQL Connection (Optional in dev mode)
   DATABASE_URL=postgresql://arogyanexus:arogyanexus@localhost:5432/arogyanexus?schema=public
   PORT=3001
   VITE_ORIGIN=http://localhost:5173
   ```

---

### Running the Application

You can launch both the frontend and backend servers simultaneously with a single command:

```bash
corepack pnpm dev:all
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:3001](http://localhost:3001)
- **API Health Check**: [http://localhost:3001/api/health](http://localhost:3001/api/health)

---

## 🧪 Testing & Verification

Run the full automated test suite (including auth, doctor workflows, consent, and document verification):

```bash
# Run Vitest test suite
corepack pnpm test

# Run TypeScript type validation
corepack pnpm typecheck

# Run code linter
corepack pnpm lint
```

To test the **multi-key rotation and quota fallback logic**:
```bash
npx tsx server/test_key_fallback.ts
```

---

## 📡 Key API Routes

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/doctor/appointments/:id/ai-summary` | Generates or fetches structured Gemini AI Clinical Summary |
| `GET` | `/api/patient/appointments/past-summary` | Retrieves previous appointment histories |
| `POST` | `/api/auth/login` | Authenticates doctor, patient, or admin |
| `POST` | `/api/auth/register-patient` | Registers a new patient account |
| `POST` | `/api/auth/register-doctor` | Registers a doctor profile for administrative review |
| `GET` | `/api/doctor/appointments` | Lists assigned doctor appointments with filter tabs |
| `POST` | `/api/doctor/records/:id/verify` | Uploads and verifies medical documents via Document AI |

---

## 📂 Project Directory Structure

```text
ArogyaNexus/
├── server/
│   ├── index.ts                     # Main Express server and API routing
│   ├── aiClinicalSummary.ts         # Gemini AI Clinical Decision Support Engine
│   ├── geminiKeyManager.ts          # Multi-Key Rotation & Rate-Limit Fallback Manager
│   ├── recordStorage.ts             # Secure private document storage
│   ├── test_key_fallback.ts         # Multi-key failover verification suite
│   └── services/
│       └── documentAiVerification.ts# Automated medical PDF verification
├── src/
│   ├── api/                         # Frontend API client modules
│   ├── components/
│   │   ├── doctor/                  # Doctor modals, clinical summaries, queues
│   │   ├── patient/                 # Patient dashboard, consent, records
│   │   └── ui/                      # Reusable UI cards, tables, avatars
│   ├── pages/                       # Route views (Doctor, Patient, Admin)
│   ├── styles/                      # Modular CSS stylesheets
│   └── __tests__/                   # Vitest unit & integration test suites
├── prisma/
│   └── schema.prisma                # Prisma relational database schema
├── .env.example                     # Environment template
└── package.json
```

---

## 🔒 Security & Healthcare Compliance

- **HIPAA / GDPR Audit Trail**: Every access to patient records logs an entry in `access_logs`.
- **Private Document Isolation**: Medical files are kept in an isolated `.private-records` store and served only through authenticated consent checks.
- **Fail-Safe Clinical Summaries**: Designed so physician clinical judgment remains primary; summaries clearly state AI limitations and cite source documents.

---

## 👤 Author

- **GitHub**: [@SachinMugade8797](https://github.com/SachinMugade8797)
