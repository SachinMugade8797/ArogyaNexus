export function getConsentCountdown(expiresAt, now = Date.now()) {
  const ms = new Date(expiresAt).getTime() - now;
  if (!Number.isFinite(ms) || ms <= 0) return { expired: true, text: 'Expired' };
  const minutes = Math.floor(ms / 60000);
  const days = Math.floor(minutes / 1440); const hours = Math.floor((minutes % 1440) / 60); const remainder = minutes % 60;
  return { expired: false, text: days ? `Expires in ${days}d ${hours}h` : `Expires in ${hours}h ${remainder}m` };
}
export function transitionConsent(consent, status, { now = Date.now(), durationHours = 24, reason = null } = {}) {
  if (!['PENDING','ACTIVE','EXPIRED','REVOKED','DENIED'].includes(status)) throw new Error('Invalid consent status.');
  const at = new Date(now).toISOString();
  return { ...consent, status, startsAt: status === 'ACTIVE' ? at : consent.startsAt, expiresAt: status === 'ACTIVE' ? new Date(now + durationHours * 3600000).toISOString() : consent.expiresAt, endedAt: ['EXPIRED','REVOKED','DENIED'].includes(status) ? at : null, endedReason: ['EXPIRED','REVOKED','DENIED'].includes(status) ? reason || status.toLowerCase() : null };
}
export function calculateAdherence(logs = []) { const eligible = logs.filter((x) => x.status === 'TAKEN' || x.status === 'MISSED'); return eligible.length ? Math.round(eligible.filter((x) => x.status === 'TAKEN').length / eligible.length * 100) : 0; }
export function validateDocumentFile(file) { if (!file) return 'Choose a file.'; const accepted = ['application/pdf','image/jpeg','image/png']; if (!accepted.includes(file.type)) return 'Use a PDF, JPG, or PNG file.'; if (file.size > 10 * 1024 * 1024) return 'File must be 10 MB or smaller.'; return ''; }
export function csvCell(value) { let text = String(value ?? ''); if (/^[=+\-@]/.test(text)) text = `'${text}`; return `"${text.replaceAll('"','""')}"`; }
