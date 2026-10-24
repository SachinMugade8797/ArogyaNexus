/**
 * AROGYANEXUS Frontend Authentication Service
 * Connects frontend forms to Local PostgreSQL backend API (/api/auth/...)
 */

export function getRedirectPathForUser(user) {
  if (!user) return '/login';

  switch (user.role) {
    case 'patient':
      return '/login'; // Dashboards not implemented in this phase

    case 'admin':
      return '/login'; // Dashboards not implemented in this phase

    case 'doctor':
      return '/login';

    default:
      return '/login';
  }
}

/**
 * Register Patient via Local Server API
 */
export async function registerPatient({ fullName, email, phoneNumber, password, confirmPassword }) {
  const response = await fetch('/api/auth/register/patient', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      fullName,
      email,
      phoneNumber,
      password,
      confirmPassword,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Patient registration failed.');
  }

  return data;
}

/**
 * Register Doctor via Local Server API
 */
export async function registerDoctor({
  fullName,
  email,
  phoneNumber,
  medicalSpeciality,
  registrationNumber,
  clinicName,
  clinicAddress,
  consultationFee,
  password,
  confirmPassword,
}) {
  const response = await fetch('/api/auth/register/doctor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      fullName,
      email,
      phoneNumber,
      medicalSpeciality,
      registrationNumber,
      clinicName,
      clinicAddress,
      consultationFee,
      password,
      confirmPassword,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Doctor registration failed.');
  }

  return data;
}

/**
 * Log in User via Local Server API
 */
export async function loginUser({ email, password }) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Invalid email or password.');
  }

  return data;
}

/**
 * Log out user via Local Server API
 */
export async function logoutUser() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });

  const data = await response.json();
  return data;
}

/**
 * Fetch current authenticated session user
 */
export async function getCurrentUser() {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.user || null;
  } catch {
    return null;
  }
}
