import { listCampsMock, listCampRemindersMock, removeCampReminderMock, saveCampReminderMock } from '../mocks/camps';
const wait = () => new Promise((resolve) => window.setTimeout(resolve, 400));
const mode = () => new URLSearchParams(window.location.search).get('mock');
export async function getCamps(patientId) { await wait(); if (mode() === 'error') throw new Error('Unable to load health camps.'); if (mode() === 'empty') return { camps: [], reminders: [] }; return { camps: listCampsMock(), reminders: listCampRemindersMock(patientId) }; }
export async function saveCampReminder(patientId, reminder) { await wait(); if (mode() === 'error') throw new Error('Could not save this reminder.'); return saveCampReminderMock(patientId, { ...reminder, patientId }); }
export async function deleteCampReminder(patientId, campId) { await wait(); if (mode() === 'error') throw new Error('Could not remove this reminder.'); return removeCampReminderMock(patientId, campId); }
