import { doctorAppointments } from '../mocks/doctorAppointments';

export async function getDoctorAppointments({ tab = 'today', q = '', filter = 'All' } = {}) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const params = new URLSearchParams(globalThis.window?.location?.search || '');
  if (params.get('mock') === 'error') throw new Error('Could not load appointments.');
  if (params.get('mock') === 'empty') return [];
  const now = new Date();
  const todayKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);
  const visible = doctorAppointments.filter((appointment) => {
    const dateKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(appointment.startsAt));
    if (tab === 'today' && (dateKey !== todayKey || appointment.status === 'CANCELLED')) return false;
    if (tab === 'upcoming' && (dateKey === todayKey || appointment.status === 'REQUESTED' || appointment.status === 'CANCELLED')) return false;
    if (tab === 'requests' && appointment.status !== 'REQUESTED') return false;
    if (filter !== 'All' && !`${appointment.mode} ${appointment.status}`.toLowerCase().includes(filter.toLowerCase().replace('in-person', 'in_person').replace('video call', 'video'))) return false;
    return `${appointment.patient.name} ${appointment.reason} ${appointment.status} ${appointment.mode}`.toLowerCase().includes(q.toLowerCase());
  });
  visible.sort((a, b) => tab === 'requests' ? new Date(a.createdAt) - new Date(b.createdAt) : tab === 'today' ? (a.status === 'WAITING' ? -1 : b.status === 'WAITING' ? 1 : a.tokenNumber - b.tokenNumber) : new Date(a.startsAt) - new Date(b.startsAt));
  return visible;
}
