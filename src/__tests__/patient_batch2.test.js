import { describe, expect, it } from 'vitest';
import { calculateAdherence, csvCell, getConsentCountdown, transitionConsent, validateDocumentFile } from '../utils/patientData';
import { getMedicines } from '../api/medicines';

describe('Consent & Access helpers', () => {
  it('counts down and reports expired access', () => {
    const expires = new Date('2026-10-29T10:30:00Z');
    expect(getConsentCountdown(expires, new Date('2026-10-29T09:16:00Z').getTime()).text).toBe('Expires in 1h 14m');
    expect(getConsentCountdown(expires, expires.getTime()).expired).toBe(true);
  });
  it('transitions pending access to active and then expired or revoked', () => {
    const base = { id:'c1', status:'PENDING', startsAt:null, expiresAt:null, endedAt:null };
    const active = transitionConsent(base, 'ACTIVE', { now:0, durationHours:24 });
    expect(active.status).toBe('ACTIVE');
    expect(active.expiresAt).toBe('1970-01-02T00:00:00.000Z');
    expect(transitionConsent(active,'EXPIRED',{now:1000}).endedReason).toBe('expired');
    expect(transitionConsent(active,'REVOKED',{now:1000,reason:'Patient ended access'}).status).toBe('REVOKED');
  });
});

describe('Medicines helpers', () => {
  it('calculates adherence from completed doses only', () => {
    expect(calculateAdherence([{status:'TAKEN'},{status:'TAKEN'},{status:'MISSED'},{status:'PENDING'}])).toBe(67);
    expect(calculateAdherence([{status:'PENDING'}])).toBe(0);
  });
  it('reloads a different profile from its own mock data', async () => {
    window.history.replaceState({}, '', '/patient/medicines');
    const rahul = await getMedicines('me');
    const aarav = await getMedicines('son');
    expect(rahul.active.length).toBeGreaterThan(0);
    expect(aarav.active).toEqual([]);
  });
});

describe('Documents validation and CSV safety', () => {
  it('accepts allowed files up to 10 MB and rejects bad type or size', () => {
    expect(validateDocumentFile({type:'application/pdf',size:10*1024*1024})).toBe('');
    expect(validateDocumentFile({type:'text/plain',size:20})).toMatch(/PDF/);
    expect(validateDocumentFile({type:'image/png',size:10*1024*1024+1})).toMatch(/10 MB/);
  });
  it('quotes and neutralizes formula-like CSV values', () => {
    expect(csvCell('=1+1')).toBe('"\'=1+1"');
    expect(csvCell('A "quoted" note')).toBe('"A ""quoted"" note"');
  });
});
