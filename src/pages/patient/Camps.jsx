import { useCallback, useEffect, useMemo, useState } from 'react';
import { BadgeCheck, CalendarDays, Clock3, Download, HeartPulse, MapPin, Search, SlidersHorizontal, Users } from 'lucide-react';
import PatientLayout from '../../components/patient/PatientLayout';
import { Button, Card, Drawer, EmptyState, ErrorState, Modal, Skeleton, StatusChip, Tabs, Toggle } from '../../components/ui';
import { useActiveProfile } from '../../contexts/activeProfile';
import { deleteCampReminder, getCamps, saveCampReminder } from '../../api/camps';
import { calculateReminderTime, createCampIcs, distanceFiltered, seatsLabel } from '../../utils/camps';
import { usePatientToast } from '../../hooks/usePatientToast.jsx';
import '../../styles/patient-camps.css';

const DEFAULT_ORIGIN = { lat: 12.9716, lng: 77.5946 };
const OFFSET_OPTIONS = [{ value: 'ONE_DAY', label: '1 day before' }, { value: 'MORNING_OF', label: 'Morning of the day · 8:00 AM' }, { value: 'TWO_HOURS', label: '2 hours before' }];
const zone = 'Asia/Kolkata';
const dateFormat = new Intl.DateTimeFormat('en-IN', { timeZone: zone, day: 'numeric', month: 'short', year: 'numeric' });
const timeFormat = new Intl.DateTimeFormat('en-IN', { timeZone: zone, hour: 'numeric', minute: '2-digit' });
const weekdayFormat = new Intl.DateTimeFormat('en-IN', { timeZone: zone, weekday: 'short' });
function savedOrigin() { try { const value = JSON.parse(localStorage.getItem('arogyanexus.location') || 'null'); return value?.lat && value?.lng ? value : DEFAULT_ORIGIN; } catch { return DEFAULT_ORIGIN; } }
function localDay(iso) { const date = new Date(iso); return new Intl.DateTimeFormat('en-IN', { timeZone: zone, day: '2-digit' }).format(date); }
function formatRange(camp) { return `${timeFormat.format(new Date(camp.startsAt))}–${timeFormat.format(new Date(camp.endsAt))}`; }

export default function CampsPage() {
  const { activeProfile } = useActiveProfile();
  const [data, setData] = useState({ camps: [], reminders: [] });
  const [resource, setResource] = useState({ key: '', status: 'loading' });
  const [now] = useState(() => Date.now());
  const [reload, setReload] = useState(0);
  const [tab, setTab] = useState('Upcoming');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('date');
  const [filters, setFilters] = useState({ distance: 25, range: '30', specialty: '', free: false });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [reminding, setReminding] = useState(null);
  const [offset, setOffset] = useState('ONE_DAY');
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(false);
  const [channelsByCamp, setChannelsByCamp] = useState({});
  const [busy, setBusy] = useState(false);
  const [origin] = useState(savedOrigin);
  const { show, toastNode } = usePatientToast();
  const requestKey = `${activeProfile.id}:${reload}`;
  const state = resource.key === requestKey ? resource.status : 'loading';
  const load = useCallback(() => {
    let live = true;
    void reload;
    getCamps(activeProfile.id).then((result) => { if (live) { setData(result); setResource({ key: requestKey, status: 'ready' }); } }).catch(() => { if (live) setResource({ key: requestKey, status: 'error' }); });
    return () => { live = false; };
  }, [activeProfile.id, reload, requestKey]);
  useEffect(load, [load]);

  const camps = useMemo(() => {
    const reminders = new Set(data.reminders.map((item) => item.campId));
    let result = distanceFiltered(data.camps, origin, Number(filters.distance));
    result = result.filter((camp) => (tab === 'Past' ? new Date(camp.endsAt).getTime() < now : new Date(camp.endsAt).getTime() >= now));
    if (tab === 'My reminders') result = result.filter((camp) => reminders.has(camp.id));
    if (filters.specialty) result = result.filter((camp) => camp.specialtyTags.includes(filters.specialty));
    if (filters.free) result = result.filter((camp) => camp.isFree);
    if (query.trim()) { const q = query.trim().toLowerCase(); result = result.filter((camp) => `${camp.title} ${camp.organizerName} ${camp.address} ${camp.specialtyTags.join(' ')}`.toLowerCase().includes(q)); }
    if (filters.range !== 'all' && tab !== 'Past') result = result.filter((camp) => new Date(camp.startsAt).getTime() <= now + Number(filters.range) * 86400000);
    return result.sort((a, b) => sort === 'distance' ? a.distanceKm - b.distanceKm : new Date(a.startsAt) - new Date(b.startsAt));
  }, [data, origin, filters, query, sort, tab, now]);
  const reminderByCamp = useMemo(() => Object.fromEntries(data.reminders.map((item) => [item.campId, item])), [data.reminders]);
  const countUpcoming = data.camps.filter((camp) => new Date(camp.endsAt).getTime() >= now).length;
  const countPast = data.camps.filter((camp) => new Date(camp.endsAt).getTime() < now).length;
  const countReminders = data.reminders.length;
  const updateReminder = async (camp) => {
    let remindAt;
    try { remindAt = calculateReminderTime(camp.startsAt, offset); } catch (error) { show({ title: 'Choose a different time', message: error.message, type: 'error' }); return; }
    setBusy(true);
    try {
      const reminder = await saveCampReminder(activeProfile.id, { campId: camp.id, remindAt: remindAt.toISOString(), offset });
      setChannelsByCamp((current) => ({ ...current, [camp.id]: { push, email } }));
      setData((current) => ({ ...current, reminders: [...current.reminders.filter((item) => item.campId !== camp.id), reminder] }));
      setReminding(null); show({ title: 'Reminder set', message: `${camp.title} · ${dateFormat.format(remindAt)} at ${timeFormat.format(remindAt)}${push || email ? ` · ${[push && 'push', email && 'email'].filter(Boolean).join(' and ')}` : ''}` });
    } catch (error) { show({ title: 'Could not save reminder', message: error.message, type: 'error' }); } finally { setBusy(false); }
  };
  const removeReminder = async (campId) => { try { await deleteCampReminder(activeProfile.id, campId); setData((current) => ({ ...current, reminders: current.reminders.filter((item) => item.campId !== campId) })); show({ title: 'Reminder removed', message: 'You can set it again any time before the camp starts.' }); } catch (error) { show({ title: 'Could not remove reminder', message: error.message, type: 'error' }); } };
  const downloadCalendar = (camp) => { const blob = new Blob([createCampIcs(camp)], { type: 'text/calendar;charset=utf-8' }); const href = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = href; link.download = `${camp.id}.ics`; link.click(); URL.revokeObjectURL(href); };
  const resetFilters = () => setFilters({ distance: 50, range: 'all', specialty: '', free: false });
  const activeCamp = reminding;
  return <PatientLayout profile={activeProfile}><main className="patient-content patient-camps-page">
    {activeProfile.id !== 'me' && <div className={`active-profile-banner ${activeProfile.color}`}><HeartPulse size={17}/><span>Viewing <strong>{activeProfile.name}’s</strong> health profile · Camp reminders are private to this profile</span></div>}
    <header className="patient-page-heading"><div><p>LOCAL PREVENTIVE CARE</p><h2>Health Camps</h2><span>Find community screenings and health events near you.</span></div><StatusChip status="Bengaluru" icon={MapPin}/></header>
    <section className="camps-search-row"><label className="camps-search"><Search size={16}/><span className="visually-hidden">Search camps</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search camps, services, or areas"/></label><Button variant="secondary" className="camps-filter-open" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={15}/> Filters</Button><label className="camps-sort">Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="date">Date</option><option value="distance">Distance</option></select></label></section>
    <div className="camps-filter-bar"><FilterControls filters={filters} setFilters={setFilters}/></div>
    {state === 'error' ? <ErrorState onRetry={() => setReload((value) => value + 1)}/> : <Card className="camps-main-card"><Tabs label="Camp lists" value={tab} onChange={setTab} items={[{ id: 'Upcoming', label: 'Upcoming', count: countUpcoming }, { id: 'My reminders', label: 'My reminders', count: countReminders }, { id: 'Past', label: 'Past', count: countPast }]}/>
      {state === 'loading' ? <Skeleton rows={5}/> : camps.length ? <div className={`camp-list ${tab === 'My reminders' ? 'reminder-list' : ''}`}>{camps.map((camp) => <CampCard key={camp.id} camp={camp} reminder={reminderByCamp[camp.id]} past={tab === 'Past'} started={new Date(camp.startsAt).getTime() <= now} onRemind={() => { setOffset(reminderByCamp[camp.id]?.offset || 'ONE_DAY'); const channels = channelsByCamp[camp.id] || { push: true, email: false }; setPush(channels.push); setEmail(channels.email); setReminding(camp); }} onRemove={() => removeReminder(camp.id)} onDetails={() => setSelected(camp)} onCalendar={() => downloadCalendar(camp)}/>)}</div> : <div className="camps-empty"><EmptyState text={tab === 'My reminders' ? 'No reminders yet' : tab === 'Past' ? 'No past camps found.' : 'No camps near you right now'}/>{tab === 'Upcoming' && <Button variant="secondary" onClick={resetFilters}>Widen distance</Button>}</div>}
    </Card>}
    {filtersOpen && <Drawer title="Filter camps" onClose={() => setFiltersOpen(false)} className="camp-filter-drawer"><FilterControls filters={filters} setFilters={setFilters}/><Button onClick={() => setFiltersOpen(false)}>Show camps</Button></Drawer>}
    {selected && <Drawer title="Camp details" onClose={() => setSelected(null)} className="camp-details-drawer"><CampDetails camp={selected}/></Drawer>}
    {activeCamp && <Modal title="Set camp reminder" onClose={() => !busy && setReminding(null)}><div className="camp-reminder-form"><label>Remind me<select value={offset} onChange={(event) => setOffset(event.target.value)}>{OFFSET_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><p className="reminder-fire-time"><Clock3 size={15}/>{getFireDescription(activeCamp, offset)}</p><div className="camp-reminder-preferences"><span>Push notification<Toggle checked={push} label="Push notification" onChange={setPush}/></span><span>Email<Toggle checked={email} label="Email notification" onChange={setEmail}/></span></div><footer><Button variant="secondary" onClick={() => setReminding(null)}>Cancel</Button><Button disabled={busy || (!push && !email)} onClick={() => updateReminder(activeCamp)}>{busy ? 'Saving…' : 'Save reminder'}</Button></footer></div></Modal>}
    {toastNode}
  </main></PatientLayout>;
}

function getFireDescription(camp, offset) { try { const date = calculateReminderTime(camp.startsAt, offset); return `Reminder will be sent ${dateFormat.format(date)} at ${timeFormat.format(date)} (IST).`; } catch { return 'This reminder time has already passed. Choose another option.'; } }
function FilterControls({ filters, setFilters }) { const specialties = ['Eye', 'Cardiac', 'Diabetes', 'Vaccination', 'Women’s Health', 'General']; return <><label>Distance<select value={filters.distance} onChange={(event) => setFilters({ ...filters, distance: event.target.value })}><option value="5">Within 5 km</option><option value="10">Within 10 km</option><option value="25">Within 25 km</option><option value="50">Within 50 km</option></select></label><label>Date range<select value={filters.range} onChange={(event) => setFilters({ ...filters, range: event.target.value })}><option value="7">Next 7 days</option><option value="30">Next 30 days</option><option value="90">Next 3 months</option><option value="all">Any date</option></select></label><label>Specialty<select value={filters.specialty} onChange={(event) => setFilters({ ...filters, specialty: event.target.value })}><option value="">All specialties</option>{specialties.map((item) => <option key={item}>{item}</option>)}</select></label><label className="camp-free-filter"><input type="checkbox" checked={filters.free} onChange={(event) => setFilters({ ...filters, free: event.target.checked })}/> Free only</label></>; }
function CampCard({ camp, reminder, past, started, onRemind, onRemove, onDetails, onCalendar }) { const seats = seatsLabel(camp.seatsLeft); const fireAt = reminder && new Date(reminder.remindAt); return <article className={`camp-card${past ? ' past' : ''}`}><div className="camp-date-badge"><strong>{localDay(camp.startsAt)}</strong><span>{weekdayFormat.format(new Date(camp.startsAt))}</span><small>{new Intl.DateTimeFormat('en-IN', { timeZone: zone, month: 'short' }).format(new Date(camp.startsAt))}</small></div><div className="camp-card-body"><div className="camp-card-title"><div><h3>{camp.title}</h3><p className="camp-organizer">{camp.organizerName}{camp.organizerVerified && <span title="Verified organizer"><BadgeCheck size={14}/> Verified</span>}</p></div>{reminder && <StatusChip status="Reminder set" icon={CalendarDays}/>}</div><div className="camp-meta"><span><MapPin size={14}/>{camp.venueName}, {camp.address}</span><span><Clock3 size={14}/>{formatRange(camp)}</span><span><MapPin size={14}/>{camp.distanceKm.toFixed(1)} km away</span><StatusChip status={seats.label} tone={seats.tone} icon={Users}/></div><div className="camp-tags">{camp.isFree && <StatusChip status="Free"/>}{camp.specialtyTags.map((tag) => <StatusChip key={tag} status={tag} icon={HeartPulse}/>)}</div>{reminder && fireAt && <p className="camp-reminder-set"><CalendarDays size={14}/> Reminder: {dateFormat.format(fireAt)} at {timeFormat.format(fireAt)} <button type="button" onClick={onRemind}>Edit</button><button type="button" onClick={onRemove}>Remove</button></p>}<div className="camp-actions">{!past && !started && !reminder && <Button variant="secondary" onClick={onRemind}>Remind me</Button>}{!past && reminder && <Button variant="secondary" onClick={onRemove}>Remove reminder</Button>}<Button variant="outline" onClick={onDetails}>Details</Button><Button variant="text" onClick={onCalendar}><Download size={14}/> Add to calendar</Button></div></div></article>; }
function CampDetails({ camp }) { const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${camp.lat},${camp.lng}`; return <div className="camp-details-content"><div className="camp-map-placeholder"><MapPin size={28}/><span>{camp.venueName}</span><small>{camp.city}</small></div><StatusChip status={camp.organizerVerified ? 'Verified organizer' : 'Organizer'} icon={BadgeCheck}/><h3>{camp.title}</h3><p>{camp.description}</p><h4>Services offered</h4><ul>{camp.services.map((service) => <li key={service}>{service}</li>)}</ul><h4>What to bring</h4><ul>{camp.whatToBring.map((item) => <li key={item}>{item}</li>)}</ul><p className="camp-details-address"><MapPin size={15}/>{camp.venueName}, {camp.address}, {camp.city}</p><a className="patient-button secondary" href={mapUrl} target="_blank" rel="noreferrer">Directions</a></div>; }
