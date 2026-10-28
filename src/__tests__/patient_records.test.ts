import { describe, expect, it } from 'vitest';
import { vitalRangeStart, recordCategoryFilter } from '../../lib/records/logic';
import { detectRecordMime } from '../../server/multipart';
import { canAccessProfile } from '../../lib/auth/profileAccess';

describe('records data rules', () => {
  it('uses the selected vital range', () => {
    const now = Date.UTC(2026, 9, 28);
    expect(vitalRangeStart('30d', now).getTime()).toBe(now - 30 * 86400000);
    expect(vitalRangeStart('90d', now).getTime()).toBe(now - 90 * 86400000);
    expect(vitalRangeStart('1y', now).getTime()).toBe(now - 365 * 86400000);
  });
  it('keeps category selection scoped', () => {
    expect(recordCategoryFilter('ALL')).toBeUndefined();
    expect(recordCategoryFilter('LAB_REPORT')).toBe('LAB_REPORT');
  });
  it('accepts only supported file signatures', () => {
    expect(detectRecordMime(Buffer.from('%PDF-1.7\n'))?.mimeType).toBe('application/pdf');
    expect(detectRecordMime(Buffer.from([0xff, 0xd8, 0xff, 0x00]))?.mimeType).toBe('image/jpeg');
    expect(detectRecordMime(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))?.mimeType).toBe('image/png');
    expect(detectRecordMime(Buffer.from('not a pdf'))).toBeNull();
  });
  it('denies profile access without a matching access row', () => {
    expect(canAccessProfile({ user_id: 'owner' }, 'owner')).toBe(true);
    expect(canAccessProfile({ user_id: 'other' }, 'owner')).toBe(false);
    expect(canAccessProfile(null, 'owner')).toBe(false);
  });
});
