export function getConsentDaysRemaining(lastViewedAt, now = Date.now()) {
  if (!lastViewedAt) return null;
  return Math.max(0, 30 - Math.floor((now - new Date(lastViewedAt).getTime()) / 86400000));
}
