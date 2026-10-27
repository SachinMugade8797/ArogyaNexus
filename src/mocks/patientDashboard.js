const profiles = {
  me: {
    profile: { id: 'me', name: 'Rahul K.', initials: 'RK', age: 32, relation: 'Self', completion: 78, allergies: ['Penicillin', 'Pollen'], vitals: { heartRate: '76 bpm', bloodPressure: '118/76 mmHg', bloodGlucose: '96 mg/dL' } },
    actions: [{ id: 'consent', text: '2 pending consent access requests from Apollo Clinic', action: 'View requests' }],
    nextAppointment: { doctor: 'Dr. Anil Mehta', specialty: 'Cardiologist', at: '2026-10-28T10:30:00+05:30', status: 'Confirmed', clinic: 'Apollo Clinic', address: 'Indiranagar, Bengaluru' },
    medicinesToday: [{ name: 'Amlodipine', time: '8:00 AM', status: 'Taken' }, { name: 'Metformin', time: '2:00 PM', status: 'Due' }, { name: 'Multivitamin', time: '8:00 PM', status: 'Upcoming' }],
    recentVisits: [{ doctor: 'Dr. Sarah Chen', specialty: 'Follow-up Consultation', date: '2026-10-20T11:00:00+05:30', clinic: 'Apollo Clinic' }, { doctor: 'Dr. Rana Chen', specialty: 'Follow-up Cardiologist', date: '2026-10-12T09:30:00+05:30', clinic: 'City Care' }],
    consent: { activeCount: 2, lastViewedAt: '2026-10-24T15:00:00+05:30' },
    camps: [{ title: 'Heart health screening', place: 'Indiranagar Community Centre', date: '2026-11-02T09:00:00+05:30', distance: '1.2 km away' }, { title: 'Free diabetes check-up', place: 'BBMP Health Centre', date: '2026-11-08T10:00:00+05:30', distance: '2.4 km away' }],
    documents: [{ name: 'Complete blood count', category: 'Lab report', date: '2026-10-20T11:30:00+05:30', clinic: 'Apollo Clinic' }, { name: 'Prescription', category: 'Prescription', date: '2026-10-12T10:00:00+05:30', clinic: 'City Care' }],
  },
  mother: {
    profile: { id: 'mother', name: 'Sunita K.', initials: 'SK', age: 59, relation: 'Mother', completion: 92, allergies: ['Sulfa drugs'], vitals: { heartRate: '72 bpm', bloodPressure: '126/82 mmHg', bloodGlucose: '112 mg/dL' } },
    actions: [{ id: 'medicine', text: '1 medicine reminder is due this afternoon', action: 'View medicines' }],
    nextAppointment: { doctor: 'Dr. Meera Iyer', specialty: 'Endocrinologist', at: '2026-10-29T12:00:00+05:30', status: 'Confirmed', clinic: 'Narayana Health', address: 'Hosur Road, Bengaluru' },
    medicinesToday: [{ name: 'Thyroxine', time: '7:00 AM', status: 'Taken' }, { name: 'Calcium', time: '1:00 PM', status: 'Due' }],
    recentVisits: [{ doctor: 'Dr. Meera Iyer', specialty: 'Diabetes follow-up', date: '2026-10-18T10:00:00+05:30', clinic: 'Narayana Health' }],
    consent: { activeCount: 1, lastViewedAt: '2026-10-22T12:00:00+05:30' },
    camps: [{ title: 'Women’s wellness clinic', place: 'Jayanagar Health Centre', date: '2026-11-04T09:00:00+05:30', distance: '1.8 km away' }],
    documents: [{ name: 'Thyroid function test', category: 'Lab report', date: '2026-10-18T10:30:00+05:30', clinic: 'Narayana Health' }],
  },
  son: {
    profile: { id: 'son', name: 'Aarav K.', initials: 'AK', age: 8, relation: 'Son', completion: 65, allergies: ['Peanuts'], vitals: { heartRate: '88 bpm', bloodPressure: '104/68 mmHg', bloodGlucose: '89 mg/dL' } },
    actions: [],
    nextAppointment: null,
    medicinesToday: [],
    recentVisits: [{ doctor: 'Dr. Ritu Rao', specialty: 'Annual wellness visit', date: '2026-09-26T09:00:00+05:30', clinic: 'Cloudnine Clinic' }],
    consent: { activeCount: 0, lastViewedAt: '2026-10-20T09:00:00+05:30' },
    camps: [{ title: 'Children’s vaccination camp', place: 'Koramangala Primary Health Centre', date: '2026-11-06T09:00:00+05:30', distance: '3 km away' }],
    documents: [],
  },
};

export function getPatientDashboardMock(profileId) {
  if (profileId === 'empty') {
    return { profile: { id: 'empty', name: 'New profile', initials: 'NP', age: null, relation: 'Family member', completion: 0, allergies: [], vitals: {} }, actions: [], nextAppointment: null, medicinesToday: [], recentVisits: [], consent: { activeCount: 0, lastViewedAt: null }, camps: [], documents: [] };
  }
  return profiles[profileId] || profiles.me;
}
