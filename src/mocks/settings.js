const initial = {
  me: { profile: { name: 'Rahul K.', email: 'rahul.k@example.com', phone: '+91 98765 43210', dob: '1987-04-12', gender: 'Male', bloodGroup: 'O+' }, notifications: { appointments: true, medicines: true, records: false, campaigns: false }, privacy: { shareRecords: true, familyAccess: true, research: false }, sessions: [{ id: 'this-device', device: 'MacBook Pro · Safari', location: 'Bengaluru, India', current: true, lastSeen: 'Active now' }, { id: 'phone', device: 'iPhone · Safari', location: 'Bengaluru, India', current: false, lastSeen: 'Yesterday' }], twoFactor: false },
  mother: { profile: { name: 'Sunita K.', email: 'sunita.k@example.com', phone: '+91 98765 43211', dob: '1962-08-21', gender: 'Female', bloodGroup: 'B+' }, notifications: { appointments: true, medicines: true, records: true, campaigns: false }, privacy: { shareRecords: true, familyAccess: true, research: false }, sessions: [], twoFactor: false },
  son: { profile: { name: 'Aarav K.', email: '', phone: '', dob: '2016-03-05', gender: 'Male', bloodGroup: 'AB+' }, notifications: { appointments: true, medicines: false, records: false, campaigns: false }, privacy: { shareRecords: false, familyAccess: true, research: false }, sessions: [], twoFactor: false },
};
const data = structuredClone(initial);
export function getSettingsMock(profileId = 'me') { return structuredClone(data[profileId] || data.me); }
export function updateSettingsMock(profileId, patch) { data[profileId] = { ...data[profileId], ...patch }; return getSettingsMock(profileId); }
export function signOutSessionMock(profileId, sessionId) { data[profileId].sessions = data[profileId].sessions.filter((session) => session.id !== sessionId); return getSettingsMock(profileId); }
