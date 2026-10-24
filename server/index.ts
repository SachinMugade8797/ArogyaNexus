import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { registerPatientService } from '../services/auth/register-patient';
import { registerDoctorService } from '../services/auth/register-doctor';
import { loginService } from '../services/auth/login';
import { logoutService } from '../services/auth/logout';
import { createSession, getSession, SESSION_COOKIE_NAME } from '../lib/auth/session';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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

export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[ArogyaNexus] Local Auth Server listening on http://localhost:${PORT}`);
  });
}
