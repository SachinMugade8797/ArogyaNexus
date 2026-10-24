import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import net from 'net';

// Real Prisma client instance with hot-reload guard
const globalForPrisma = globalThis as unknown as {
  rawPrisma: PrismaClient | undefined;
};

const rawPrisma =
  globalForPrisma.rawPrisma ??
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.rawPrisma = rawPrisma;
}

// ----------------------------------------------------------------------------
// PostgreSQL Connection Prober
// Checks if port 5432 is reachable before calling Prisma to avoid noisy engine errors
// ----------------------------------------------------------------------------
let postgresAvailable: boolean | null = null;
let lastCheckTime = 0;
const CHECK_INTERVAL_MS = 5000;

export async function isPostgresRunning(): Promise<boolean> {
  const now = Date.now();
  if (postgresAvailable !== null && now - lastCheckTime < CHECK_INTERVAL_MS) {
    return postgresAvailable;
  }

  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(150);

    socket.on('connect', () => {
      postgresAvailable = true;
      lastCheckTime = Date.now();
      socket.destroy();
      resolve(true);
    });

    const onFail = () => {
      postgresAvailable = false;
      lastCheckTime = Date.now();
      socket.destroy();
      resolve(false);
    };

    socket.on('timeout', onFail);
    socket.on('error', onFail);

    try {
      socket.connect(5432, '127.0.0.1');
    } catch {
      onFail();
    }
  });
}

// ----------------------------------------------------------------------------
// Local Database Fallback Storage
// Ensures zero-downtime development when local PostgreSQL is not currently running
// ----------------------------------------------------------------------------
const LOCAL_DB_PATH = path.resolve(process.cwd(), '.local_db.json');

interface LocalDB {
  users: Array<{
    id: string;
    full_name: string;
    email: string;
    password_hash: string;
    phone: string | null;
    role: string;
    created_at: string;
    updated_at: string;
  }>;
  doctor_profiles: Array<{
    id: string;
    user_id: string;
    speciality: string;
    registration_number: string;
    clinic_name: string;
    clinic_address: string;
    consultation_fee: number;
    status: string;
    created_at: string;
    updated_at: string;
  }>;
}

function loadLocalDB(): LocalDB {
  if (fs.existsSync(LOCAL_DB_PATH)) {
    try {
      const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      return JSON.parse(data);
    } catch {
      // Fall through to initial seed
    }
  }

  // Pre-seeded initial accounts matching prisma/seed.ts
  const defaultHash = bcrypt.hashSync('Password123!', 10);
  const adminHash = bcrypt.hashSync('AdminSecure2026!', 10);

  const initialDB: LocalDB = {
    users: [
      {
        id: '11111111-1111-4111-a111-111111111111',
        full_name: 'Platform Administrator',
        email: 'admin@mednexus.org',
        password_hash: adminHash,
        phone: '+1 (555) 999-0000',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '22222222-2222-4222-a222-222222222222',
        full_name: 'Dr. Ananya Sharma',
        email: 'doctor.approved@mednexus.org',
        password_hash: defaultHash,
        phone: '+1 (555) 234-5678',
        role: 'doctor',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '33333333-3333-4333-a333-333333333333',
        full_name: 'Atharv Kavitake',
        email: 'patient@mednexus.org',
        password_hash: defaultHash,
        phone: '+1 (555) 019-2834',
        role: 'patient',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    doctor_profiles: [
      {
        id: 'dp-approved-1',
        user_id: '22222222-2222-4222-a222-222222222222',
        speciality: 'Cardiology',
        registration_number: 'MCI-2020-88491',
        clinic_name: 'Apex Multi-Specialty Heart Center',
        clinic_address: 'Suite 400, Medical Boulevard',
        consultation_fee: 150,
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  };

  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initialDB, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[LocalDB] Could not persist initial local database file:', err);
  }

  return initialDB;
}

function saveLocalDB(db: LocalDB): void {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[LocalDB] Error saving database file:', err);
  }
}

function isConnectionError(err: unknown): boolean {
  if (!err) return false;
  const msg = String((err as any)?.message || err);
  const code = String((err as any)?.code || '');
  return (
    code === 'P1001' ||
    msg.includes("Can't reach database server") ||
    msg.includes('connection refused') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('ETIMEDOUT')
  );
}

let warnedFallback = false;
function logFallbackNotice() {
  if (!warnedFallback) {
    warnedFallback = true;
    console.warn(
      '\n⚠️  [ArogyaNexus DB Notice]: PostgreSQL server at localhost:5432 was not detected.\n' +
        '👉 Automatically activated local persistent storage (.local_db.json).\n' +
        '✨ You can test Patient Registration, Doctor Registration, and Login without any interruptions!\n' +
        '💡 Once you start PostgreSQL (Start-Service postgresql*), it will automatically use real PostgreSQL.\n'
    );
  }
}

// ----------------------------------------------------------------------------
// Fallback Query Implementations
// ----------------------------------------------------------------------------
const fallbackUser = {
  async findUnique(args: { where: { email?: string; id?: string }; include?: { doctor_profile?: boolean } }) {
    const db = loadLocalDB();
    const user = db.users.find((u) => {
      if (args.where.email) {
        return u.email.toLowerCase() === args.where.email.toLowerCase();
      }
      if (args.where.id) {
        return u.id === args.where.id;
      }
      return false;
    });

    if (!user) return null;

    if (args.include?.doctor_profile) {
      const doc = db.doctor_profiles.find((dp) => dp.user_id === user.id) || null;
      return { ...user, doctor_profile: doc };
    }

    return { ...user };
  },

  async create(args: { data: any; select?: any }) {
    const db = loadLocalDB();
    const newUser = {
      id: crypto.randomUUID(),
      full_name: args.data.full_name,
      email: args.data.email.toLowerCase().trim(),
      password_hash: args.data.password_hash,
      phone: args.data.phone || null,
      role: args.data.role || 'patient',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveLocalDB(db);

    return { ...newUser };
  },

  async upsert(args: { where: any; update: any; create: any }) {
    const db = loadLocalDB();
    const index = db.users.findIndex((u) => u.email.toLowerCase() === args.where.email.toLowerCase());

    if (index >= 0) {
      const updated = {
        ...db.users[index],
        ...args.update,
        updated_at: new Date().toISOString(),
      };
      db.users[index] = updated;
      saveLocalDB(db);
      return updated;
    } else {
      const newUser = {
        id: crypto.randomUUID(),
        ...args.create,
        email: args.create.email.toLowerCase().trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.users.push(newUser);
      saveLocalDB(db);
      return newUser;
    }
  },
};

const fallbackDoctorProfile = {
  async findUnique(args: { where: { registration_number?: string; user_id?: string } }) {
    const db = loadLocalDB();
    const doc = db.doctor_profiles.find((dp) => {
      if (args.where.registration_number) {
        return dp.registration_number.toUpperCase() === args.where.registration_number.toUpperCase();
      }
      if (args.where.user_id) {
        return dp.user_id === args.where.user_id;
      }
      return false;
    });

    return doc ? { ...doc } : null;
  },

  async create(args: { data: any }) {
    const db = loadLocalDB();
    const newDoc = {
      id: crypto.randomUUID(),
      user_id: args.data.user_id,
      speciality: args.data.speciality,
      registration_number: args.data.registration_number.toUpperCase().trim(),
      clinic_name: args.data.clinic_name,
      clinic_address: args.data.clinic_address,
      consultation_fee: Number(args.data.consultation_fee || 0),
      status: args.data.status || 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.doctor_profiles.push(newDoc);
    saveLocalDB(db);

    return { ...newDoc };
  },

  async upsert(args: { where: any; update: any; create: any }) {
    const db = loadLocalDB();
    const index = db.doctor_profiles.findIndex((dp) => dp.user_id === args.where.user_id);

    if (index >= 0) {
      const updated = {
        ...db.doctor_profiles[index],
        ...args.update,
        updated_at: new Date().toISOString(),
      };
      db.doctor_profiles[index] = updated;
      saveLocalDB(db);
      return updated;
    } else {
      const newDoc = {
        id: crypto.randomUUID(),
        ...args.create,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.doctor_profiles.push(newDoc);
      saveLocalDB(db);
      return newDoc;
    }
  },
};

// ----------------------------------------------------------------------------
// Resilient Prisma Client Wrapper
// ----------------------------------------------------------------------------
export const prisma = {
  user: {
    async findUnique(args: any) {
      const running = await isPostgresRunning();
      if (!running) {
        logFallbackNotice();
        return await fallbackUser.findUnique(args);
      }
      try {
        return await rawPrisma.user.findUnique(args);
      } catch (err) {
        if (isConnectionError(err)) {
          postgresAvailable = false;
          logFallbackNotice();
          return await fallbackUser.findUnique(args);
        }
        throw err;
      }
    },

    async create(args: any) {
      const running = await isPostgresRunning();
      if (!running) {
        logFallbackNotice();
        return await fallbackUser.create(args);
      }
      try {
        return await rawPrisma.user.create(args);
      } catch (err) {
        if (isConnectionError(err)) {
          postgresAvailable = false;
          logFallbackNotice();
          return await fallbackUser.create(args);
        }
        throw err;
      }
    },

    async upsert(args: any) {
      const running = await isPostgresRunning();
      if (!running) {
        logFallbackNotice();
        return await fallbackUser.upsert(args);
      }
      try {
        return await rawPrisma.user.upsert(args);
      } catch (err) {
        if (isConnectionError(err)) {
          postgresAvailable = false;
          logFallbackNotice();
          return await fallbackUser.upsert(args);
        }
        throw err;
      }
    },
  },

  doctorProfile: {
    async findUnique(args: any) {
      const running = await isPostgresRunning();
      if (!running) {
        logFallbackNotice();
        return await fallbackDoctorProfile.findUnique(args);
      }
      try {
        return await rawPrisma.doctorProfile.findUnique(args);
      } catch (err) {
        if (isConnectionError(err)) {
          postgresAvailable = false;
          logFallbackNotice();
          return await fallbackDoctorProfile.findUnique(args);
        }
        throw err;
      }
    },

    async create(args: any) {
      const running = await isPostgresRunning();
      if (!running) {
        logFallbackNotice();
        return await fallbackDoctorProfile.create(args);
      }
      try {
        return await rawPrisma.doctorProfile.create(args);
      } catch (err) {
        if (isConnectionError(err)) {
          postgresAvailable = false;
          logFallbackNotice();
          return await fallbackDoctorProfile.create(args);
        }
        throw err;
      }
    },

    async upsert(args: any) {
      const running = await isPostgresRunning();
      if (!running) {
        logFallbackNotice();
        return await fallbackDoctorProfile.upsert(args);
      }
      try {
        return await rawPrisma.doctorProfile.upsert(args);
      } catch (err) {
        if (isConnectionError(err)) {
          postgresAvailable = false;
          logFallbackNotice();
          return await fallbackDoctorProfile.upsert(args);
        }
        throw err;
      }
    },
  },

  async $transaction(callbackOrPromises: any) {
    const running = await isPostgresRunning();
    if (!running) {
      logFallbackNotice();
      if (typeof callbackOrPromises === 'function') {
        return await callbackOrPromises({
          user: fallbackUser,
          doctorProfile: fallbackDoctorProfile,
        });
      }
      if (Array.isArray(callbackOrPromises)) {
        return await Promise.all(callbackOrPromises);
      }
      return null;
    }

    try {
      return await rawPrisma.$transaction(callbackOrPromises);
    } catch (err) {
      if (isConnectionError(err)) {
        postgresAvailable = false;
        logFallbackNotice();
        if (typeof callbackOrPromises === 'function') {
          return await callbackOrPromises({
            user: fallbackUser,
            doctorProfile: fallbackDoctorProfile,
          });
        }
        throw err;
      }
      throw err;
    }
  },

  async $disconnect() {
    try {
      await rawPrisma.$disconnect();
    } catch {
      // Ignore disconnect error in fallback mode
    }
  },
} as unknown as PrismaClient;

export default prisma;
