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

export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[ArogyaNexus] Local Auth Server listening on http://localhost:${PORT}`);
  });
}
