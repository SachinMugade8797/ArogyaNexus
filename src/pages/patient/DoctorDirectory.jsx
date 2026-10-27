import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, BadgeCheck, MapPin, Search, SlidersHorizontal, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import PatientLayout from '../../components/patient/PatientLayout';
import { Avatar, Button, Card, EmptyState, StatusChip } from '../../components/ui';
import { useActiveProfile } from '../../contexts/activeProfile';
import { getDoctors } from '../../api/doctors';
import '../../styles/patient-doctors.css';

const specialities = ['Cardiology', 'Dermatology', 'Endocrinology', 'Paediatrics'];

export default function DoctorDirectory() {
  const { activeProfile } = useActiveProfile();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [filters, setFilters] = useState({});
  const [reload, setReload] = useState(0);
  const [resource, setResource] = useState({ key: '', status: 'loading', doctors: [] });
  const key = `${activeProfile.id}:${JSON.stringify(filters)}:${reload}`;
  const retry = useCallback(() => setReload((value) => value + 1), []);
  useEffect(() => {
    let current = true;
    getDoctors(activeProfile.id, filters).then((doctors) => { if (current) setResource({ key, status: 'ready', doctors }); }).catch(() => { if (current) setResource({ key, status: 'error', doctors: [] }); });
    return () => { current = false; };
  }, [activeProfile.id, filters, key]);
  const loading = resource.key !== key;
  const state = loading ? 'loading' : resource.status === 'error' ? 'error' : undefined;
  const doctors = loading || state === 'error' ? [] : resource.doctors;
  const submit = (event) => { event.preventDefault(); setFilters({ query: query.trim(), location, speciality }); };
  const clearFilters = () => { setQuery(''); setLocation(''); setSpeciality(''); setFilters({}); };

  return <PatientLayout profile={activeProfile}><main className="patient-content patient-directory-page">
    <header className="patient-page-heading"><div><p>CARE THAT FITS YOUR NEEDS</p><h2>Find a doctor you can trust</h2><span>Browse verified specialists and care teams near you.</span></div></header>
    <form className="doctor-filter-card patient-card" onSubmit={submit} aria-label="Find doctors"><label className="doctor-search-field"><span>Search doctors or clinics</span><span className="doctor-search-input"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, speciality, or clinic" /></span></label><label><span>Speciality</span><select value={speciality} onChange={(event) => setSpeciality(event.target.value)}><option value="">All specialities</option>{specialities.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Location</span><select value={location} onChange={(event) => setLocation(event.target.value)}><option value="">All locations</option><option value="bengaluru">Bengaluru</option><option value="mysuru">Mysuru</option></select></label><Button type="submit"><SlidersHorizontal size={15} /> Search</Button></form>
    <section className="doctor-directory-results"><div className="doctor-results-heading"><div><h3>Verified specialists</h3><p>{loading ? 'Finding doctors…' : `${doctors.length} ${doctors.length === 1 ? 'doctor' : 'doctors'} available`}</p></div><span><BadgeCheck size={15} /> Admin verified</span></div>
      {state === 'error' ? <Card state="error" onRetry={retry} /> : loading ? <div className="doctor-results-grid"><Card title="Doctor profile" state="loading" /><Card title="Doctor profile" state="loading" /></div> : doctors.length ? <div className="doctor-results-grid">{doctors.map((doctor) => <DoctorResultCard doctor={doctor} key={doctor.id} />)}</div> : <Card className="doctor-empty-card"><EmptyState text="No verified doctors match these filters." /><Button variant="secondary" onClick={clearFilters}>Clear filters</Button></Card>}
    </section>
  </main></PatientLayout>;
}

function DoctorResultCard({ doctor }) {
  return <Card className="doctor-result-card"><div className="doctor-result-identity"><Avatar name={doctor.user.full_name} initials={doctor.user.full_name.split(' ').slice(1).map((part) => part[0]).join('').replaceAll('.', '') || 'DR'} size="lg" /><div><StatusChip status="Verified" icon={BadgeCheck} /><h3>{doctor.user.full_name}</h3><p>{doctor.speciality}</p></div></div><div className="doctor-result-clinic"><strong>{doctor.clinic_name}</strong><span><MapPin size={14} /> {doctor.clinic_address}</span></div><div className="doctor-result-meta"><span><small>Consultation fee</small><strong>₹{doctor.consultation_fee.toLocaleString('en-IN')}</strong></span><span><small>Registration</small><strong>{doctor.registration_number}</strong></span></div><div className="doctor-result-actions"><Link to={`/patient/doctors/${doctor.id}`}>View profile <ArrowRight size={15} /></Link><Link className="patient-button primary" to={`/patient/book-appointment/${doctor.id}`}><Stethoscope size={15} /> Book appointment</Link></div></Card>;
}
