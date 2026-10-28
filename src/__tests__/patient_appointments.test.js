import { describe, expect, it } from 'vitest';
import { appointmentTabMatches, canJoinVideo } from '../utils/appointmentDates';
import { canAccessProfile } from '../../lib/auth/profileAccess';

const now = new Date('2026-10-28T10:00:00Z').getTime();
describe('appointment date rules', () => {
  it('allows video joining from ten minutes before start through end', () => {
    const slot = { mode: 'VIDEO', status: 'CONFIRMED', startsAt: new Date(now + 600000), endsAt: new Date(now + 2400000) };
    expect(canJoinVideo(slot, now)).toBe(true);
    expect(canJoinVideo(slot, now - 1)).toBe(false);
    expect(canJoinVideo(slot, now + 2400001)).toBe(false);
  });
  it('splits upcoming, past, and cancelled by status and time', () => {
    expect(appointmentTabMatches({ status: 'PENDING', startsAt: new Date(now + 1) }, 'upcoming', now)).toBe(true);
    expect(appointmentTabMatches({ status: 'CONFIRMED', startsAt: new Date(now - 1) }, 'upcoming', now)).toBe(false);
    expect(appointmentTabMatches({ status: 'CONFIRMED', startsAt: new Date(now - 1) }, 'past', now)).toBe(true);
    expect(appointmentTabMatches({ status: 'CANCELLED', startsAt: new Date(now + 1) }, 'cancelled', now)).toBe(true);
  });
});
describe('profile access rule', () => {
  it('only accepts an access row owned by the logged-in user', () => {
    expect(canAccessProfile({ user_id: 'user-1' }, 'user-1')).toBe(true);
    expect(canAccessProfile({ user_id: 'user-2' }, 'user-1')).toBe(false);
    expect(canAccessProfile(null, 'user-1')).toBe(false);
  });
});
