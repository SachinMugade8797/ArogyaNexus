const zone = 'Asia/Kolkata';
const dateKey = (date) => new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
const dayLabel = new Intl.DateTimeFormat('en-IN', { timeZone: zone, weekday: 'long', day: 'numeric', month: 'short' });
const timeLabel = new Intl.DateTimeFormat('en-IN', { timeZone: zone, hour: 'numeric', minute: '2-digit' });
const fullLabel = new Intl.DateTimeFormat('en-IN', { timeZone: zone, dateStyle: 'full', timeStyle: 'short' });
export function formatRelativeDate(value, now = new Date()) {
  if (!value) return { label: 'Date to be confirmed', title: '' };
  const date = new Date(value);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const key = dateKey(date);
  const relative = key === dateKey(now) ? 'Today' : key === dateKey(tomorrow) ? 'Tomorrow' : dayLabel.format(date);
  return { label: `${relative}, ${timeLabel.format(date)}`, title: fullLabel.format(date), dateTime: date.toISOString() };
}
export function formatPatientDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return value ? new Intl.DateTimeFormat('en-IN', { timeZone: zone, ...options }).format(new Date(value)) : '—';
}
