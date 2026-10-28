import { getFamilyMock, removeFamilyMock, saveFamilyMock } from '../mocks/family';
const wait = () => new Promise((resolve) => window.setTimeout(resolve, 400));
const mode = () => new URLSearchParams(window.location.search).get('mock');
export async function getFamily(ownerId) { await wait(); if (mode() === 'error') throw new Error('Could not load family profiles.'); if (mode() === 'empty') return []; return getFamilyMock(ownerId); }
export async function saveFamilyMember(ownerId, member) { await wait(); if (mode() === 'error') throw new Error('Could not save this profile.'); return saveFamilyMock(ownerId, member); }
export async function deleteFamilyMember(ownerId, memberId) { await wait(); if (mode() === 'error') throw new Error('Could not remove this profile.'); removeFamilyMock(ownerId, memberId); }
