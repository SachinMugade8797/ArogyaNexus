const doctors = [
  {
    id: 'dp-ananya-sharma', user_id: 'doctor-user-1', speciality: 'Cardiology', registration_number: 'KMC-2018-04192',
    clinic_name: 'Apex Heart & Wellness Centre', clinic_address: 'Indiranagar, Bengaluru, Karnataka', consultation_fee: 900,
    status: 'approved', created_at: '2024-02-10T09:00:00.000Z', updated_at: '2026-09-14T08:30:00.000Z',
    user: { id: 'doctor-user-1', full_name: 'Dr. Ananya Sharma' },
  },
  {
    id: 'dp-meera-iyer', user_id: 'doctor-user-2', speciality: 'Endocrinology', registration_number: 'KMC-2012-02573',
    clinic_name: 'Narayana Health City', clinic_address: 'Hosur Road, Bengaluru, Karnataka', consultation_fee: 1100,
    status: 'approved', created_at: '2023-08-17T09:00:00.000Z', updated_at: '2026-09-11T08:30:00.000Z',
    user: { id: 'doctor-user-2', full_name: 'Dr. Meera Iyer' },
  },
  {
    id: 'dp-arjun-nair', user_id: 'doctor-user-3', speciality: 'Dermatology', registration_number: 'KMC-2016-01884',
    clinic_name: 'Sparsh Skin & Laser Clinic', clinic_address: 'Jayanagar, Bengaluru, Karnataka', consultation_fee: 750,
    status: 'approved', created_at: '2024-04-02T09:00:00.000Z', updated_at: '2026-09-09T08:30:00.000Z',
    user: { id: 'doctor-user-3', full_name: 'Dr. Arjun Nair' },
  },
  {
    id: 'dp-ritu-rao', user_id: 'doctor-user-4', speciality: 'Paediatrics', registration_number: 'KMC-2019-05108',
    clinic_name: 'Cloudnine Children’s Clinic', clinic_address: 'Koramangala, Bengaluru, Karnataka', consultation_fee: 800,
    status: 'approved', created_at: '2024-01-29T09:00:00.000Z', updated_at: '2026-09-02T08:30:00.000Z',
    user: { id: 'doctor-user-4', full_name: 'Dr. Ritu Rao' },
  },
];

export const mockAvailability = {
  'dp-ananya-sharma': ['09:30 AM', '10:30 AM', '11:15 AM', '02:00 PM', '04:30 PM'],
  'dp-meera-iyer': ['10:00 AM', '11:30 AM', '01:15 PM', '03:00 PM'],
  'dp-arjun-nair': ['09:00 AM', '10:45 AM', '12:30 PM', '04:00 PM'],
  'dp-ritu-rao': ['09:15 AM', '11:00 AM', '01:30 PM', '03:45 PM'],
};

export function getDoctorsMock(filters = {}) {
  const query = (filters.query || '').trim().toLowerCase();
  const speciality = (filters.speciality || '').toLowerCase();
  const location = (filters.location || '').toLowerCase();
  return doctors.filter((doctor) => doctor.status === 'approved')
    .filter((doctor) => !speciality || doctor.speciality.toLowerCase() === speciality)
    .filter((doctor) => !location || doctor.clinic_address.toLowerCase().includes(location))
    .filter((doctor) => !query || `${doctor.user.full_name} ${doctor.speciality} ${doctor.clinic_name} ${doctor.clinic_address}`.toLowerCase().includes(query));
}

export function getDoctorMock(doctorId) {
  return doctors.find((doctor) => doctor.id === doctorId && doctor.status === 'approved') || null;
}
