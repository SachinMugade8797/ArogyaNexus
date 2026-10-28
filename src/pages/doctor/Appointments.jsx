import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, NavLink } from 'react-router-dom';
import { Activity, Check, CheckCircle2, Clock3, FileText, LockKeyhole, MessageCircle, MoreHorizontal, Plus, Search, Stethoscope, UserRound, Video, ClipboardList } from 'lucide-react';
import { getCurrentUser } from '../../services/auth/authService';
import { getDoctorAppointments } from '../../api/doctorAppointments';
import '../../styles/dashboard.css';
import DoctorSidebar from '../../components/doctor/DoctorSidebar';
import '../../styles/doctor-appointments.css';

const tabs = [['today', "Today's Schedule"], ['upcoming', 'Upcoming'], ['requests', 'Requests']];
const filters = ['All', 'In-Person', 'Video Call', 'In Waiting', 'Scheduled', 'Completed', 'Missed'];
export function isJoinWindowOpen(appointment, now = new Date()) {
  return ['CONFIRMED', 'WAITING', 'IN_CONSULTATION'].includes(appointment.status) && new Date(now) >= new Date(new Date(appointment.startsAt).getTime() - 10 * 60000) && new Date(now) <= new Date(appointment.endsAt);
}
export function hasRecordAccess(appointment, now = new Date()) { return appointment.consent?.status === 'ACTIVE' && new Date(appointment.consent.expiresAt) > new Date(now); }
export function waitingMinutes(appointment, now = new Date()) { return Math.max(0, Math.floor((new Date(now) - new Date(appointment.checkedInAt || appointment.startsAt)) / 60000)); }
export function actionSet(status) {
  if (status === 'MISSED') return ['Send Missed Visit Alert', 'Mark No-Show'];
  if (status === 'REQUESTED') return ['Accept', 'Decline', 'Propose new time'];
  if (['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(status)) return [];
  return ['Complete Consultation', 'Mark as Completed', 'Mark No-Show'];
}
const time = (date) => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' }).format(new Date(date));
const statusLabels = { WAITING: 'In Waiting', SCHEDULED: 'Scheduled', CONFIRMED: 'Confirmed', IN_CONSULTATION: 'In Consultation', COMPLETED: 'Completed', MISSED: 'Missed Visit', NO_SHOW: 'No-Show', CANCELLED: 'Cancelled', REQUESTED: 'Requested' };

export default function DoctorAppointments({ comingSoon = false }) {
  const [user, setUser] = useState(null);
  const [loadedUser, setLoadedUser] = useState(false);
  const [tab, setTab] = useState('today');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [items, setItems] = useState([]);
  const [state, setState] = useState('loading');
  const [toast, setToast] = useState('');
  const [clock, setClock] = useState(() => new Date());
  const [expanded, setExpanded] = useState({});
  const [menuId, setMenuId] = useState('');
  const load = useCallback(async () => {
    setState('loading');
    try { setItems(await getDoctorAppointments({ tab, q: query, filter })); setState('ready'); }
    catch { setState('error'); }
  }, [tab, query, filter]);
  useEffect(() => { let active = true; getCurrentUser().then((current) => { if (active) { setUser(current); setLoadedUser(true); } }); return () => { active = false; }; }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const id = setInterval(() => setClock(new Date()), 60000); return () => clearInterval(id); }, []);
  const counts = useMemo(() => ({ today: 8, upcoming: 2, requests: 2 }), []);
  if (!loadedUser) return <main className="dashboard-loading">Loading your appointments…</main>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'doctor' || user.doctor_profile?.status !== 'approved') return <Navigate to="/login" replace />;
  const doctorName = user.full_name?.replace(/^Dr\.\s*/i, '') || 'Ananya Sharma';
  const greeting = new Intl.DateTimeFormat('en', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false }).format(clock);
  const salutation = Number(greeting) < 12 ? 'Good morning' : Number(greeting) < 17 ? 'Good afternoon' : 'Good evening';
  const showToast = () => { setToast('Coming in the next step'); setTimeout(() => setToast(''), 2400); };
  if (comingSoon) return <div className="doctor-dashboard"><main className="doctor-coming-soon"><Activity size={30}/><h1>Coming soon</h1><p>This section is being prepared.</p><NavLink to="/doctor/appointments">Back to appointments</NavLink></main></div>;
  return <div className="doctor-dashboard"><DoctorSidebar user={user} onLogout={showToast} /><main className="doctor-workspace"><header className="doctor-topbar"><div className="doctor-appointments-title"><p>{salutation}, Dr. {doctorName}!</p><h1>Appointments</h1></div><div className="doctor-top-actions"><button aria-label="Messages" type="button"><MessageCircle/></button><div className="doctor-profile"><span className="doctor-avatar">{user.full_name?.charAt(0) || 'D'}</span><span><strong>{user.full_name}</strong><small>Cardiologist</small></span></div></div></header>
    <div className="doctor-appointments-content"><div className="doctor-appointments-toolbar"><div className="doctor-appointment-tabs" role="tablist" aria-label="Appointment lists">{tabs.map(([key, label]) => <button key={key} role="tab" aria-selected={tab === key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}<span>{counts[key]}</span></button>)}</div><div className="doctor-appointment-controls"><label className="doctor-appointment-search"><Search size={16}/><input aria-label="Search appointments" placeholder="Search" value={query} onChange={(event) => setQuery(event.target.value)}/></label><select aria-label="Patient and quick action filter" value={filter} onChange={(event) => setFilter(event.target.value)}>{filters.map((option) => <option key={option}>{option}</option>)}</select><button className="doctor-add-appointment" onClick={showToast}><Plus size={17}/> Add Appointment</button></div></div>
    <div className="doctor-appointment-list" aria-live="polite">{state === 'loading' ? Array.from({ length: 4 }, (_, i) => <div className="appointment-skeleton" key={i}><i/><span/><span/><span/></div>) : state === 'error' ? <div className="appointment-empty"><p>We couldn’t load appointments.</p><button onClick={load}>Try again</button></div> : !items.length ? <div className="appointment-empty"><p>{tab === 'today' ? 'No appointments today' : tab === 'upcoming' ? 'No upcoming appointments' : 'No pending requests'}</p></div> : items.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} tab={tab} now={clock} expanded={expanded[appointment.id]} onExpand={() => setExpanded((prev) => ({ ...prev, [appointment.id]: !prev[appointment.id] }))} onAction={showToast} menuOpen={menuId === appointment.id} toggleMenu={() => setMenuId(menuId === appointment.id ? '' : appointment.id)} />)}</div>
    </div></main>{toast && <div className="doctor-appointment-toast" role="status">{toast}</div>}</div>;
}

export function AppointmentCard({ appointment: a, tab, now, expanded, onExpand, onAction, menuOpen, toggleMenu }) {
  const access = hasRecordAccess(a, now);
  const terminal = ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(a.status);
  const showNotes = access || ['IN_CONSULTATION', 'COMPLETED'].includes(a.status);
  const summaryHeading = tab === 'today' ? 'Chief Complaint & Diagnosis Notes' : 'Reason for visit';
  const action = (label, kind = '', Icon) => <button type="button" disabled={label.startsWith('Alert sent')} className={`appointment-action ${kind}`} onClick={onAction}>{Icon && <Icon size={15}/>}<span>{label}</span></button>;
  const StatusIcon = a.status === 'WAITING' ? Clock3 : a.status === 'COMPLETED' ? CheckCircle2 : a.status === 'REQUESTED' ? ClipboardList : Check;
  const ModeIcon = a.mode === 'VIDEO' ? Video : UserRound;
  return <article className={`doctor-appointment-card ${a.status === 'MISSED' ? 'missed-card' : ''}`}>
    <div className="appointment-identity"><div className="appointment-person">{a.patient.photoUrl ? <img src={a.patient.photoUrl} alt=""/> : <span className="appointment-avatar">{a.patient.name.split(' ').map((x) => x[0]).slice(0,2).join('')}</span>}<div><h2>{a.patient.name} <span>({a.patient.age}, {a.patient.gender}) · Token #{String(a.tokenNumber).padStart(2,'0')}</span></h2><div className="appointment-badges"><span className={`appointment-badge mode-${a.mode.toLowerCase()}`}><ModeIcon size={13}/>{a.mode === 'VIDEO' ? 'Video Call' : 'In-Person'}</span><span className={`appointment-badge state-${a.status.toLowerCase()}`}><StatusIcon size={13}/>{statusLabels[a.status]}{a.status === 'WAITING' && <span aria-live="polite"> ({waitingMinutes(a, now)} min)</span>}</span></div></div></div><div className="appointment-vitals">{a.checkInVitals ? `BP ${a.checkInVitals.bpSys}/${a.checkInVitals.bpDia} mmHg · SpO₂ ${a.checkInVitals.spo2}% · Pulse ${a.checkInVitals.pulse} bpm` : 'Vitals not recorded'}</div></div>
    <div className="appointment-summary"><h3>{summaryHeading}</h3><p className={expanded ? '' : 'clamped'}>{showNotes && a.doctorNotes ? `${a.reason} ${a.doctorNotes}` : a.reason}</p>{a.reason.length > 120 && <button className="appointment-read-more" onClick={onExpand}>{expanded ? 'Read less' : 'Read more'}</button>}{tab === 'requests' && <small>Waiting {Math.max(0, Math.floor((now - new Date(a.createdAt)) / 60000))} minutes</small>}</div>
    <div className="appointment-utilities">{!terminal && <button onClick={onAction}><MessageCircle size={15}/> Chat</button>}{a.mode === 'VIDEO' && <button disabled={!isJoinWindowOpen(a, now)} title={!isJoinWindowOpen(a, now) ? 'Available 10 minutes before the visit' : ''} onClick={onAction}><Video size={15}/> Join Video Call</button>}<button disabled={!access} title={!access ? 'Needs patient consent' : ''} onClick={onAction}>{access ? <FileText size={15}/> : <LockKeyhole size={15}/>} Open Medical Records</button>{!access && <button className="request-access" onClick={onAction}>Request access</button>}{access && <small>Access until {time(a.consent.expiresAt)}</small>}</div>
    <div className="appointment-actions">{terminal ? <><span className={`final-status state-${a.status.toLowerCase()}`}>{statusLabels[a.status]}</span><button className="appointment-summary-link" onClick={onAction}>View summary</button></> : a.status === 'MISSED' ? <>{action(a.missedAlertSentAt ? `Alert sent ${time(a.missedAlertSentAt)}` : 'Send Missed Visit Alert', a.missedAlertSentAt ? 'coral sent' : 'coral', a.missedAlertSentAt ? Check : undefined)}{action('Mark No-Show','outline')}</> : a.status === 'REQUESTED' ? <>{action('Accept','primary')}{action('Decline','outline')}{action('Propose new time','text')}</> : <>{action('Complete Consultation','primary',Stethoscope)}{action('Mark as Completed','success-outline')}{action('Mark No-Show','outline')}</>}</div>
    {menuOpen && <div className="appointment-more-menu">{action('Mark as Completed','success-outline')}{action('Mark No-Show','outline')}</div>}<button className="appointment-more" aria-label="More appointment actions" onClick={toggleMenu}><MoreHorizontal size={19}/></button>
  </article>;
}
