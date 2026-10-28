export function canJoinVideo({ mode, status, startsAt, endsAt }, now = Date.now()) {
  return mode === 'VIDEO' && String(status).toUpperCase() === 'CONFIRMED' && now >= new Date(startsAt).getTime() - 10 * 60_000 && now <= new Date(endsAt).getTime();
}
export function appointmentTabMatches(appointment, tab, now = Date.now()) {
  const status = String(appointment.status).toUpperCase(); const start = new Date(appointment.startsAt).getTime();
  if (tab === 'upcoming') return start >= now && ['PENDING', 'CONFIRMED'].includes(status);
  if (tab === 'past') return status === 'COMPLETED' || (start < now && status !== 'CANCELLED');
  return status === 'CANCELLED';
}
