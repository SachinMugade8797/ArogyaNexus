# Future Supabase Migration

> **Supabase migration is intentionally postponed. No Supabase configuration or migration should be performed during the current phase.**

This document provides future reference instructions for migrating the current local PostgreSQL and Prisma database foundation to Supabase when cloud deployment becomes necessary.

---

## Architecture Transition

### CURRENT (Local Development)

```text
AROGYANEXUS Frontend (React / Vite)
        ↓
Local Server API (Express / Node.js)
        ↓
Server Authentication & Sessions (Bcrypt / HTTP-Only Signed Cookies)
        ↓
Prisma ORM
        ↓
Local PostgreSQL (Database: arogyanexus)
```

### FUTURE (Cloud Deployment)

```text
AROGYANEXUS
        ↓
Supabase Auth / Server
        ↓
Supabase PostgreSQL
        ↓
Row Level Security (RLS) / Storage / Realtime
```

---

## Future Migration Roadmap

When cloud deployment is required, perform the following steps sequentially:

1. **Create Supabase Project**
   - Register or log in to [Supabase](https://supabase.com).
   - Create a new project titled `ArogyaNexus`.
   - Select your deployment region and set a strong database password.

2. **Configure Supabase PostgreSQL Connection**
   - Retrieve the direct connection URI and connection pooling URI (port 6543 / 5432) from the Supabase Project Settings.

3. **Configure Production Environment Variables**
   - Update production environment variables (`DATABASE_URL`, `DIRECT_URL`) to point to the Supabase PostgreSQL instance.

4. **Migrate Current PostgreSQL Schema and Data**
   - Apply Prisma schema migrations to Supabase:
     ```bash
     pnpm prisma migrate deploy
     ```
   - Alternatively, dump local data and restore:
     ```bash
     pg_dump -h localhost -U postgres -d arogyanexus > backup.sql
     psql -h db.supabase.co -U postgres -d postgres < backup.sql
     ```

5. **Decide Authentication Strategy**
   - Choose whether to:
     - Retain the current custom server-side session authentication with Prisma, or
     - Transition to native Supabase Auth (`@supabase/supabase-js`).

6. **Map Existing `users` Records to `auth.users`**
   - If adopting native Supabase Auth, write a data migration script to port existing `users` rows to Supabase `auth.users` and link `doctor_profiles.user_id` to `auth.users.id`.

7. **Recreate Security Policies and Row Level Security (RLS)**
   - Enable RLS on `users` and `doctor_profiles` tables:
     ```sql
     ALTER TABLE users ENABLE ROW LEVEL SECURITY;
     ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
     ```
   - Define least-privilege access policies for patients, doctors, and platform administrators.

8. **Configure Private Supabase Storage for Medical Documents**
   - Create private storage buckets for patient medical records and doctor credential licenses with signed URLs.

9. **Configure Realtime Subscriptions**
   - Enable Supabase Realtime for instant appointment alerts, consultation queues, and chat notifications in subsequent modules.

10. **Update Deployment Environment Variables**
    - Ensure `.env.production` contains all verified keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`). Never commit secrets to Git.

11. **Run Database Migration Tests**
    - Verify table schemas, foreign key constraints, unique constraints, and indexes on the cloud instance.

12. **Run Registration & Login Tests**
    - Execute end-to-end tests for Patient registration, Doctor registration, Doctor pending approval status, and Admin login.

13. **Run Security & Authorization Tests**
    - Ensure role manipulation cannot bypass server permissions and client payloads with `role: "admin"` are strictly rejected or sanitized.

14. **Verify Parity with Local Functionality**
    - Ensure all frontend authentication flows behave identically to the local PostgreSQL environment.
