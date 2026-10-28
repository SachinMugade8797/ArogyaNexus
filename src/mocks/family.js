const familyByOwner = {
  me: [
    { id: 'me', name: 'Rahul K.', relation: 'Self', dob: '1987-04-12', gender: 'Male', bloodGroup: 'O+', phone: '+91 98765 43210', email: 'rahul.k@example.com', allergies: ['Pollen'], completion: 78 },
    { id: 'mother', name: 'Sunita K.', relation: 'Mother', dob: '1962-08-21', gender: 'Female', bloodGroup: 'B+', phone: '+91 98765 43211', email: 'sunita.k@example.com', allergies: ['Penicillin'], completion: 92 },
    { id: 'son', name: 'Aarav K.', relation: 'Son', dob: '2016-03-05', gender: 'Male', bloodGroup: 'AB+', phone: '', email: '', allergies: [], completion: 54 },
  ],
  mother: null,
  son: null,
};
export function getFamilyMock(ownerId = 'me') { return (familyByOwner[ownerId] || familyByOwner.me).map((member) => ({ ...member, allergies: [...member.allergies] })); }
export function saveFamilyMock(ownerId, member) {
  familyByOwner[ownerId] ||= getFamilyMock('me');
  const current = familyByOwner[ownerId];
  const saved = { ...member, allergies: [...(member.allergies || [])], completion: member.completion ?? 78 };
  const index = current.findIndex((item) => item.id === saved.id);
  if (index < 0) current.push(saved); else current[index] = saved;
  return { ...saved, allergies: [...saved.allergies] };
}
export function removeFamilyMock(ownerId, memberId) { familyByOwner[ownerId] = (familyByOwner[ownerId] || []).filter((member) => member.id !== memberId); }
