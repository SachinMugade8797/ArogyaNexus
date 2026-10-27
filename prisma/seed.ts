import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const BCRYPT_SALT_ROUNDS = 12;

async function main() {
  console.log('[ArogyaNexus Seed] Starting local database seeding...');

  // 1. Seed Admin Account (Section 8)
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'a@gmail.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Pass@123';
  const adminHash = await bcrypt.hash(adminPassword, BCRYPT_SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      full_name: 'Platform Administrator',
      role: 'admin',
      password_hash: adminHash,
    },
    create: {
      full_name: 'Platform Administrator',
      email: adminEmail,
      phone: '+1 (555) 999-0000',
      role: 'admin',
      password_hash: adminHash,
    },
  });

  console.log(`[ArogyaNexus Seed] Seeded Admin: ${admin.email} (Role: ${admin.role})`);

  // 2. Seed Demo Approved Doctor Account (Section 18)
  const doctorEmail = 'd@gmail.com';
  const doctorHash = await bcrypt.hash('Pass@123', BCRYPT_SALT_ROUNDS);

  const doctorUser = await prisma.user.upsert({
    where: { email: doctorEmail },
    update: {
      full_name: 'Dr. Ananya Sharma',
      role: 'doctor',
      password_hash: doctorHash,
    },
    create: {
      full_name: 'Dr. Ananya Sharma',
      email: doctorEmail,
      phone: '+1 (555) 234-5678',
      role: 'doctor',
      password_hash: doctorHash,
    },
  });

  await prisma.doctorProfile.upsert({
    where: { user_id: doctorUser.id },
    update: {
      status: 'approved',
    },
    create: {
      user_id: doctorUser.id,
      speciality: 'Cardiology',
      registration_number: 'MCI-2020-88491',
      clinic_name: 'Apex Multi-Specialty Heart Center',
      clinic_address: 'Suite 400, Medical Boulevard',
      consultation_fee: 150.0,
      status: 'approved',
    },
  });

  console.log(`[ArogyaNexus Seed] Seeded Approved Doctor: ${doctorUser.email}`);

  // 3. Seed Demo Patient Account (Section 18)
  const patientEmail = 'u@gmail.com';
  const patientHash = await bcrypt.hash('Pass@123', BCRYPT_SALT_ROUNDS);

  const patient = await prisma.user.upsert({
    where: { email: patientEmail },
    update: {
      full_name: 'Atharv Kavitake',
      role: 'patient',
      password_hash: patientHash,
    },
    create: {
      full_name: 'Atharv Kavitake',
      email: patientEmail,
      phone: '+1 (555) 019-2834',
      role: 'patient',
      password_hash: patientHash,
    },
  });

  console.log(`[ArogyaNexus Seed] Seeded Patient: ${patient.email}`);
  console.log('[ArogyaNexus Seed] Local database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('[ArogyaNexus Seed] Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
