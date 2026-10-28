import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { registerPatientService } from '../services/auth/register-patient';
import { registerDoctorService } from '../services/auth/register-doctor';
import { loginService } from '../services/auth/login';
import { logoutService } from '../services/auth/logout';
import { createSession, getSession, SESSION_COOKIE_NAME } from '../lib/auth/session';
import { prisma } from '../lib/db/prisma';
import { z } from 'zod';
import { canAccessProfile } from '../lib/auth/profileAccess';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const PUBLIC_CITIES = ['Kolhapur', 'Pune', 'Mumbai', 'Bengaluru', 'Nashik', 'Sangli', 'Satara'];

function toPublicDoctor(profile: any) {
  const address = String(profile.clinic_address || '');
  const city = PUBLIC_CITIES.find((name) => new RegExp(`\\b${name}\\b`, 'i').test(address)) || null;
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
    qualification: null,
    experienceYears: null,
    rating: null,
    reviewCount: 0,
    availability: [],
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
        clinic_name: true,
        clinic_address: true,
        consultation_fee: true,
        status: true,
        user: { select: { full_name: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    const query = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const speciality = typeof req.query.speciality === 'string' ? req.query.speciality.trim().toLowerCase() : '';
    const city = typeof req.query.city === 'string' ? req.query.city.trim().toLowerCase() : '';
    const doctors = profiles
      .map(toPublicDoctor)
      .filter((doctor) => !city || doctor.city?.toLowerCase() === city)
      .filter((doctor) => !speciality || doctor.speciality.toLowerCase() === speciality)
      .filter((doctor) => !query || `${doctor.name} ${doctor.speciality} ${doctor.clinic} ${doctor.city || ''}`.toLowerCase().includes(query));
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
        clinic_name: true,
        clinic_address: true,
        consultation_fee: true,
        status: true,
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
  const session = getSession(req.cookies[SESSION_COOKIE_NAME]);
  if (!session) {
    res.status(401).json({ success: false, error: 'Please log in as a patient to request an appointment.' });
    return;
  }
  if (session.user.role !== 'patient') {
    res.status(403).json({ success: false, error: 'Only patient accounts can book appointments.' });
    return;
  }

  const { doctorId, appointmentAt, reason } = req.body as { doctorId?: string; appointmentAt?: string; reason?: string };
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
    const appointment = await (prisma as any).appointment.create({
      data: {
        patient_id: session.user.id,
        doctor_profile_id: doctor.id,
        appointment_at: parsedDate,
        reason: reason?.trim() || null,
      },
    });
    res.status(201).json({ success: true, appointment: { id: appointment.id, appointmentAt: appointment.appointment_at, status: appointment.status } });
  } catch (err) {
    console.error('[Appointments] Could not create appointment request:', err);
    res.status(500).json({ success: false, error: 'Could not create the appointment request.' });
  }
});

const profileQuery = z.object({ profileId: z.string().min(1) });
const tabQuery = z.object({ profileId: z.string().min(1), tab: z.enum(['upcoming', 'past', 'cancelled']).default('upcoming') });
async function appointmentProfile(req: Request, res: Response) {
  const session = getSession(req.cookies[SESSION_COOKIE_NAME]);
  if (!session) { res.status(401).json({ error: 'Authentication required.' }); return null; }
  const parsed = profileQuery.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: 'A valid profileId is required.', details: parsed.error.flatten() }); return null; }
  const aliases: Record<string, string> = { me: 'SELF', mother: 'MOTHER', son: 'SON' };
  const requested = parsed.data.profileId;
  const resolved = aliases[requested] ? await prisma.profile.findFirst({ where: { user_id: session.user.id, relation: aliases[requested] }, select: { id: true } }) : { id: requested };
  const access = resolved && await prisma.profileAccess.findFirst({ where: { profile_id: resolved.id, user_id: session.user.id }, select: { user_id: true, profile_id: true } });
  if (!canAccessProfile(access, session.user.id)) { res.status(403).json({ error: 'You do not have access to this profile.' }); return null; }
  return access!.profile_id;
}
function appointmentDto(item: any) {
  const start = new Date(item.appointment_at);
  const end = new Date(item.ends_at || start.getTime() + 30 * 60000);
  const status = String(item.status).toUpperCase();
  return { id: item.id, status, mode: item.mode, startsAt: start, endsAt: end, reason: item.reason, createdAt: item.created_at, doctor: { id: item.doctor.id, name: /^dr\.?\s/i.test(item.doctor.user.full_name) ? item.doctor.user.full_name : `Dr. ${item.doctor.user.full_name}`, specialty: item.doctor.speciality, photoUrl: item.doctor.photo_url }, clinic: { name: item.doctor.clinic_name, address: item.doctor.clinic_address, city: PUBLIC_CITIES.find((city) => item.doctor.clinic_address.toLowerCase().includes(city.toLowerCase())) || '', lat: item.doctor.clinic_lat, lng: item.doctor.clinic_lng }, canJoinVideo: item.mode === 'VIDEO' && status === 'CONFIRMED' && Date.now() >= start.getTime() - 600000 && Date.now() <= end.getTime(), hasPrescription: Boolean(item.visit_record?.prescription_file_key), hasReport: Boolean(item.visit_record?.report_file_key) };
}
const appointmentInclude = { doctor: { include: { user: { select: { full_name: true } } } }, visit_record: true };
app.get('/api/patient/appointments', async (req, res) => {
  try {
    const parsed = tabQuery.safeParse(req.query);
    if (!parsed.success) { res.status(400).json({ error: 'Invalid appointment query.', details: parsed.error.flatten() }); return; }
    const profileId = await appointmentProfile(req, res); if (!profileId) return;
    const now = new Date();
    const where: any = { profile_id: profileId };
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
  try { const profileId = await appointmentProfile(req, res); if (!profileId) return; const [year, month] = input.data.month.split('-').map(Number); const rows = await prisma.appointment.findMany({ where: { profile_id: profileId, appointment_at: { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) } }, select: { appointment_at: true, status: true } }); const groups = new Map<string, any>(); for (const row of rows) { const date = new Date(row.appointment_at).toISOString().slice(0, 10); const old = groups.get(date) || { date, count: 0, status: 'CANCELLED' }; old.count++; const rank: any = { CONFIRMED: 4, confirmed: 4, PENDING: 3, pending: 3, COMPLETED: 2, completed: 2, CANCELLED: 1, cancelled: 1 }; if ((rank[row.status] || 0) > (rank[old.status] || 0)) old.status = String(row.status).toUpperCase(); groups.set(date, old); } res.json({ dates: [...groups.values()] }); } catch (error) { console.error(error); res.status(500).json({ error: 'Could not load calendar.' }); }
});
app.get('/api/patient/appointments/past-summary', async (req, res) => {
  const input = z.object({ profileId: z.string().min(1), limit: z.coerce.number().int().min(1).max(20).default(5) }).safeParse(req.query);
  if (!input.success) { res.status(400).json({ error: 'Invalid past summary query.' }); return; }
  try { const profileId = await appointmentProfile(req, res); if (!profileId) return; const rows = await prisma.appointment.findMany({ where: { profile_id: profileId, status: { in: ['completed', 'COMPLETED'] } }, include: appointmentInclude, orderBy: { appointment_at: 'desc' }, take: input.data.limit }); res.json({ visits: rows.map((row: any) => ({ ...appointmentDto(row), date: row.appointment_at, prescriptionUrl: row.visit_record?.prescription_file_key ? `/api/patient/documents/${encodeURIComponent(row.visit_record.prescription_file_key)}` : null, reportUrl: row.visit_record?.report_file_key ? `/api/patient/documents/${encodeURIComponent(row.visit_record.report_file_key)}` : null })) }); } catch (error) { console.error(error); res.status(500).json({ error: 'Could not load past visits.' }); }
});
app.patch('/api/patient/appointments/:id/cancel', async (req, res) => {
  const input = z.object({ profileId: z.string().min(1), reason: z.string().trim().min(1).max(500) }).safeParse({ ...req.body, profileId: req.query.profileId || req.body?.profileId });
  if (!input.success) { res.status(400).json({ error: 'A cancellation reason is required.', details: input.error.flatten() }); return; }
  try { const profileId = await appointmentProfile(req, res); if (!profileId) return; const id = String(req.params.id); const row = await prisma.appointment.findFirst({ where: { id, profile_id: profileId } }); if (!row) { res.status(404).json({ error: 'Appointment not found.' }); return; } if (!['pending', 'confirmed', 'PENDING', 'CONFIRMED'].includes(row.status) || new Date(row.appointment_at) <= new Date()) { res.status(409).json({ error: 'This appointment can no longer be cancelled.' }); return; } await prisma.appointment.update({ where: { id }, data: { status: 'CANCELLED', cancel_reason: input.data.reason } }); res.json({ success: true }); } catch (error) { console.error(error); res.status(500).json({ error: 'Could not cancel appointment.' }); }
});
app.patch('/api/patient/appointments/:id', async (req, res) => {
  const input = z.object({ profileId: z.string().min(1), reason: z.string().max(500).optional(), notes: z.string().max(1000).optional() }).safeParse({ ...req.body, profileId: req.query.profileId || req.body?.profileId });
  if (!input.success) { res.status(400).json({ error: 'Invalid appointment update.', details: input.error.flatten() }); return; }
  try { const profileId = await appointmentProfile(req, res); if (!profileId) return; const id = String(req.params.id); const row = await prisma.appointment.findFirst({ where: { id, profile_id: profileId } }); if (!row) { res.status(404).json({ error: 'Appointment not found.' }); return; } const data: any = {}; if (input.data.reason !== undefined) data.reason = input.data.reason; if (input.data.notes !== undefined) data.notes = input.data.notes; const updated = await prisma.appointment.update({ where: { id }, data }); res.json({ success: true, id: updated.id }); } catch (error) { console.error(error); res.status(500).json({ error: 'Could not update appointment.' }); }
});

export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[ArogyaNexus] Local Auth Server listening on http://localhost:${PORT}`);
  });
}
