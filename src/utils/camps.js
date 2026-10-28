const DAY = 24 * 60 * 60 * 1000;

export function haversineKm(from, to) {
  const rad = (value) => (value * Math.PI) / 180;
  const dLat = rad(to.lat - from.lat);
  const dLng = rad(to.lng - from.lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(from.lat)) * Math.cos(rad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateReminderTime(startsAt, offset, now = new Date()) {
  const start = new Date(startsAt);
  let fireAt;
  if (offset === 'ONE_DAY') fireAt = new Date(start.getTime() - DAY);
  else if (offset === 'MORNING_OF') {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(start);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    fireAt = new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), 2, 30)); // 08:00 in Asia/Kolkata
  } else if (offset === 'TWO_HOURS') fireAt = new Date(start.getTime() - 2 * 60 * 60 * 1000);
  else throw new Error('Choose a valid reminder time.');
  if (fireAt <= new Date(now)) throw new Error('That reminder time has already passed.');
  if (fireAt >= start) throw new Error('That reminder would arrive after the camp starts.');
  return fireAt;
}

export function formatIcsDate(value) {
  return new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function createCampIcs(camp) {
  const escape = (value = '') => String(value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ArogyaNexus//Health Camps//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:${escape(camp.id)}@arogyanexus.com`, `DTSTAMP:${formatIcsDate(new Date())}`, `DTSTART:${formatIcsDate(camp.startsAt)}`, `DTEND:${formatIcsDate(camp.endsAt)}`, `SUMMARY:${escape(camp.title)}`, `DESCRIPTION:${escape(camp.description)}`, `LOCATION:${escape(`${camp.venueName}, ${camp.address}, ${camp.city}`)}`, 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n');
}

export function distanceFiltered(camps, origin, maxDistance) {
  return camps.map((camp) => ({ ...camp, distanceKm: haversineKm(origin, camp) })).filter((camp) => camp.distanceKm <= maxDistance);
}

export function seatsLabel(seatsLeft) {
  if (seatsLeft <= 0) return { label: 'Full', tone: 'neutral' };
  if (seatsLeft < 10) return { label: `${seatsLeft} seats left`, tone: 'warning' };
  return { label: `${seatsLeft} seats left`, tone: 'success' };
}
