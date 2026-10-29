const now = new Date();
const today = new Date(now);
today.setHours(0, 0, 0, 0);
const day = (offset, hour, minute = 0) => {
  const date = new Date(today);
  date.setDate(date.getDate() + offset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};
const soon = new Date(Date.now() + 5 * 60000);
const soonEnd = new Date(soon.getTime() + 30 * 60000);
const patient = (id, name, age, gender, photoUrl) => ({ id, name, age, gender, photoUrl });
const consent = (offset = 1) => ({ id: `consent-${offset}`, status: 'ACTIVE', expiresAt: new Date(Date.now() + offset * 3600000).toISOString() });
export const doctorAppointments = [];

