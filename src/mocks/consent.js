const now = () => new Date();
const plusHours = (hours) => new Date(Date.now() + hours * 3600000).toISOString();
const dates = {
  me: [
    { id:'consent-1', patientId:'me', doctorId:'dr-anil', appointmentId:'apt-101', status:'PENDING', scope:['View allergies and conditions','View past records'], reason:'Please share your recent blood test and allergy details before your follow-up.', requestedAt:plusHours(-0.7), startsAt:null, expiresAt:null, endedAt:null, endedReason:null },
    { id:'consent-2', patientId:'me', doctorId:'dr-neha', appointmentId:null, status:'ACTIVE', scope:['View allergies and conditions','View past records','Write visit notes'], reason:'Dermatology consultation and follow-up care.', requestedAt:plusHours(-30), startsAt:plusHours(-23), expiresAt:plusHours(23), endedAt:null, endedReason:null },
    { id:'consent-3', patientId:'me', doctorId:'dr-sarah', appointmentId:'apt-099', status:'REVOKED', scope:['View past records'], reason:'Review of discharge summary.', requestedAt:plusHours(-120), startsAt:plusHours(-115), expiresAt:plusHours(-80), endedAt:plusHours(-100), endedReason:'Patient ended access' },
    { id:'consent-4', patientId:'me', doctorId:'dr-kapoor', appointmentId:null, status:'DENIED', scope:['View allergies and conditions'], reason:'Pre-visit review.', requestedAt:plusHours(-210), startsAt:null, expiresAt:null, endedAt:plusHours(-208), endedReason:'Not approved' },
  ], mother: [], son: [],
};
const doctors = { 'dr-anil':{name:'Dr. Anil Mehta',specialty:'Cardiology'}, 'dr-neha':{name:'Dr. Neha Sharma',specialty:'Dermatology'}, 'dr-sarah':{name:'Dr. Sarah Chen',specialty:'Internal Medicine'}, 'dr-kapoor':{name:'Dr. Vikram Kapoor',specialty:'General Physician'} };
const logs = {
  me:[{id:'log-1',patientId:'me',doctorId:'dr-neha',action:'Viewed',recordTitle:'Complete Blood Count',consentId:'consent-2',createdAt:plusHours(-0.2)},{id:'log-2',patientId:'me',doctorId:'dr-neha',action:'Downloaded',recordTitle:'Echocardiogram Report',consentId:'consent-2',createdAt:plusHours(-3)},{id:'log-3',patientId:'me',doctorId:'dr-sarah',action:'Wrote notes',recordTitle:'Visit notes',consentId:'consent-3',createdAt:plusHours(-105)}],mother:[],son:[]
};
export function listConsentsMock(patientId) { return (dates[patientId] || []).map((c)=>({...c,scope:[...c.scope],doctor:doctors[c.doctorId]})); }
export function listAccessLogsMock(patientId) { return (logs[patientId] || []).map((x)=>({...x,doctor:doctors[x.doctorId]})); }
export function changeConsentMock(patientId,id,patch) { const row=(dates[patientId]||[]).find((c)=>c.id===id); if(!row) throw new Error('Consent request not found.'); Object.assign(row,patch); return {...row,scope:[...row.scope],doctor:doctors[row.doctorId]}; }
export function appendAccessLogMock(patientId,entry) { logs[patientId] ||= []; const row={id:`log-${Date.now()}`,patientId,...entry,createdAt:now().toISOString()}; logs[patientId].unshift(row); return row; }
