import { describe, expect, it } from 'vitest';
import { calculateReminderTime, createCampIcs, distanceFiltered, seatsLabel } from '../utils/camps';

describe('camp helpers', () => {
  const startsAt = '2026-11-02T09:00:00+05:30';
  it('calculates each reminder offset and rejects reminders in the past', () => {
    const now = new Date('2026-10-28T00:00:00Z');
    expect(calculateReminderTime(startsAt, 'ONE_DAY', now).toISOString()).toBe('2026-11-01T03:30:00.000Z');
    expect(calculateReminderTime(startsAt, 'MORNING_OF', now).toISOString()).toBe('2026-11-02T02:30:00.000Z');
    expect(calculateReminderTime(startsAt, 'TWO_HOURS', now).toISOString()).toBe('2026-11-02T01:30:00.000Z');
    expect(() => calculateReminderTime(startsAt, 'ONE_DAY', new Date('2026-11-02T00:00:00Z'))).toThrow('already passed');
  });
  it('creates a UTC ICS event with escaped text and event boundaries', () => {
    const ics = createCampIcs({ id: 'eye-1', title: 'Eye, camp', description: 'Bring reports; glasses', startsAt, endsAt: '2026-11-02T13:00:00+05:30', venueName: 'Clinic', address: 'Indiranagar', city: 'Bengaluru' });
    expect(ics).toContain('BEGIN:VCALENDAR\r\nVERSION:2.0');
    expect(ics).toContain('DTSTART:20261102T033000Z');
    expect(ics).toContain('SUMMARY:Eye\\, camp');
    expect(ics).toContain('END:VEVENT\r\nEND:VCALENDAR');
  });
  it('filters camps by Haversine distance and formats seat counts', () => {
    const origin = { lat: 12.9716, lng: 77.5946 };
    expect(distanceFiltered([{ id: 'near', lat: 12.9784, lng: 77.6408 }, { id: 'far', lat: 13.35, lng: 77.7 }], origin, 10).map((item) => item.id)).toEqual(['near']);
    expect(seatsLabel(7)).toEqual({ label: '7 seats left', tone: 'warning' });
    expect(seatsLabel(0).label).toBe('Full');
  });
});
