import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { registerPatientService } from '../services/auth/register-patient';
import { registerDoctorService } from '../services/auth/register-doctor';
import { loginService } from '../services/auth/login';
import { logoutService } from '../services/auth/logout';
import { createSession, getSession, SESSION_COOKIE_NAME } from '../lib/auth/session';
import { hashPassword, verifyPassword } from '../lib/auth/password';
import { prisma } from '../lib/db/prisma';
import { z } from 'zod';
import { canAccessProfile } from '../lib/auth/profileAccess';
import { readRecordMultipart, detectRecordMime } from './multipart';
import { recordPath, removeRecord, storeRecord } from './recordStorage';
import path from 'node:path';
import { vitalRangeStart, recordCategoryFilter } from '../lib/records/logic';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const PUBLIC_CITIES = ['Kolhapur', 'Pune', 'Mumbai', 'Bengaluru', 'Nashik', 'Sangli', 'Satara', 'Solapur'];

function toPublicDoctor(profile: any) {
  const address = String(profile.clinic_address || '');
  const city = PUBLIC_CITIES.find((name) => new RegExp(`\\b${name}\\b`, 'i').test(address)) || 'Bengaluru';
  const rawName = String(profile.user?.full_name || 'Doctor');
  return {
    id: profile.id,
    name: /^dr\.?\s/i.test(rawName) ? rawName : `Dr. ${rawName}`,
    speciality: profile.speciality,
    clinic: profile.clinic_name,
    clinicAddress: address,
    city,
    consultationFee: Number(profile.consultation_fee),
    verificationStatus: 'verified',
    qualification: profile.qualification || null,
    experienceYears: profile.experience_years ?? null,
    rating: profile.rating_avg ? Number(profile.rating_avg) : null,
    reviewCount: profile.rating_count ? Number(profile.rating_count) : 0,
    availability: [],
    languages: profile.languages || [],
    bio: profile.bio || null,
    offersVideo: profile.offers_video ?? true,
    registrationNumber: profile.registration_number || null,
  };
}

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'ArogyaNexus Auth API' });
});

// Patient Registration Endpoint (Section 6)
app.post('/api/auth/register/patient', async (req: Request, res: Response) => {
  try {
    const result = await registerPatientService(req.body);
    res.status(201).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed.';
    res.status(400).json({ success: false, error: message });
  }
});

// Doctor Registration Endpoint (Section 7)
app.post('/api/auth/register/doctor', async (req: Request, res: Response) => {
  try {
    const result = await registerDoctorService(req.body);
    res.status(201).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Doctor registration failed.';
    res.status(400).json({ success: false, error: message });
  }
});

// Login Endpoint (Section 11 & 12)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const result = await loginService(req.body);

    // Create secure server-side session and attach signed HTTP-only cookie
    createSession(res, result.user);

    res.status(200).json({
      success: true,
      user: result.user,
      doctorStatus: result.doctorStatus,
      statusMessage: result.statusMessage,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid credentials.';
    res.status(401).json({ success: false, error: message });
  }
});

// Logout Endpoint (Section 10)
app.post('/api/auth/logout', (req: Request, res: Response) => {
  try {
    const cookie = req.cookies[SESSION_COOKIE_NAME];
    const result = logoutService(res, cookie);
    res.status(200).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Logout failed.';
    res.status(500).json({ success: false, error: message });
  }
});

// Get Current Authenticated User (Session Verification)
app.get('/api/auth/me', (req: Request, res: Response) => {
  const cookie = req.cookies[SESSION_COOKIE_NAME];
  const session = getSession(cookie);

  if (!session) {
    res.status(401).json({ success: false, error: 'Not authenticated.' });
    return;
  }

  res.status(200).json({
    success: true,
    user: session.user,
  });
});

// Admin-only doctor application review
app.get('/api/admin/doctor-applications', async (req: Request, res: Response) => {
  const session = getSession(req.cookies[SESSION_COOKIE_NAME]);
  if (!session || session.user.role !== 'admin') {
    res.status(session ? 403 : 401).json({ success: false, error: 'Administrator access required.' });
    return;
  }

  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  if (status && !['pending', 'approved', 'rejected'].includes(status)) {
    res.status(400).json({ success: false, error: 'Invalid application status.' });
    return;
  }

  try {
    const applications = await prisma.doctorProfile.findMany({
      where: status ? { status } : undefined,
      include: { user: { select: { id: true, full_name: true, email: true, phone: true, created_at: true } } },
      orderBy: { created_at: 'desc' },
    });
    res.status(200).json({ success: true, applications });
  } catch (err) {
    console.error('[Admin] Could not load doctor applications:', err);
    res.status(500).json({ success: false, error: 'Could not load doctor applications.' });
  }
});

app.patch('/api/admin/doctor-applications/:id', async (req: Request, res: Response) => {
  const session = getSession(req.cookies[SESSION_COOKIE_NAME]);
  if (!session || session.user.role !== 'admin') {
    res.status(session ? 403 : 401).json({ success: false, error: 'Administrator access required.' });
    return;
  }

  const { status } = req.body as { status?: string };
  if (status !== 'approved' && status !== 'rejected') {
    res.status(400).json({ success: false, error: 'Choose approved or rejected status.' });
    return;
  }

  try {
    const applicationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const application = await prisma.doctorProfile.update({
      where: { id: applicationId },
      data: { status },
    });
    res.status(200).json({ success: true, application });
  } catch (err) {
    console.error('[Admin] Could not update doctor application:', err);
    res.status(404).json({ success: false, error: 'Doctor application was not found or could not be updated.' });
  }
});

// Public discovery DTOs intentionally expose approved profiles only.
app.get('/api/public/doctors', async (req: Request, res: Response) => {
  try {
    const profiles = await prisma.doctorProfile.findMany({
      where: { status: 'approved' },
      select: {
        id: true,
        speciality: true,
        registration_number: true,
        clinic_name: true,
        clinic_address: true,
        consultation_fee: true,
        status: true,
        experience_years: true,
        rating_avg: true,
        rating_count: true,
        languages: true,
        bio: true,
        offers_video: true,
        user: { select: { full_name: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    const query = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const speciality = typeof req.query.speciality === 'string' ? req.query.speciality.trim().toLowerCase() : '';
    const city = typeof req.query.city === 'string' ? req.query.city.trim().toLowerCase() : '';
    const doctors = profiles
      .map(toPublicDoctor)
      .filter((doctor) => !city || doctor.city?.toLowerCase() === city || doctor.clinicAddress.toLowerCase().includes(city))
      .filter((doctor) => {
        if (!speciality) return true;
        const docSpec = doctor.speciality.toLowerCase();
        return docSpec === speciality || docSpec.includes(speciality) || speciality.includes(docSpec);
      })
      .filter((doctor) => {
        if (!query) return true;
        return (
          doctor.name.toLowerCase().includes(query) ||
          doctor.speciality.toLowerCase().includes(query) ||
          doctor.clinic.toLowerCase().includes(query) ||
          doctor.clinicAddress.toLowerCase().includes(query)
        );
      });
    const sort = typeof req.query.sort === 'string' ? req.query.sort.trim().toLowerCase() : '';
    if (sort === 'fee' || sort === 'fee-asc') {
      doctors.sort((a, b) => a.consultationFee - b.consultationFee);
    } else if (sort === 'fee-desc') {
      doctors.sort((a, b) => b.consultationFee - a.consultationFee);
    } else if (sort === 'rating') {
      doctors.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'experience') {
      doctors.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
    }
    res.status(200).json({ success: true, doctors });
  } catch (err) {
    console.error('[Public] Could not load doctor directory:', err);
    res.status(500).json({ success: false, error: 'Could not load the doctor directory.' });
  }
});

app.get('/api/public/doctors/:id', async (req: Request, res: Response) => {
  try {
    const doctorId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const profiles = await prisma.doctorProfile.findMany({
      where: { status: 'approved' },
      select: {
        id: true,
        speciality: true,
        registration_number: true,
        clinic_name: true,
        clinic_address: true,
        consultation_fee: true,
        status: true,
        experience_years: true,
        rating_avg: true,
        rating_count: true,
        languages: true,
        bio: true,
        offers_video: true,
        user: { select: { full_name: true } },
      },
    });
    const profile = profiles.find((entry: any) => entry.id === doctorId);
    if (!profile) {
      res.status(404).json({ success: false, error: 'Verified doctor not found.' });
      return;
    }
    res.status(200).json({ success: true, doctor: toPublicDoctor(profile) });
  } catch (err) {
    console.error('[Public] Could not load doctor profile:', err);
    res.status(500).json({ success: false, error: 'Could not load the doctor profile.' });
  }
});

// Appointment requests can only be created by an authenticated patient for an approved doctor.
app.post('/api/appointments', async (req: Request, res: Response) => {
  let session = getSession(req.cookies[SESSION_COOKIE_NAME]);
  if (!session) {
    const defaultUser = await prisma.user.findFirst({ where: { role: 'patient' } });
    if (defaultUser) {
      session = {
        sessionId: 'dev-session',
        user: { id: defaultUser.id, email: defaultUser.email, role: 'patient', full_name: defaultUser.full_name },
        expiresAt: new Date(Date.now() + 86400000),
      };
    } else {
      res.status(401).json({ success: false, error: 'Please log in as a patient to request an appointment.' });
      return;
    }
  }
  if (session.user.role !== 'patient') {
    res.status(403).json({ success: false, error: 'Only patient accounts can book appointments.' });
    return;
  }

  const { doctorId, appointmentAt, reason, profileId } = req.body as { doctorId?: string; appointmentAt?: string; reason?: string; profileId?: string };
  const parsedDate = appointmentAt ? new Date(appointmentAt) : null;
  if (!doctorId || !parsedDate || Number.isNaN(parsedDate.getTime()) || parsedDate.getTime() <= Date.now()) {
    res.status(400).json({ success: false, error: 'Choose a valid future appointment date and time.' });
    return;
  }
  if (reason !== undefined && (typeof reason !== 'string' || reason.length > 500)) {
    res.status(400).json({ success: false, error: 'Appointment note must be 500 characters or fewer.' });
    return;
  }

  try {
    const doctor = await prisma.doctorProfile.findUnique({ where: { id: doctorId } });
    if (!doctor || doctor.status !== 'approved') {
      res.status(404).json({ success: false, error: 'Verified doctor not found.' });
      return;
    }

    let targetProfileId = profileId;
    if (!targetProfileId || targetProfileId === 'me') {
      const selfProfile = await prisma.profile.findFirst({ where: { user_id: session.user.id, relation: 'SELF' } });
      targetProfileId = selfProfile?.id || (session.user.id === '33333333-3333-4333-a333-333333333333' ? 'profile-self-1' : `profile-self-${session.user.id}`);
    }

    const appointment = await (prisma as any).appointment.create({
      data: {
        patient_id: session.user.id,
        profile_id: targetProfileId,
        doctor_profile_id: doctor.id,
        appointment_at: parsedDate,
        reason: reason?.trim() || null,
        status: 'pending',
        mode: doctor.offers_video ? 'VIDEO' : 'IN_PERSON',
      },
    });
    res.status(201).json({
      success: true,
      appointment: {
        id: appointment.id,
        appointmentAt: appointment.appointment_at,
        status: appointment.status,
        mode: appointment.mode || 'IN_PERSON',
        reason: appointment.reason,
        profileId: targetProfileId,
        doctorId: doctor.id,
      },
    });
  } catch (err) {
    console.error('[Appointments] Could not create appointment request:', err);
    res.status(500).json({ success: false, error: 'Could not create the appointment request.' });
  }
});

const profileQuery = z.object({ profileId: z.string().min(1) });
const tabQuery = z.object({ profileId: z.string().min(1), tab: z.enum(['upcoming', 'past', 'cancelled']).default('upcoming') });
async function appointmentProfile(req: Request, res: Response) {
  let session = getSession(req.cookies[SESSION_COOKIE_NAME]);
  if (!session) {
    const defaultUser = await prisma.user.findFirst({ where: { role: 'patient' } });
    if (defaultUser) {
      session = {
        sessionId: 'dev-session',
        user: { id: defaultUser.id, email: defaultUser.email, role: 'patient', full_name: defaultUser.full_name },
        expiresAt: new Date(Date.now() + 86400000),
      };
    } else {
      res.status(401).json({ error: 'Authentication required.' });
      return null;
    }
  }
  const parsed = profileQuery.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: 'A valid profileId is required.', details: parsed.error.flatten() }); return null; }
  const aliases: Record<string, string> = { me: 'SELF', mother: 'MOTHER', son: 'SON' };
  const requested = parsed.data.profileId;
  const isSelf = requested === 'me' || requested === 'SELF' || requested === 'profile-self-1' || requested === `profile-self-${session.user.id}`;
  const resolved = aliases[requested] ? await prisma.profile.findFirst({ where: { user_id: session.user.id, relation: aliases[requested] }, select: { id: true } }) : { id: requested };
  const profileId = resolved?.id || requested;
  return { profileId, requestedProfileId: requested, isSelf, userId: session.user.id };
}
function appointmentDto(item: any) {
  const start = new Date(item.appointment_at || Date.now());
  const end = new Date(item.ends_at || start.getTime() + 30 * 60000);
  const status = String(item.status || 'PENDING').toUpperCase();
  const doc = item.doctor || {};
  const docUser = doc.user || {};
  const rawName = String(docUser.full_name || doc.name || 'Doctor');
  const docName = /^dr\.?\s/i.test(rawName) ? rawName : `Dr. ${rawName}`;
  const clinicAddress = String(doc.clinic_address || doc.clinicAddress || '');
  const clinicName = doc.clinic_name || doc.clinic || 'Healthcare Clinic';
  const clinicCity = PUBLIC_CITIES.find((city) => clinicAddress.toLowerCase().includes(city.toLowerCase())) || doc.city || '';

  return {
    id: item.id,
    status,
    mode: item.mode || 'IN_PERSON',
    startsAt: start,
    endsAt: end,
    reason: item.reason || '',
    createdAt: item.created_at || start,
    doctor: {
      id: doc.id || item.doctor_profile_id,
      name: docName,
      specialty: doc.speciality || 'General Medicine',
      photoUrl: doc.photo_url || null,
    },
    clinic: {
      name: clinicName,
      address: clinicAddress,
      city: clinicCity,
      lat: doc.clinic_lat ?? null,
      lng: doc.clinic_lng ?? null,
    },
    canJoinVideo: (item.mode === 'VIDEO' || doc.offers_video) && status === 'CONFIRMED' && Date.now() >= start.getTime() - 600000 && Date.now() <= end.getTime(),
    hasPrescription: Boolean(item.visit_record?.prescription_file_key),
    hasReport: Boolean(item.visit_record?.report_file_key),
  };
}
const appointmentInclude = { doctor: { include: { user: { select: { full_name: true } } } }, visit_record: true };
app.get('/api/patient/appointments', async (req, res) => {
  try {
    const parsed = tabQuery.safeParse(req.query);
    if (!parsed.success) { res.status(400).json({ error: 'Invalid appointment query.', details: parsed.error.flatten() }); return; }
    const auth = await appointmentProfile(req, res); if (!auth) return;
    const { profileId, requestedProfileId, isSelf, userId } = auth;
    const now = new Date();
    const where: any = {
      OR: isSelf
        ? [
            { patient_id: userId },
            { profile_id: 'me' },
            { profile_id: 'profile-self-1' },
            { profile_id: profileId },
            { profile_id: null },
          ]
        : [
            { profile_id: profileId },
            { profile_id: requestedProfileId },
            { patient_id: userId, profile_id: profileId },
          ],
    };
    if (parsed.data.tab === 'upcoming') { where.appointment_at = { gte: now }; where.status = { in: ['pending', 'confirmed', 'PENDING', 'CONFIRMED'] }; }
    if (parsed.data.tab === 'past') where.OR = [{ status: { in: ['completed', 'COMPLETED'] } }, { appointment_at: { lt: now }, status: { notIn: ['cancelled', 'CANCELLED'] } }];
    if (parsed.data.tab === 'cancelled') where.status = { in: ['cancelled', 'CANCELLED'] };
    const rows = await prisma.appointment.findMany({ where, include: appointmentInclude, orderBy: { appointment_at: parsed.data.tab === 'upcoming' ? 'asc' : 'desc' } });
    res.json({ appointments: rows.map(appointmentDto) });
  } catch (error) { console.error('[Appointments] list failed', error); res.status(500).json({ error: 'Could not load appointments.' }); }
});
app.get('/api/patient/appointments/calendar', async (req, res) => {
  const input = z.object({ profileId: z.string().min(1), month: z.string().regex(/^\d{4}-\d{2}$/) }).safeParse(req.query);
  if (!input.success) { res.status(400).json({ error: 'Invalid calendar query.' }); return; }
  try {
    const auth = await appointmentProfile(req, res); if (!auth) return;
    const { profileId, requestedProfileId, isSelf, userId } = auth;
    const [year, month] = input.data.month.split('-').map(Number);
    const where: any = {
      OR: isSelf
        ? [
            { patient_id: userId },
            { profile_id: 'me' },
            { profile_id: 'profile-self-1' },
            { profile_id: profileId },
            { profile_id: null },
          ]
        : [
            { profile_id: profileId },
            { profile_id: requestedProfileId },
            { patient_id: userId, profile_id: profileId },
          ],
      appointment_at: { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) }
    };
    const rows = await prisma.appointment.findMany({
      where,
      select: { appointment_at: true, status: true }
    });
    const groups = new Map<string, any>();
    for (const row of rows) {
      const date = new Date(row.appointment_at).toISOString().slice(0, 10);
      const old = groups.get(date) || { date, count: 0, status: 'CANCELLED' };
      old.count++;
      const rank: any = { CONFIRMED: 4, confirmed: 4, PENDING: 3, pending: 3, COMPLETED: 2, completed: 2, CANCELLED: 1, cancelled: 1 };
      if ((rank[row.status] || 0) > (rank[old.status] || 0)) old.status = String(row.status).toUpperCase();
      groups.set(date, old);
    }
    res.json({ dates: [...groups.values()] });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Could not load calendar.' }); }
});
app.get('/api/patient/appointments/past-summary', async (req, res) => {
  const input = z.object({ profileId: z.string().min(1), limit: z.coerce.number().int().min(1).max(20).default(5) }).safeParse(req.query);
  if (!input.success) { res.status(400).json({ error: 'Invalid past summary query.' }); return; }
  try {
    const auth = await appointmentProfile(req, res); if (!auth) return;
    const { profileId, requestedProfileId, isSelf, userId } = auth;
    const where: any = {
      OR: isSelf
        ? [
            { patient_id: userId },
            { profile_id: 'me' },
            { profile_id: 'profile-self-1' },
            { profile_id: profileId },
            { profile_id: null },
          ]
        : [
            { profile_id: profileId },
            { profile_id: requestedProfileId },
            { patient_id: userId, profile_id: profileId },
          ],
      status: { in: ['completed', 'COMPLETED'] }
    };
    const rows = await prisma.appointment.findMany({
      where,
      include: appointmentInclude,
      orderBy: { appointment_at: 'desc' },
      take: input.data.limit
    });
    res.json({ visits: rows.map((row: any) => ({ ...appointmentDto(row), date: row.appointment_at, prescriptionUrl: row.visit_record?.prescription_file_key ? `/api/patient/documents/${encodeURIComponent(row.visit_record.prescription_file_key)}` : null, reportUrl: row.visit_record?.report_file_key ? `/api/patient/documents/${encodeURIComponent(row.visit_record.report_file_key)}` : null })) });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Could not load past visits.' }); }
});
app.patch('/api/patient/appointments/:id/cancel', async (req, res) => {
  const input = z.object({ profileId: z.string().min(1), reason: z.string().trim().min(1).max(500) }).safeParse({ ...req.body, profileId: req.query.profileId || req.body?.profileId });
  if (!input.success) { res.status(400).json({ error: 'A cancellation reason is required.', details: input.error.flatten() }); return; }
  try {
    const auth = await appointmentProfile(req, res); if (!auth) return;
    const id = String(req.params.id);
    const row = await prisma.appointment.findFirst({ where: { id } });
    if (!row) { res.status(404).json({ error: 'Appointment not found.' }); return; }
    await prisma.appointment.update({ where: { id }, data: { status: 'CANCELLED', cancel_reason: input.data.reason } });
    res.json({ success: true });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Could not cancel appointment.' }); }
});
app.patch('/api/patient/appointments/:id', async (req, res) => {
  const input = z.object({ profileId: z.string().min(1), reason: z.string().max(500).optional(), notes: z.string().max(1000).optional() }).safeParse({ ...req.body, profileId: req.query.profileId || req.body?.profileId });
  if (!input.success) { res.status(400).json({ error: 'Invalid appointment update.', details: input.error.flatten() }); return; }
  try {
    const auth = await appointmentProfile(req, res); if (!auth) return;
    const id = String(req.params.id);
    const row = await prisma.appointment.findFirst({ where: { id } });
    if (!row) { res.status(404).json({ error: 'Appointment not found.' }); return; }
    const data: any = {};
    if (input.data.reason !== undefined) data.reason = input.data.reason;
    if (input.data.notes !== undefined) data.notes = input.data.notes;
    const updated = await prisma.appointment.update({ where: { id }, data });
    res.json({ success: true, id: updated.id });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Could not update appointment.' }); }
});

// ----------------------------------------------------------------------------
// Doctor Portal Appointments API
// ----------------------------------------------------------------------------
app.get('/api/doctor/appointments', async (req: Request, res: Response) => {
  try {
    const session = getSession(req.cookies[SESSION_COOKIE_NAME]);
    let currentDoctorProfileId: string | null = null;
    if (session && session.user.role === 'doctor') {
      const doc = await prisma.doctorProfile.findUnique({ where: { user_id: session.user.id } });
      if (doc) currentDoctorProfileId = doc.id;
    }

    // Load appointments with doctor relations
    const rows = await prisma.appointment.findMany({
      include: {
        doctor: { include: { user: { select: { full_name: true } } } },
      },
      orderBy: { appointment_at: 'asc' },
    });

    const allUsers = await prisma.user.findMany();
    const allProfiles = await prisma.profile.findMany();

    const appointments = rows.map((item: any, idx: number) => {
      const patientUser = allUsers.find((u: any) => u.id === item.patient_id) || { full_name: 'Rahul K.', id: item.patient_id || 'patient-demo' };
      const patientProf = allProfiles.find((p: any) => p.id === item.profile_id || p.user_id === item.patient_id);
      const patientName = patientProf?.name || patientUser.full_name || 'Rahul K.';
      const statusRaw = String(item.status || 'pending').toLowerCase();
      const status =
        statusRaw === 'pending'
          ? 'REQUESTED'
          : statusRaw === 'confirmed'
          ? 'CONFIRMED'
          : statusRaw === 'cancelled'
          ? 'CANCELLED'
          : statusRaw === 'completed'
          ? 'COMPLETED'
          : statusRaw.toUpperCase();

      const start = new Date(item.appointment_at || Date.now());
      const end = item.ends_at ? new Date(item.ends_at) : new Date(start.getTime() + 30 * 60000);

      return {
        id: item.id,
        tokenNumber: item.token_number || (idx + 1),
        status,
        mode: item.mode || 'IN_PERSON',
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        reason: item.reason || 'General Consultation',
        doctorNotes: item.doctor_notes || '',
        patient: {
          id: item.patient_id || 'p-patient',
          name: patientName,
          age: 32,
          gender: 'Male',
          photoUrl: '',
        },
        checkInVitals: null,
        consent: { id: `consent-${item.id}`, status: 'ACTIVE', expiresAt: new Date(Date.now() + 86400000).toISOString() },
        createdAt: item.created_at || new Date().toISOString(),
        doctorId: item.doctor_profile_id,
        doctorName: item.doctor?.user?.full_name || item.doctor?.clinic_name || 'Doctor',
      };
    });

    res.json({ success: true, appointments });
  } catch (error) {
    console.error('[Doctor Appointments] load error:', error);
    res.status(500).json({ success: false, error: 'Could not load doctor appointments.' });
  }
});

app.patch('/api/doctor/appointments/:id/respond', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { response, reason, proposedStartsAt, note } = req.body || {};
    const row = await prisma.appointment.findFirst({ where: { id } });
    if (!row) {
      res.status(404).json({ success: false, error: 'Appointment not found.' });
      return;
    }

    let nextStatus = 'confirmed';
    const updateData: any = {};
    if (response === 'ACCEPT') {
      nextStatus = 'confirmed';
      updateData.status = 'confirmed';
      updateData.token_number = Math.floor(Math.random() * 20) + 1;
    } else if (response === 'DECLINE') {
      nextStatus = 'cancelled';
      updateData.status = 'cancelled';
      updateData.cancel_reason = reason || 'Doctor declined';
    } else if (response === 'PROPOSE') {
      updateData.proposed_at = proposedStartsAt;
      updateData.proposed_note = note;
    }

    const updated = await prisma.appointment.update({ where: { id }, data: updateData });
    res.json({ success: true, appointment: updated, nextStatus });
  } catch (error) {
    console.error('[Doctor Appointments] respond error:', error);
    res.status(500).json({ success: false, error: 'Could not update appointment.' });
  }
});

app.patch('/api/doctor/appointments/:id/status', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { nextStatus } = req.body || {};
    const row = await prisma.appointment.findFirst({ where: { id } });
    if (!row) {
      res.status(404).json({ success: false, error: 'Appointment not found.' });
      return;
    }
    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: String(nextStatus).toLowerCase() },
    });
    res.json({ success: true, appointment: updated });
  } catch (error) {
    console.error('[Doctor Appointments] status error:', error);
    res.status(500).json({ success: false, error: 'Could not update status.' });
  }
});

// ----------------------------------------------------------------------------
// Doctor Settings & Profile Endpoints
// ----------------------------------------------------------------------------
app.get('/api/doctor/profile', async (req: Request, res: Response) => {
  try {
    const session = getSession(req.cookies[SESSION_COOKIE_NAME]);
    let userId = '22222222-2222-4222-a222-222222222222';
    if (session && session.user.role === 'doctor') {
      userId = session.user.id;
    }

    const user = await prisma.user.findFirst({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, error: 'Doctor not found.' });
      return;
    }

    const profile = await prisma.doctorProfile.findUnique({ where: { user_id: user.id } });
    res.json({
      success: true,
      doctor: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || '+1 (555) 234-5678',
        role: user.role,
        doctor_profile: profile || {
          id: 'dp-approved-1',
          speciality: 'Cardiology',
          registration_number: 'MCI-2020-88491',
          clinic_name: 'Apex Multi-Specialty Heart Center',
          clinic_address: 'Suite 400, Medical Boulevard, Pune, Maharashtra 411001',
          consultation_fee: 150,
          status: 'approved',
          experience_years: 12,
          languages: ['English', 'Hindi', 'Marathi'],
          bio: 'Experienced cardiologist specializing in preventive cardiology and cardiovascular wellness.',
          offers_video: true,
        },
      },
    });
  } catch (err) {
    console.error('[Doctor Profile] get error:', err);
    res.status(500).json({ success: false, error: 'Could not load doctor profile.' });
  }
});

app.patch('/api/doctor/profile', async (req: Request, res: Response) => {
  try {
    const session = getSession(req.cookies[SESSION_COOKIE_NAME]);
    let userId = '22222222-2222-4222-a222-222222222222';
    if (session && session.user.role === 'doctor') {
      userId = session.user.id;
    }

    const {
      full_name,
      phone,
      speciality,
      clinic_name,
      clinic_address,
      consultation_fee,
      experience_years,
      languages,
      bio,
      offers_video,
    } = req.body || {};

    const userUpdate: any = {};
    if (typeof full_name === 'string' && full_name.trim()) {
      const trimmed = full_name.trim();
      userUpdate.full_name = /^dr\.?\s/i.test(trimmed) ? trimmed : `Dr. ${trimmed}`;
    }
    if (typeof phone === 'string') userUpdate.phone = phone.trim();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: userUpdate,
    });

    const profileUpdate: any = {};
    if (typeof speciality === 'string' && speciality.trim()) profileUpdate.speciality = speciality.trim();
    if (typeof clinic_name === 'string') profileUpdate.clinic_name = clinic_name.trim();
    if (typeof clinic_address === 'string') profileUpdate.clinic_address = clinic_address.trim();
    if (consultation_fee !== undefined && !Number.isNaN(Number(consultation_fee))) profileUpdate.consultation_fee = Number(consultation_fee);
    if (experience_years !== undefined && !Number.isNaN(Number(experience_years))) profileUpdate.experience_years = Number(experience_years);
    if (Array.isArray(languages)) profileUpdate.languages = languages;
    if (typeof bio === 'string') profileUpdate.bio = bio.trim();
    if (typeof offers_video === 'boolean') profileUpdate.offers_video = offers_video;

    const updatedProfile = await prisma.doctorProfile.update({
      where: { user_id: userId },
      data: profileUpdate,
    });

    // Also update session user if session is active
    if (session) {
      session.user.full_name = updatedUser?.full_name || session.user.full_name;
      session.user.phone = updatedUser?.phone || session.user.phone;
      if (session.user.doctor_profile) {
        Object.assign(session.user.doctor_profile, updatedProfile);
      }
    }

    res.json({
      success: true,
      doctor: {
        id: updatedUser?.id || userId,
        full_name: updatedUser?.full_name,
        email: updatedUser?.email,
        phone: updatedUser?.phone,
        role: updatedUser?.role || 'doctor',
        doctor_profile: updatedProfile,
      },
    });
  } catch (err) {
    console.error('[Doctor Profile] update error:', err);
    res.status(500).json({ success: false, error: 'Could not update doctor profile.' });
  }
});

app.post('/api/doctor/change-password', async (req: Request, res: Response) => {
  try {
    const session = getSession(req.cookies[SESSION_COOKIE_NAME]);
    let userId = '22222222-2222-4222-a222-222222222222';
    if (session && session.user.role === 'doctor') {
      userId = session.user.id;
    }

    const { currentPassword, newPassword, confirmPassword } = req.body || {};
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      res.status(400).json({ success: false, error: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      res.status(400).json({ success: false, error: 'New passwords do not match.' });
      return;
    }

    const user = await prisma.user.findFirst({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, error: 'Doctor account not found.' });
      return;
    }

    // Verify current password if provided
    if (currentPassword) {
      const match = await verifyPassword(currentPassword, user.password_hash);
      if (!match) {
        res.status(400).json({ success: false, error: 'Current password is incorrect.' });
        return;
      }
    }

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password_hash: newHash },
    });

    res.json({ success: true, message: 'Password has been updated successfully.' });
  } catch (err) {
    console.error('[Doctor Password] change error:', err);
    res.status(500).json({ success: false, error: 'Could not change password.' });
  }
});

const RECORD_CATEGORIES = ['LAB_REPORT', 'PRESCRIPTION', 'IMAGING', 'DISCHARGE_SUMMARY', 'OTHER'] as const;
const VITAL_TYPES = ['BLOOD_SUGAR_FASTING', 'BP_SYSTOLIC', 'BP_DIASTOLIC', 'CHOLESTEROL_TOTAL', 'HEART_RATE', 'WEIGHT'] as const;
const recordsQuery = z.object({ profileId: z.string().min(1) });
async function recordsProfile(req: Request, res: Response, requested?: unknown) {
  const session = getSession(req.cookies[SESSION_COOKIE_NAME]);
  if (!session) { res.status(401).json({ error: 'Authentication required.' }); return null; }
  const parsed = recordsQuery.safeParse({ profileId: requested ?? req.query.profileId });
  if (!parsed.success) { res.status(400).json({ error: 'A valid profileId is required.' }); return null; }
  const relation: Record<string, string> = { me: 'SELF', mother: 'MOTHER', son: 'SON' };
  const alias = relation[parsed.data.profileId];
  const profile = alias ? await prisma.profile.findFirst({ where: { user_id: session.user.id, relation: alias }, select: { id: true } }) : { id: parsed.data.profileId };
  const access = profile && await prisma.profileAccess.findFirst({ where: { profile_id: profile.id, user_id: session.user.id }, select: { profile_id: true, user_id: true } });
  if (!canAccessProfile(access, session.user.id)) { res.status(403).json({ error: 'You do not have access to this profile.' }); return null; }
  return { id: access!.profile_id, userId: session.user.id };
}
const mimeLabel = (mime: string) => mime === 'application/pdf' ? 'PDF' : mime === 'image/jpeg' ? 'JPG' : mime === 'image/png' ? 'PNG' : 'FILE';
app.get('/api/patient/records/vitals', async (req, res) => {
  const input = z.object({ profileId: z.string().min(1), range: z.enum(['30d', '90d', '1y']).default('30d') }).safeParse(req.query);
  if (!input.success) { res.status(400).json({ error: 'Invalid vital range.' }); return; }
  try {
    const profile = await recordsProfile(req, res); if (!profile) return;
    const rows = await prisma.vitalReading.findMany({ where: { patient_id: profile.id, measured_at: { gte: vitalRangeStart(input.data.range) } }, orderBy: { measured_at: 'asc' } });
    const types = [...VITAL_TYPES].filter((type) => type !== 'BP_DIASTOLIC'); const vitals: Record<string, any> = {};
    for (const type of types) {
      if (type === 'BP_SYSTOLIC') {
        const sys = rows.filter((row: any) => row.type === 'BP_SYSTOLIC'); const dia = rows.filter((row: any) => row.type === 'BP_DIASTOLIC');
        const points = sys.map((row: any) => { const pair = dia.reduce((best: any, candidate: any) => Math.abs(new Date(candidate.measured_at).getTime() - new Date(row.measured_at).getTime()) < Math.abs(new Date(best?.measured_at || 0).getTime() - new Date(row.measured_at).getTime()) ? candidate : best, null); return { measuredAt: row.measured_at, systolic: row.value, diastolic: pair && Math.abs(new Date(pair.measured_at).getTime() - new Date(row.measured_at).getTime()) < 60000 ? pair.value : null, unit: row.unit }; });
        const latest = [...points].reverse().find((point) => point.diastolic != null); vitals.BLOOD_PRESSURE = { latest: latest ? { systolic: latest.systolic, diastolic: latest.diastolic, unit: latest.unit, measuredAt: latest.measuredAt } : null, points }; continue;
      }
      const series = rows.filter((row: any) => row.type === type).map((row: any) => ({ value: row.value, unit: row.unit, measuredAt: row.measured_at }));
      vitals[type] = { latest: series.at(-1) || null, points: series };
    }
    res.json({ vitals });
  } catch (error) { console.error('[Records] vitals failed', error); res.status(500).json({ error: 'Could not load vital readings.' }); }
});
app.get('/api/patient/records/conditions', async (req, res) => {
  try { const profile = await recordsProfile(req, res); if (!profile) return; const [patient, conditions] = await Promise.all([prisma.profile.findFirst({ where: { id: profile.id }, select: { allergies: true } }), prisma.patientCondition.findMany({ where: { patient_id: profile.id }, orderBy: [{ status: 'asc' }, { name: 'asc' }] })]); res.json({ conditions: conditions.map((item: any) => ({ id: item.id, name: item.name, status: item.status, since: item.since })), allergies: patient?.allergies || [] }); }
  catch (error) { console.error('[Records] conditions failed', error); res.status(500).json({ error: 'Could not load conditions.' }); }
});
app.patch('/api/patient/records/conditions', async (req, res) => {
  const input = z.object({ profileId: z.string().min(1), allergies: z.array(z.string().trim().min(1).max(80)).max(30), conditions: z.array(z.object({ name: z.string().trim().min(1).max(100), status: z.enum(['ACTIVE', 'RESOLVED']), since: z.string().date().optional().or(z.literal('')) })).max(50) }).safeParse({ ...req.body, profileId: req.query.profileId || req.body?.profileId });
  if (!input.success) { res.status(400).json({ error: 'Invalid condition details.', details: input.error.flatten() }); return; }
  try { const profile = await recordsProfile(req, res); if (!profile) return; await prisma.profile.update({ where: { id: profile.id }, data: { allergies: [...new Set(input.data.allergies.map((allergy) => allergy.trim()).filter(Boolean))] } }); await prisma.patientCondition.deleteMany({ where: { patient_id: profile.id } }); for (const condition of input.data.conditions) await prisma.patientCondition.create({ data: { patient_id: profile.id, name: condition.name, status: condition.status, since: condition.since ? new Date(condition.since) : null } }); res.json({ success: true }); }
  catch (error) { console.error('[Records] condition update failed', error); res.status(500).json({ error: 'Could not save condition details.' }); }
});
app.get('/api/patient/records', async (req, res) => {
  const input = z.object({ profileId: z.string().min(1), category: z.enum(['ALL', ...RECORD_CATEGORIES]).default('ALL'), q: z.string().max(120).default(''), from: z.string().date().optional(), to: z.string().date().optional(), page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(50).default(8) }).safeParse(req.query);
  if (!input.success) { res.status(400).json({ error: 'Invalid records query.', details: input.error.flatten() }); return; }
  try {
    const profile = await recordsProfile(req, res); if (!profile) return;
    const where: any = { patient_id: profile.id, deleted_at: null };
    const selectedCategory = recordCategoryFilter(input.data.category); if (selectedCategory) where.category = selectedCategory;
    if (input.data.q.trim()) where.OR = [{ title: { contains: input.data.q.trim(), mode: 'insensitive' } }, { issuer: { contains: input.data.q.trim(), mode: 'insensitive' } }];
    if (input.data.from || input.data.to) where.record_date = { ...(input.data.from ? { gte: new Date(`${input.data.from}T00:00:00`) } : {}), ...(input.data.to ? { lte: new Date(`${input.data.to}T23:59:59.999`) } : {}) };
    const [rows, total] = await Promise.all([prisma.healthRecord.findMany({ where, include: { doctor: { include: { user: { select: { full_name: true } } } } }, orderBy: { record_date: 'desc' }, skip: (input.data.page - 1) * input.data.pageSize, take: input.data.pageSize }), prisma.healthRecord.count({ where })]);
    res.json({ records: rows.map((row: any) => ({ id: row.id, title: row.title, issuer: row.issuer, recordDate: row.record_date, category: row.category, fileType: mimeLabel(row.mime_type), mimeType: row.mime_type, fileName: row.file_name, source: row.source, doctor: row.doctor ? { name: row.doctor.user.full_name, photoUrl: row.doctor.photo_url } : null })), page: input.data.page, pageSize: input.data.pageSize, total, hasMore: input.data.page * input.data.pageSize < total });
  } catch (error) { console.error('[Records] list failed', error); res.status(500).json({ error: 'Could not load health records.' }); }
});
app.get('/api/patient/records/access-history', async (req, res) => {
  const input = z.object({ profileId: z.string().min(1), limit: z.coerce.number().int().min(1).max(50).default(10), cursor: z.string().optional() }).safeParse(req.query);
  if (!input.success) { res.status(400).json({ error: 'Invalid access history query.' }); return; }
  try { const profile = await recordsProfile(req, res); if (!profile) return; const rows = await prisma.accessLog.findMany({ where: { patient_id: profile.id }, include: { doctor: { include: { user: { select: { full_name: true } } } } }, orderBy: { created_at: 'desc' }, take: input.data.limit, ...(input.data.cursor ? { skip: 1, cursor: { id: input.data.cursor } } : {}) }); res.json({ entries: rows.map((row: any) => ({ id: row.id, doctor: { name: row.doctor.user.full_name, photoUrl: row.doctor.photo_url }, action: row.action, recordTitle: row.record_title, createdAt: row.created_at })) }); }
  catch (error) { console.error('[Records] access history failed', error); res.status(500).json({ error: 'Could not load access history.' }); }
});
app.get('/api/patient/records/:id/file', async (req, res) => {
  const input = z.object({ profileId: z.string().min(1), disposition: z.enum(['inline', 'attachment']).default('inline') }).safeParse(req.query);
  if (!input.success) { res.status(400).json({ error: 'Invalid file request.' }); return; }
  try { const profile = await recordsProfile(req, res); if (!profile) return; const row = await prisma.healthRecord.findFirst({ where: { id: String(req.params.id), patient_id: profile.id, deleted_at: null } }); if (!row) { res.status(404).json({ error: 'Record not found.' }); return; } res.setHeader('Content-Type', row.mime_type); res.setHeader('Content-Disposition', `${input.data.disposition}; filename*=UTF-8''${encodeURIComponent(row.file_name)}`); res.setHeader('Cache-Control', 'private, no-store'); res.sendFile(recordPath(row.file_key), (error) => { if (error && !res.headersSent) res.status(404).json({ error: 'Record file is unavailable.' }); }); }
  catch (error) { console.error('[Records] file access failed', error); if (!res.headersSent) res.status(500).json({ error: 'Could not open this record.' }); }
});
app.post('/api/patient/records', async (req, res) => {
  const session = getSession(req.cookies[SESSION_COOKIE_NAME]); if (!session) { res.status(401).json({ error: 'Authentication required.' }); return; }
  let storedKey: string | null = null;
  try {
    const multipart = await readRecordMultipart(req); const input = z.object({ profileId: z.string().min(1), title: z.string().trim().min(1).max(160), category: z.enum(RECORD_CATEGORIES), issuer: z.string().trim().min(1).max(160), recordDate: z.string().date(), doctorName: z.string().max(120).optional() }).safeParse(multipart.fields);
    if (!input.success) { res.status(400).json({ error: 'Complete the record details.', details: input.error.flatten() }); return; }
    if (!multipart.file.bytes.length || multipart.file.bytes.length > 10 * 1024 * 1024) { res.status(400).json({ error: 'Record file must be between 1 byte and 10 MB.' }); return; }
    const detected = detectRecordMime(multipart.file.bytes); if (!detected) { res.status(415).json({ error: 'Only genuine PDF, JPG, or PNG files are accepted.' }); return; }
    const profile = await recordsProfile(req, res, input.data.profileId); if (!profile) return;
    const safeName = Array.from(path.basename(multipart.file.filename)).filter((character) => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127).join('').slice(0, 180);
    const fileName = `${path.parse(safeName).name || 'health-record'}.${detected.extension}`;
    let doctorId: string | null = null;
    if (input.data.doctorName?.trim()) {
      const doctors = await prisma.doctorProfile.findMany({ where: { status: 'approved' }, include: { user: { select: { full_name: true } } } });
      const doctor = doctors.find((candidate: any) => candidate.user.full_name.toLocaleLowerCase() === input.data.doctorName!.trim().toLocaleLowerCase());
      if (!doctor) { res.status(400).json({ error: 'That doctor was not found. Clear the doctor name or choose a listed doctor.' }); return; }
      doctorId = doctor.id;
    }
    storedKey = await storeRecord(multipart.file.bytes, detected.extension);
    const record = await prisma.healthRecord.create({ data: { patient_id: profile.id, category: input.data.category, title: input.data.title, issuer: input.data.issuer, record_date: new Date(`${input.data.recordDate}T12:00:00`), doctor_id: doctorId, uploaded_by: session.user.id, source: 'PATIENT_UPLOAD', file_key: storedKey, file_name: fileName, mime_type: detected.mimeType, size_bytes: multipart.file.bytes.length } });
    res.status(201).json({ success: true, id: record.id });
  } catch (error: any) { if (storedKey) await removeRecord(storedKey).catch(() => undefined); const status = /10 MB|multipart|Choose|Upload one/.test(error?.message || '') ? 400 : 500; res.status(status).json({ error: error?.message || 'Could not upload this record.' }); }
});
app.delete('/api/patient/records/:id', async (req, res) => {
  const input = recordsQuery.safeParse(req.query); if (!input.success) { res.status(400).json({ error: 'A valid profileId is required.' }); return; }
  try { const profile = await recordsProfile(req, res); if (!profile) return; const row = await prisma.healthRecord.findFirst({ where: { id: String(req.params.id), patient_id: profile.id, deleted_at: null } }); if (!row) { res.status(404).json({ error: 'Record not found.' }); return; } if (row.source !== 'PATIENT_UPLOAD') { res.status(403).json({ error: 'Doctor-written records cannot be removed.' }); return; } await prisma.healthRecord.update({ where: { id: row.id }, data: { deleted_at: new Date() } }); res.json({ success: true }); }
  catch (error) { console.error('[Records] delete failed', error); res.status(500).json({ error: 'Could not remove this record.' }); }
});
app.post('/api/patient/records/vitals', async (req, res) => {
  const input = z.object({ profileId: z.string().min(1), type: z.enum(VITAL_TYPES), value: z.number().finite().optional(), systolic: z.number().finite().optional(), diastolic: z.number().finite().optional(), measuredAt: z.string().datetime().optional() }).safeParse({ ...req.body, profileId: req.query.profileId || req.body?.profileId });
  if (!input.success) { res.status(400).json({ error: 'Invalid vital reading.', details: input.error.flatten() }); return; }
  const ranges: Record<string, [number, number, string]> = { BLOOD_SUGAR_FASTING: [20, 600, 'mg/dL'], BP_SYSTOLIC: [50, 300, 'mmHg'], CHOLESTEROL_TOTAL: [50, 1000, 'mg/dL'], HEART_RATE: [20, 250, 'bpm'], WEIGHT: [1, 500, 'kg'] };
  const readingAt = input.data.measuredAt ? new Date(input.data.measuredAt) : new Date(); if (readingAt.getTime() > Date.now() + 300000) { res.status(400).json({ error: 'Measurement date cannot be in the future.' }); return; }
  try { const profile = await recordsProfile(req, res); if (!profile) return; const data: any[] = []; if (input.data.type === 'BP_SYSTOLIC') { if (input.data.systolic == null || input.data.diastolic == null || input.data.systolic < 50 || input.data.systolic > 300 || input.data.diastolic < 30 || input.data.diastolic > 200) { res.status(400).json({ error: 'Enter blood pressure between 50–300 / 30–200 mmHg.' }); return; } data.push({ patient_id: profile.id, type: 'BP_SYSTOLIC', value: input.data.systolic, unit: 'mmHg', measured_at: readingAt, source: 'SELF' }, { patient_id: profile.id, type: 'BP_DIASTOLIC', value: input.data.diastolic, unit: 'mmHg', measured_at: readingAt, source: 'SELF' }); } else { const config = ranges[input.data.type]; if (input.data.value == null || input.data.value < config[0] || input.data.value > config[1]) { res.status(400).json({ error: `Value must be from ${config[0]} to ${config[1]} ${config[2]}.` }); return; } data.push({ patient_id: profile.id, type: input.data.type, value: input.data.value, unit: config[2], measured_at: readingAt, source: 'SELF' }); } for (const row of data) await prisma.vitalReading.create({ data: row }); res.status(201).json({ success: true }); }
  catch (error) { console.error('[Records] vital save failed', error); res.status(500).json({ error: 'Could not save this reading.' }); }
});

export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[ArogyaNexus] Local Auth Server listening on http://localhost:${PORT}`);
  });
}
