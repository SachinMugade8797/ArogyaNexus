import { getDoctorMock, getDoctorsMock, mockAvailability } from '../mocks/doctors';

function mockMode() {
  return new URLSearchParams(window.location.search).get('mock');
}

function delay() {
  return new Promise((resolve) => window.setTimeout(resolve, 400));
}

export async function getDoctors(profileId, filters = {}) {
  await delay();
  void profileId;
  if (mockMode() === 'error') throw new Error('We couldn’t load doctors. Please try again.');
  if (mockMode() === 'empty') return [];
  return getDoctorsMock(filters);
}

export async function getDoctorById(doctorId, profileId) {
  await delay();
  void profileId;
  if (mockMode() === 'error') throw new Error('We couldn’t load this doctor profile. Please try again.');
  if (mockMode() === 'empty') return null;
  return getDoctorMock(doctorId);
}

export async function getDoctorAvailability(doctorId, profileId) {
  await delay();
  void profileId;
  if (mockMode() === 'error') throw new Error('We couldn’t load available appointment times. Please try again.');
  if (mockMode() === 'empty') return [];
  const slots = mockAvailability[doctorId] || [];
  const days = [];
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  while (days.length < 5) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() === 0) continue;
    const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    days.push({ date: isoDate, label: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }), slots });
  }
  return days;
}

export async function createAppointmentRequest(appointment) {
  await delay();
  if (mockMode() === 'error') throw new Error('Your appointment request could not be sent. Please try again.');
  return {
    id: `appointment-${Date.now()}`,
    patient_id: appointment.patient_id,
    doctor_profile_id: appointment.doctor_profile_id,
    appointment_at: appointment.appointment_at,
    reason: appointment.reason || null,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
}
