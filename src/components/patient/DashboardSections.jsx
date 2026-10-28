import { useState } from 'react';
import { AlertTriangle, ArrowDownToLine, ArrowRight, CalendarDays, Check, ChevronDown, Clock3, FileText, HeartPulse, MapPin, MoreHorizontal, Pill, ShieldCheck, Upload, Video, X } from 'lucide-react';
import { Avatar, Button, Card, StatusChip } from '../ui';
import { getConsentDaysRemaining } from '../../utils/consent';
import { Link } from 'react-router-dom';

function relativeDate(value) {
  if (!value) return 'Date to be confirmed';
  const date = new Date(value);
  const day = date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
  const time = date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const label = date.toDateString() === tomorrow.toDateString() ? 'Tomorrow' : date.toDateString() === new Date().toDateString() ? 'Today' : day;
  return <time dateTime={date.toISOString()} title={date.toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}>{label}, {time}</time>;
}

export function ActionStrip({ actions }) {
  if (!actions.length) return null;
  return <div className="patient-alert" role="status"><AlertTriangle size={19} /><p><strong>Alert:</strong> {actions[0].text}</p><Link className="patient-button warning" to="/patient/consent">View requests</Link><button className="alert-dismiss" type="button" aria-label="Dismiss alert"><X size={17} /></button></div>;
}

export function NextAppointmentCard({ appointment, onRetry, state }) {
  return <Card className="next-appointment" title="Next Appointment" state={state || (appointment === undefined ? 'loading' : appointment ? 'ready' : 'empty')} emptyText="No upcoming appointments. Book a visit when you’re ready." onRetry={onRetry}>
    {appointment && <><div className="appointment-doctor"><Avatar name={appointment.doctor} initials="AM" /><div><strong>{appointment.doctor}</strong><span>{appointment.specialty}</span></div><button type="button" aria-label="Appointment options"><MoreHorizontal size={20} /></button></div><div className="appointment-meta"><span className="appointment-date">{relativeDate(appointment.at)}</span><StatusChip status={appointment.status} /><Button variant="light">Reschedule</Button><Button variant="outline"><MapPin size={14} /> Directions</Button></div><span className="appointment-clinic"><MapPin size={13} /> {appointment.clinic} · {appointment.address}</span></>}
  </Card>;
}

export function QuickActions({ onRetry, state }) {
  const actions = [[CalendarDays, 'Book Appointment'], [Upload, 'Upload Record'], [Pill, 'Order Medicines'], [Video, 'Video Consult']];
  return <Card className="quick-actions" title="Quick actions" state={state} onRetry={onRetry}><div className="quick-action-grid">{actions.map(([Icon, label]) => <button type="button" key={label}><span><Icon size={20} /></span>{label}<ArrowRight size={15} /></button>)}</div></Card>;
}

export function HealthSnapshot({ profile, onRetry, state }) {
  const stats = [['Heart Rate', profile?.vitals?.heartRate || '—', 'heart'], ['Blood Pressure', profile?.vitals?.bloodPressure || '—', 'pressure'], ['Blood Glucose', profile?.vitals?.bloodGlucose || '—', 'glucose']];
  return <Card title="Health Snapshot" className="health-snapshot" state={state} onRetry={onRetry}><div className="health-metrics">{stats.map(([label, value, type]) => <div className="health-metric" key={label}><span>{label}</span><strong>{value}</strong><div className={`health-spark ${type}`} aria-label={`${label} trend`}><i /><i /><i /><i /><i /><i /><i /><i /></div></div>)}</div>{profile?.allergies?.length > 0 && <div className="allergy-chip"><AlertTriangle size={14} /> Allergies: {profile.allergies.join(', ')}</div>}</Card>;
}

export function MedicineChecklist({ medicines, onRetry, state }) {
  const [checked, setChecked] = useState(() => medicines.map((medicine) => medicine.status === 'Taken'));
  const taken = checked.filter(Boolean).length;
  return <Card title="Today’s Medicines" className="medicine-card" state={state || (medicines === undefined ? 'loading' : medicines.length ? 'ready' : 'empty')} emptyText="No medicines scheduled for today." onRetry={onRetry}><div className="medicine-progress"><span className="adherence-ring" style={{ '--progress': `${medicines.length ? (taken / medicines.length) * 100 : 0}%` }}><b>{medicines.length ? Math.round((taken / medicines.length) * 100) : 0}%</b></span><span><strong>{taken} of {medicines.length} taken</strong><small>Today’s adherence</small></span></div><div className="medicine-list">{medicines.map((medicine, index) => <label key={medicine.name}><input type="checkbox" checked={checked[index] || false} onChange={() => setChecked((old) => old.map((value, i) => i === index ? !value : value))} /><span className="medicine-check"><Check size={13} /></span><span>{medicine.name} <small>({medicine.time})</small></span><em className={checked[index] ? 'taken' : ''}>{checked[index] ? 'Taken' : medicine.status === 'Taken' ? 'Due' : medicine.status}</em></label>)}</div></Card>;
}

export function RecentVisits({ visits, onRetry, state }) {
  return <Card title="Recent Visits" className="recent-visits" state={state || (visits === undefined ? 'loading' : visits.length ? 'ready' : 'empty')} emptyText="Your visits will appear here." onRetry={onRetry}><div className="visit-timeline">{visits.map((visit) => <article key={`${visit.doctor}-${visit.date}`}><span className="visit-dot" /><div><strong>{visit.doctor}</strong><span>{visit.specialty} · {visit.clinic}</span><time title={new Date(visit.date).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}>{new Date(visit.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</time></div><button type="button" aria-label={`View ${visit.doctor} visit`}><ArrowRight size={17} /></button></article>)}</div></Card>;
}

export function ConsentSummary({ consent, onRetry, state }) {
  const [confirm, setConfirm] = useState(false);
  const days = getConsentDaysRemaining(consent.lastViewedAt);
  return <><Card title="Who can see my data" className="consent-summary" state={state} onRetry={onRetry}><div className="consent-count"><span className="consent-icon"><ShieldCheck size={19} /></span><div><strong>{consent.activeCount} active {consent.activeCount === 1 ? 'access' : 'accesses'}</strong><small>{consent.activeCount ? 'You’re in control of your health data.' : 'No providers currently have access.'}</small></div><button type="button" className="manage-button">Manage <ChevronDown size={15} /></button></div>{consent.activeCount > 0 && <div className="consent-provider"><Avatar initials="SC" name="Dr. Sarah Chen" size="sm" /><span><strong>Dr. Sarah Chen</strong><small>Follow-up consultation</small></span><StatusChip status="Active" /><button type="button" aria-label="End access" onClick={() => setConfirm(true)} className="access-toggle" /></div>}<p className="consent-countdown"><Clock3 size={14} /> {days === null ? 'No recent access activity' : `Access review in ${days} days`}</p>{consent.activeCount > 0 && <Button variant="text" onClick={() => setConfirm(true)}>End access now</Button>}</Card>{confirm && <div className="patient-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirm(false); }}><section className="patient-dialog" role="dialog" aria-modal="true" aria-labelledby="end-access-title"><span className="dialog-icon"><ShieldCheck size={22} /></span><h2 id="end-access-title">End provider access?</h2><p>Dr. Sarah Chen will no longer be able to view this profile’s shared health records.</p><div><Button variant="secondary" onClick={() => setConfirm(false)}>Keep access</Button><Button variant="danger" onClick={() => setConfirm(false)}>End access</Button></div></section></div>}</>;
}

export function CampsList({ camps, onRetry, state }) {
  return <Card title="Nearby health camps" className="camps-list" state={state || (camps === undefined ? 'loading' : camps.length ? 'ready' : 'empty')} emptyText="No nearby camps at the moment." onRetry={onRetry}><div className="camp-items">{camps.map((camp) => <article key={camp.title}><span className="camp-icon"><HeartPulse size={18} /></span><div><strong>{camp.title}</strong><span><MapPin size={13} /> {camp.place}</span><small><CalendarDays size={13} /> {relativeDate(camp.date)} · {camp.distance}</small></div><button type="button" aria-label={`View ${camp.title}`}><ArrowRight size={16} /></button></article>)}</div></Card>;
}

export function RecentDocuments({ documents, onRetry, state }) {
  return <Card title="Recent documents" className="recent-documents" state={state || (documents === undefined ? 'loading' : documents.length ? 'ready' : 'empty')} emptyText="No documents uploaded yet." onRetry={onRetry}><div className="document-list">{documents.map((document) => <article key={document.name}><span className="document-icon"><FileText size={18} /></span><div><strong>{document.name}</strong><span>{document.category} · {document.clinic}</span><time title={new Date(document.date).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}>{new Date(document.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</time></div><button type="button" aria-label={`Download ${document.name}`}><ArrowDownToLine size={17} /></button></article>)}</div></Card>;
}
