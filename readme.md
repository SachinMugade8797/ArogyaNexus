# AROGYANEXUS — Local PostgreSQL Database & Registration Integration

> **Healthcare connected. Secure. Intelligent.**  
> *AI-Powered Multi-Specialty Healthcare Management Platform*

---

## 🏗 Architecture Overview

The application is structured for secure local development using **Local PostgreSQL** with **Prisma ORM**, backed by an **Express API server** and a **React 19 (Vite)** frontend.

```text
AROGYANEXUS Frontend (React / Vite on port 5173)
        ↓  (proxied /api calls)
Local Auth Server (Express / TypeScript on port 3001)
        ↓
Authentication & Sessions (Bcrypt / Signed HTTP-Only Cookies)
        ↓
Prisma ORM (Singleton client in lib/db/prisma.ts)
        ↓
Local PostgreSQL (port 5432) OR Persistent Local Store (.local_db.json fallback)
```

> 💡 **Dual-Mode Database Support**:
> - **PostgreSQL Online**: If PostgreSQL is running on `localhost:5432`, Prisma connects directly to PostgreSQL.
> - **Zero-Downtime Fallback**: If PostgreSQL is not currently running or not installed, the application automatically uses a persistent local store (`.local_db.json`), allowing complete registration, validation, password hashing, and login testing without interruption!

---

## 📋 Prerequisites

- **Node.js**: v18+ (v20+ recommended)
- **pnpm**: v9+ / v12+
- **PostgreSQL**: Running locally on your Windows machine (port 5432)

---

## ⚙️ Step-by-Step Setup & Run Guide

### 1. Start Local PostgreSQL on Windows
Ensure the PostgreSQL service is active on your machine:
```powershell
# In PowerShell (Run as Administrator):
Start-Service postgresql*
```
Or open Windows Services (`services.msc`) and verify that the `postgresql-x64-<version>` service status is **Running**.

Create the local database if it does not already exist:
```sql
CREATE DATABASE arogyanexus;
```

---

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the project root:
```bash
cp .env.example .env
```
Ensure your `.env` contains your local PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/arogyanexus"
SESSION_SECRET="arogyanexus_secure_session_secret_local_dev_key_2026"
PORT=3001
```
*(Note: `.env` is ignored by Git and will never be committed).*

---

### 3. Install Dependencies
```bash
pnpm install
```

---

### 4. Run Database Migrations
Apply the Prisma migration to create the `users` and `doctor_profiles` tables:
```bash
pnpm prisma migrate dev
```
To regenerate the Prisma Client at any time:
```bash
pnpm prisma generate
```

---

### 5. Seed Database
Seed the platform administrator and initial demo accounts:
```bash
pnpm prisma db seed
```
**Default Seed Accounts:**
- **Admin**: `admin@mednexus.org` (Password: `AdminSecure2026!`)
- **Approved Doctor**: `doctor.approved@mednexus.org` (Password: `DoctorSecure2026!`)
- **Patient**: `patient@mednexus.org` (Password: `PatientSecure2026!`)

---

### 6. Run the Application
Start both the backend API server and frontend development server concurrently:
```bash
pnpm dev:all
```
- **Frontend URL**: [http://localhost:5173/](http://localhost:5173/)
- **Backend API URL**: [http://localhost:3001/](http://localhost:3001/) (Health: [http://localhost:3001/api/health](http://localhost:3001/api/health))

*Alternatively, you can run them in separate terminal tabs:*
```bash
# Tab 1: Local Auth API Server (port 3001)
pnpm server

# Tab 2: Frontend Dev Server (port 5173)
pnpm dev
```

---

## 🧪 Testing the Registration & Authentication Flows

### 1. Test Patient Registration
1. Navigate to: [http://localhost:5173/register/patient](http://localhost:5173/register/patient)
2. Enter Full Name, Email, Phone, and Password (min. 8 characters with 1 uppercase, 1 number, 1 special character).
3. Click **Create Patient Account**.
4. **Verification**: 
   - A success message appears.
   - The user is created in PostgreSQL with `role = 'patient'`.
   - Passwords are encrypted with `bcrypt` (work factor 12) and never stored in plaintext.

### 2. Test Doctor Registration
1. Navigate to: [http://localhost:5173/register/doctor](http://localhost:5173/register/doctor)
2. Enter Doctor details, Medical Specialty, License Registration Number, Clinic Name, Address, Fee, and Password.
3. Click **Submit Doctor Registration**.
4. **Verification**: 
   - Confirmation screen displays that the account is created and queued for administrative verification.
   - The user record is created with `role = 'doctor'`.
   - A linked `doctor_profiles` record is atomically created with `status = 'pending'`.

### 3. Test Login
1. Navigate to: [http://localhost:5173/login](http://localhost:5173/login)
2. Sign in with the registered credentials or seeded accounts:
   - **Approved Doctor**: `doctor.approved@mednexus.org` / `DoctorSecure2026!` &rarr; Successful login with active session cookie.
   - **Pending Doctor**: If a doctor account is pending, login cleanly displays:  
     `"Your doctor account is pending admin approval."`
   - **Patient**: `patient@mednexus.org` / `PatientSecure2026!` &rarr; Successful login.
   - **Admin**: `admin@mednexus.org` / `AdminSecure2026!` &rarr; Successful admin login.

---

## 🔍 Manual Database Verification

Verify records directly in PostgreSQL via `psql` or pgAdmin:

```sql
-- Verify users table (passwords are securely hashed)
SELECT id, full_name, email, role, created_at FROM users;

-- Verify doctor profiles table
SELECT id, user_id, speciality, registration_number, status FROM doctor_profiles;
```

---

## 🛡 Security Protections Implemented

- **Role Injection Prevention**: The server strictly enforces `role = 'patient'` for patient registration and `role = 'doctor'` for doctor registration. Any client payload attempting to inject `role: "admin"` is ignored.
- **Doctor Pending Status**: New doctor registrations always default to `status = 'pending'` on the server; clients cannot self-approve.
- **Signed HTTP-Only Session Cookies**: Session identifiers are signed with `SESSION_SECRET` via HMAC-SHA256 and sent with `HttpOnly`, `SameSite: 'lax'`, and `Path: '/'`.
- **Zod Validation**: Input validation is enforced on both client and server.
- **Public Admin Registration Prohibited**: Admin accounts can only be provisioned via the secure Prisma seed script.

---

## 🧪 Automated Test Suite

Run all automated unit, integration, and security tests:
```bash
pnpm test
```

Verify TypeScript types:
```bash
pnpm typecheck
```

Run linter:
```bash
pnpm lint
```

---

## 🚀 Future Cloud Migration

> **Supabase migration is intentionally postponed for this phase.**

When online cloud deployment is needed, refer to [`later_setup.md`](file:///d:/ArogyaNexus/later_setup.md) for the 14-step roadmap detailing how to migrate the local PostgreSQL schema and data to Supabase.
