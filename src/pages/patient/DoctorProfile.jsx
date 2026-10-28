import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, BadgeCheck, CalendarDays, Clock3, MapPin, ShieldCheck, Stethoscope } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import PatientLayout from '../../components/patient/PatientLayout';
import { Avatar, Card, EmptyState, StatusChip } from '../../components/ui';
import { useActiveProfile } from '../../contexts/activeProfile';
import { getDoctorById } from '../../api/doctors';
import '../../styles/patient-doctors.css';

export default function DoctorProfile() {
  const { doctorId } = useParams();
  const { activeProfile } = useActiveProfile();
  const [resource, setResource] = useState({ key: '', status: 'loading', doctor: null });
  const [reload, setReload] = useState(0);
  const key = `${doctorId}:${activeProfile.id}:${reload}`;
  const retry = useCallback(() => setReload((value) => value + 1), []);
  useEffect(() => {
    let current = true;
    getDoctorById(doctorId, activeProfile.id).then((doctor) => { if (current) setResource({ key, status: 'ready', doctor }); }).catch(() => { if (current) setResource({ key, status: 'error', doctor: null }); });
    return () => { current = false; };
  }, [doctorId, activeProfile.id, key]);
  const loading = resource.key !== key;
  const state = loading ? 'loading' : resource.status === 'error' ? 'error' : undefined;
  const doctor = state ? null : resource.doctor;

  return <PatientLayout profile={activeProfile}><main className="patient-content patient-doctor-profile-page"><Link className="patient-back-link" to="/patient/doctors"><ArrowLeft size={16} /> Back to doctors</Link>
    {state === 'error' ? <Card title="Doctor profile" state="error" onRetry={retry} /> : loading ? <Card className="doctor-profile-loading" title="Doctor profile" state="loading" /> : !doctor ? <Card className="doctor-profile-empty"><EmptyState text="This verified doctor profile could not be found." /><Link to="/patient/doctors">Browse all doctors</Link></Card> : <>
      <section className="doctor-profile-hero"><div className="doctor-profile-orbit" aria-hidden="true" /><span className="doctor-profile-avatar"><Avatar name={doctor.user.full_name} initials={doctor.user.full_name.split(' ').map((part) => part[0]).join('').replaceAll('.', '')} size="lg" /></span><div className="doctor-profile-intro"><StatusChip status="Verified doctor" icon={BadgeCheck} /><h2>{doctor.user.full_name}</h2><p><Stethoscope size={15} /> {doctor.speciality}</p><span><MapPin size={14} /> {doctor.clinic_address}</span></div></section>
      <div className="doctor-profile-grid"><div className="doctor-profile-main"><Card title="About the doctor"><p className="doctor-profile-copy">A verified {doctor.speciality.toLowerCase()} specialist providing thoughtful, patient-centred care at {doctor.clinic_name}.</p><div className="doctor-profile-facts"><span><BadgeCheck size={17} /><b>Verified registration</b><small>{doctor.registration_number}</small></span><span><ShieldCheck size={17} /><b>Secure care</b><small>Your profile remains in your control</small></span><span><Clock3 size={17} /><b>Appointment requests</b><small>The clinic confirms your selected time</small></span></div></Card><Card title="Clinic details"><h3>{doctor.clinic_name}</h3><p className="doctor-clinic-address"><MapPin size={16} /> {doctor.clinic_address}</p></Card></div><aside className="doctor-booking-aside"><Card title="Consultation details"><span className="doctor-fee-label">CONSULTATION FEE</span><strong className="doctor-consultation-fee">₹{doctor.consultation_fee.toLocaleString('en-IN')}</strong><p className="doctor-fee-note">Pay at the clinic after your visit.</p><StatusChip status="Appointment request" icon={CalendarDays} /><Link className="patient-button primary doctor-book-cta" to={`/patient/book-appointment/${doctor.id}`}><CalendarDays size={16} /> Choose a time</Link><small className="doctor-consent-note"><ShieldCheck size={14} /> You choose what health information to share.</small></Card></aside></div>
    </>}
  </main></PatientLayout>;
}
