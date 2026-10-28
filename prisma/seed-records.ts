import { PrismaClient } from '@prisma/client';
import { storeRecord, recordPath } from '../server/recordStorage';
import fs from 'node:fs/promises';

const prisma = new PrismaClient();
const key = (value: string) => `health-records-demo:${value}`;
const atDaysAgo = (days: number, hour = 9) => { const date = new Date(); date.setDate(date.getDate() - days); date.setHours(hour, 15, 0, 0); return date; };
function makeSamplePdf(title: string): Buffer {
  const safe = title.replace(/[^A-Za-z0-9 .-]/g, '').slice(0, 90);
  const stream = `BT /F1 14 Tf 50 750 Td (Sample record for interface testing) Tj 0 -24 Td /F1 12 Tf (${safe}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(stream, 'ascii')} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf, 'ascii')); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf, 'ascii'); pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, 'ascii');
}
async function ensureSampleRecord(profileId: string, uploaderId: string, doctorId: string | null, item: { key: string; category: string; title: string; issuer: string; daysAgo: number }) {
  const seedKey = key(item.key); const existing = await prisma.healthRecord.findUnique({ where: { seed_key: seedKey } });
  if (existing) { try { await fs.access(recordPath(existing.file_key)); return prisma.healthRecord.update({ where: { id: existing.id }, data: { deleted_at: null } }); } catch { /* Recreate a missing private seed attachment. */ } }
  const bytes = makeSamplePdf(item.title); const fileKey = await storeRecord(bytes, 'pdf'); const fileName = `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
  return prisma.healthRecord.upsert({ where: { seed_key: seedKey }, update: { patient_id: profileId, category: item.category, title: item.title, issuer: item.issuer, record_date: atDaysAgo(item.daysAgo), doctor_id: doctorId, uploaded_by: uploaderId, source: 'DOCTOR', file_key: fileKey, file_name: fileName, mime_type: 'application/pdf', size_bytes: bytes.length, deleted_at: null }, create: { seed_key: seedKey, patient_id: profileId, category: item.category, title: item.title, issuer: item.issuer, record_date: atDaysAgo(item.daysAgo), doctor_id: doctorId, uploaded_by: uploaderId, source: 'DOCTOR', file_key: fileKey, file_name: fileName, mime_type: 'application/pdf', size_bytes: bytes.length } });
}

async function main() {
  const email = process.env.SEED_USER_EMAIL || 'patient@mednexus.org';
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`No seed user ${email}. Run the project user seed first or set SEED_USER_EMAIL.`);
  const profiles = await prisma.profile.findMany({ where: { user_id: user.id } });
  const self = profiles.find((profile) => profile.relation === 'SELF');
  if (!self) throw new Error('The seed user has no SELF profile. Run the profile/appointments seed first.');
  const mother = profiles.find((profile) => profile.relation === 'MOTHER');
  const doctors = await prisma.doctorProfile.findMany({ where: { status: 'approved' }, include: { user: { select: { id: true, full_name: true } } }, orderBy: { created_at: 'asc' }, take: 4 });
  if (!doctors.length) throw new Error('Create at least one approved doctor before seeding access history.');
  const recordSpecs = [
    ['self-cbc', 'LAB_REPORT', 'Complete Blood Count (CBC)', 'Apollo Diagnostics', 2, 0],
    ['self-echo', 'IMAGING', 'Echocardiogram (ECG) Report', 'Fortis Hospital', 4, 1],
    ['self-discharge', 'DISCHARGE_SUMMARY', 'Discharge Summary', 'Manipal Hospital', 30, 2],
    ['self-prescription', 'PRESCRIPTION', 'Cardiology Prescription', 'Apollo Hospital', 8, 0],
    ['self-lipid', 'LAB_REPORT', 'Lipid Profile', 'Metropolis Healthcare', 12, 2],
    ['self-chest', 'IMAGING', 'Chest X-ray Report', 'Aster CMI Hospital', 21, 1],
    ['self-consult', 'OTHER', 'Consultation Notes', 'Narayana Health', 35, 3],
    ['self-thyroid', 'LAB_REPORT', 'Thyroid Function Test', 'Dr Lal PathLabs', 48, 0],
  ] as const;
  const selfRecords: any[] = [];
  for (const [recordKey, category, title, issuer, daysAgo, doctorIndex] of recordSpecs) selfRecords.push(await ensureSampleRecord(self.id, doctors[doctorIndex % doctors.length].user_id, doctors[doctorIndex % doctors.length].id, { key: recordKey, category, title, issuer, daysAgo }));
  if (mother) {
    const specs = [['mother-lab', 'LAB_REPORT', 'Vitamin D Test', 'Aster Labs', 15, 1], ['mother-prescription', 'PRESCRIPTION', 'General Medicine Prescription', 'Apollo Hospital', 24, 0]] as const;
    for (const [recordKey, category, title, issuer, daysAgo, doctorIndex] of specs) await ensureSampleRecord(mother.id, doctors[doctorIndex % doctors.length].user_id, doctors[doctorIndex % doctors.length].id, { key: recordKey, category, title, issuer, daysAgo });
  }
  const currentSelf = await prisma.profile.findUnique({ where: { id: self.id }, select: { allergies: true } });
  await prisma.profile.update({ where: { id: self.id }, data: { allergies: [...new Set([...(currentSelf?.allergies || []), 'Penicillin', 'Pollen'])] } });
  const conditions = [['Hypertension', 'ACTIVE', 120], ['Type 2 Diabetes', 'ACTIVE', 90], ['Iron deficiency', 'RESOLVED', 240]] as const;
  for (const [name, status, sinceDays] of conditions) { const seedKey = key(`condition-${name}`); await prisma.patientCondition.upsert({ where: { seed_key: seedKey }, update: { patient_id: self.id, name, status, since: atDaysAgo(sinceDays) }, create: { seed_key: seedKey, patient_id: self.id, name, status, since: atDaysAgo(sinceDays) } }); }
  for (let index = 0; index < 31; index++) {
    const daysAgo = index * 3; const measuredAt = new Date(Date.now() - daysAgo * 86400000);
    const bloodSugar = 96 + Math.round(Math.sin(index * 0.83) * 9); const systolic = 118 + Math.round(Math.sin(index * 0.71) * 4); const diastolic = 76 + Math.round(Math.cos(index * 0.68) * 3); const cholesterol = 185 + Math.round(Math.sin(index * 0.41) * 8);
    const readings = [['BLOOD_SUGAR_FASTING', bloodSugar, 'mg/dL'], ['BP_SYSTOLIC', systolic, 'mmHg'], ['BP_DIASTOLIC', diastolic, 'mmHg'], ['CHOLESTEROL_TOTAL', cholesterol, 'mg/dL']] as const;
    for (const [type, value, unit] of readings) { const seedKey = key(`vital-${index}-${type}`); await prisma.vitalReading.upsert({ where: { seed_key: seedKey }, update: { patient_id: self.id, type, value, unit, measured_at: measuredAt, source: 'SELF' }, create: { seed_key: seedKey, patient_id: self.id, type, value, unit, measured_at: measuredAt, source: 'SELF' } }); }
  }
  const accessDays = [0, 0, 2, 2, 9, 24];
  for (let index = 0; index < accessDays.length; index++) { const doctor = doctors[index % doctors.length]; const createdAt = accessDays[index] === 0 ? new Date(Date.now() - (index + 1) * 45 * 60000) : atDaysAgo(accessDays[index], 14); const access = { patient_id: self.id, doctor_id: doctor.id, action: index === 2 ? 'WRITE' : index === 5 ? 'DOWNLOAD' : 'VIEW', record_id: selfRecords[index % selfRecords.length].id, record_title: selfRecords[index % selfRecords.length].title, created_at: createdAt }; await prisma.accessLog.upsert({ where: { id: `${user.id}-records-access-${index + 1}` }, update: access, create: { id: `${user.id}-records-access-${index + 1}`, ...access } }); }
  console.log(`Seeded health records, vitals, and access history for ${email}. ${mother ? 'Mother has two records; Son remains empty.' : 'Family profiles were not present.'}`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
