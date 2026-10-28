import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();
const seedKey = (key: string) => `appointments-demo:${key}`;
const at = (days: number, hour: number, minute = 0) => { const date = new Date(); date.setDate(date.getDate() + days); date.setHours(hour, minute, 0, 0); return date; };

async function main() {
  const email = process.env.SEED_USER_EMAIL || 'patient@mednexus.org';
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const password = crypto.randomBytes(12).toString('base64url');
    user = await prisma.user.create({ data: { email, full_name: 'Rahul K.', role: 'patient', password_hash: await bcrypt.hash(password, 10) } });
    console.log(`Created ${email} with password: ${password}`);
  }
  const profiles: Record<string, any> = {};
  for (const [relation, name] of [['SELF', user.full_name], ['MOTHER', 'Sunita K.'], ['SON', 'Aarav K.']]) {
    const profile = await prisma.profile.upsert({ where: { seed_key: seedKey(`profile-${relation}`) }, update: { user_id: user.id, name }, create: { user_id: user.id, name, relation, seed_key: seedKey(`profile-${relation}`) } });
    await prisma.profileAccess.upsert({ where: { profile_id_user_id: { profile_id: profile.id, user_id: user.id } }, update: {}, create: { profile_id: profile.id, user_id: user.id } });
    profiles[relation] = profile;
  }
  const specs: Array<[string, string, string, string, string, number, number]> = [['Cardiologist', 'Anil Mehta', 'Cardiology', 'Apollo Hospital', 'Bannerghatta Road, Bengaluru', 12.9716, 77.5946], ['Dermatologist', 'Neha Sharma', 'Dermatology', 'Skin Clinic', 'Indiranagar, Bengaluru', 12.9784, 77.6408], ['General Physician', 'Sarah Chen', 'General Medicine', 'Arogya Clinic', 'Koramangala, Bengaluru', 12.9352, 77.6245], ['Pediatrician', 'Kiran Rao', 'Pediatrics', 'Little Steps Clinic', 'Jayanagar, Bengaluru', 12.925, 77.5838]];
  const doctors: any[] = [];
  for (const [index, [speciality, name, normalized, clinic, address, lat, lng]] of specs.entries()) {
    const doctorEmail = `appointments.seed.doctor${index + 1}@mednexus.org`;
    const doctorUser = await prisma.user.upsert({ where: { email: doctorEmail }, update: {}, create: { email: doctorEmail, full_name: name, password_hash: await bcrypt.hash(crypto.randomBytes(18).toString('hex'), 10), role: 'doctor' } });
    const doctor = await prisma.doctorProfile.upsert({ where: { user_id: doctorUser.id }, update: { speciality: normalized, clinic_name: clinic, clinic_address: address, verified: true, status: 'approved', clinic_lat: lat, clinic_lng: lng }, create: { user_id: doctorUser.id, speciality: normalized, registration_number: `SEED-APPT-${index + 1}`, clinic_name: clinic, clinic_address: address, consultation_fee: 500, status: 'approved', verified: true, clinic_lat: lat, clinic_lng: lng } });
    doctors.push({ ...doctor, seedLabel: speciality });
  }
  const entries: any[] = [
    ['self-video-tomorrow', 'SELF', 0, 'VIDEO', 'confirmed', at(1, 10, 30)], ['self-in-person', 'SELF', 1, 'IN_PERSON', 'confirmed', at(2, 16)], ['self-pending', 'SELF', 2, 'IN_PERSON', 'pending', at(7, 11)], ['self-video-soon', 'SELF', 0, 'VIDEO', 'confirmed', new Date(Date.now() + 5 * 60000)],
    ...[1, 2, 3].map((days, i) => [`self-completed-${i}`, 'SELF', i, 'IN_PERSON', 'completed', at(-days, 14)]), ['self-cancelled-a', 'SELF', 1, 'IN_PERSON', 'cancelled', at(8, 15)], ['self-cancelled-b', 'SELF', 3, 'VIDEO', 'cancelled', at(9, 9)],
    ['mother-a', 'MOTHER', 1, 'IN_PERSON', 'confirmed', at(3, 13)], ['mother-b', 'MOTHER', 2, 'VIDEO', 'pending', at(10, 9)], ['son-a', 'SON', 3, 'IN_PERSON', 'confirmed', at(4, 10)],
  ] as const;
  for (const [key, relation, doctorIndex, mode, status, starts] of entries) {
    const appointment = await prisma.appointment.upsert({ where: { seed_key: seedKey(key) }, update: { profile_id: profiles[relation].id, patient_id: user.id, doctor_profile_id: doctors[doctorIndex].id, appointment_at: starts, ends_at: new Date(starts.getTime() + 30 * 60000), mode, status, reason: key.startsWith('self-cancelled') ? 'Schedule changed' : 'Routine consultation', cancel_reason: key.startsWith('self-cancelled') ? 'Schedule changed' : null }, create: { seed_key: seedKey(key), profile_id: profiles[relation].id, patient_id: user.id, doctor_profile_id: doctors[doctorIndex].id, appointment_at: starts, ends_at: new Date(starts.getTime() + 30 * 60000), mode, status, reason: 'Routine consultation', cancel_reason: key.startsWith('self-cancelled') ? 'Schedule changed' : null } });
    if (key.startsWith('self-completed')) await prisma.visitRecord.upsert({ where: { appointment_id: appointment.id }, update: { prescription_file_key: `demo/${key}-prescription.pdf`, report_file_key: `demo/${key}-report.pdf` }, create: { appointment_id: appointment.id, prescription_file_key: `demo/${key}-prescription.pdf`, report_file_key: `demo/${key}-report.pdf` } });
  }
  console.log('Appointment demo data is ready.');
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
