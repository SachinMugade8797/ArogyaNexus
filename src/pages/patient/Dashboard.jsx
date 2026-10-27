import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, FileText, Pill, ShieldCheck, Upload, Video } from 'lucide-react';
import PatientLayout from '../../components/patient/PatientLayout';
import { ActionStrip, CampsList, ConsentSummary, HealthSnapshot, MedicineChecklist, NextAppointmentCard, QuickActions, RecentDocuments, RecentVisits } from '../../components/patient/DashboardSections';
import { useActiveProfile } from '../../contexts/activeProfile';
import { getPatientDashboard } from '../../api/patient';
import { Card } from '../../components/ui';

export default function PatientDashboard() {
  const { activeProfile } = useActiveProfile();
  const [resource, setResource] = useState({ requestKey: '', status: 'loading', data: null });
  const [reload, setReload] = useState(0);
  const requestKey = `${activeProfile.id}:${reload}`;
  const retry = useCallback(() => setReload((value) => value + 1), []);
  useEffect(() => {
    let active = true;
    getPatientDashboard(activeProfile.id).then((data) => { if (active) setResource({ requestKey, status: 'ready', data }); }).catch(() => { if (active) setResource({ requestKey, status: 'error', data: null }); });
    return () => { active = false; };
  }, [activeProfile.id, requestKey]);
  const loading = resource.requestKey !== requestKey;
  const error = !loading && resource.status === 'error';
  const data = resource.data || { profile: { ...activeProfile, allergies: [], completion: 0 }, actions: [], nextAppointment: null, medicinesToday: [], recentVisits: [], consent: { activeCount: 0, lastViewedAt: null }, camps: [], documents: [] };
  const state = loading ? 'loading' : error ? 'error' : undefined;
  return <PatientLayout profile={loading ? activeProfile : data?.profile || activeProfile}><div className="patient-content">
    {activeProfile.id !== 'me' && <div className={`active-profile-banner ${activeProfile.color}`}><UsersIcon /> Viewing <strong>{activeProfile.name}’s</strong> health profile <span>· Only you can manage this profile</span></div>}
    <div className="patient-dashboard-heading"><div><p>YOUR HEALTH, IN ONE PLACE</p><h2>Your health dashboard</h2></div><span><CalendarDays size={16} /> Tuesday, 27 October 2026</span></div>
    {!state && <ActionStrip actions={data.actions} />}
    <div className="patient-dashboard-grid"><div className="patient-primary-column"><div className="patient-top-grid"><NextAppointmentCard appointment={state ? null : data.nextAppointment} state={state} onRetry={retry} /><QuickActions state={state} onRetry={retry} /></div><div className="patient-lower-grid"><div><HealthSnapshot profile={data.profile} state={state} onRetry={retry} /><MedicineChecklist key={activeProfile.id} medicines={data.medicinesToday} state={state} onRetry={retry} /></div><div><RecentVisits visits={data.recentVisits} state={state} onRetry={retry} /></div></div><div className="patient-lower-grid"><CampsList camps={data.camps} state={state} onRetry={retry} /><RecentDocuments documents={data.documents} state={state} onRetry={retry} /></div></div><aside className="patient-side-column"><ConsentSummary consent={data.consent} state={state} onRetry={retry} /><QuickLinks state={state} onRetry={retry} /></aside></div>
  </div></PatientLayout>;
}

function UsersIcon() { return <ShieldCheck size={18} aria-hidden="true" />; }
function QuickLinks({ onRetry, state }) { return <Card title="Quick access" state={state} onRetry={onRetry}><div className="patient-quick-links">{[[CalendarDays, 'Book appointment'], [Upload, 'Upload a record'], [Pill, 'Order medicines'], [Video, 'Video consultation'], [FileText, 'View health records']].map(([Icon, label]) => <button type="button" key={label}><span><Icon size={17} /></span>{label}<ArrowRight size={15} /></button>)}</div></Card>; }
