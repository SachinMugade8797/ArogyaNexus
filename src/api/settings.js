import { getSettingsMock, signOutSessionMock, updateSettingsMock } from '../mocks/settings';
const wait = () => new Promise((resolve) => window.setTimeout(resolve, 400));
const mode = () => new URLSearchParams(window.location.search).get('mock');
export async function getSettings(profileId) { await wait(); if (mode() === 'error') throw new Error('Could not load settings.'); if (mode() === 'empty') return null; return getSettingsMock(profileId); }
export async function saveSettings(profileId, patch) { await wait(); if (mode() === 'error') throw new Error('Could not save settings.'); return updateSettingsMock(profileId, patch); }
export async function signOutSession(profileId, sessionId) { await wait(); if (mode() === 'error') throw new Error('Could not sign out this device.'); return signOutSessionMock(profileId, sessionId); }
