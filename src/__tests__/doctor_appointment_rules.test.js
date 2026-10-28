import { describe, expect, it } from 'vitest';
import { canTransition } from '../features/doctor/appointmentRules';
import { auditLog, appointmentStore, requestRecordAccess, sendMissedVisitAlert, updateAppointmentStatus } from '../api/doctorAppointments';

describe('doctor appointment transitions', () => {
  it('allows only transitions from the shared rules table', () => {
    expect(canTransition('REQUESTED', 'CONFIRMED')).toBe(true);
    expect(canTransition('MISSED', 'NO_SHOW')).toBe(true);
    expect(canTransition('MISSED', 'COMPLETED')).toBe(false);
    expect(canTransition('COMPLETED', 'CONFIRMED')).toBe(false);
  });

  it('rejects invalid status changes and audits successful mutations', async () => {
    const before = auditLog.length;
    const invalid = await updateAppointmentStatus('a6', 'CONFIRMED');
    expect(invalid.code).toBe('INVALID_TRANSITION');
    const updated = await updateAppointmentStatus('a3', 'IN_CONSULTATION');
    expect(updated.status).toBe('IN_CONSULTATION');
    expect(auditLog.length).toBe(before + 1);
  });

  it('sends a missed visit alert once and queues a record consent request', async () => {
    const missed = await sendMissedVisitAlert('a4');
    expect(missed.missedAlertSentAt).toBeTruthy();
    expect((await sendMissedVisitAlert('a4')).code).toBe('ALREADY_SENT');
    const requested = await requestRecordAccess('a2');
    expect(requested.consent.status).toBe('PENDING');
    expect(appointmentStore.find((item) => item.id === 'a2').consent.scope).toEqual(['VIEW_SUMMARY', 'VIEW_HISTORY']);
  });
});
