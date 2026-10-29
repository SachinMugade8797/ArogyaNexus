import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getAppointment, logRecordAccess } from '../../api/doctorAppointments';
import '../../styles/dashboard.css';
import '../../styles/doctor-appointments.css';

export function ConsultationPlaceholder() {
  const { appointmentId } = useParams();
  return <main className="doctor-coming-soon"><h1>Consultation</h1><p>Consultation workspace for appointment {appointmentId} is coming soon.</p><Link to="/doctor/appointments">Back to appointments</Link></main>;
}

export function MedicalRecordsPlaceholder() {
  const { patientId } = useParams();
  const [search] = useSearchParams();
  const [state, setState] = useState('loading');
  const [appointment, setAppointment] = useState(null);
  useEffect(() => {
    let active = true;
    const appointmentId = search.get('appointment');
    if (!appointmentId) { setState('denied'); return () => { active = false; }; }
    getAppointment(appointmentId).then(async (result) => {
      if (!active) return;
      if (!result || result.patient.id !== patientId) { setState('denied'); return; }
      setAppointment(result);
      const access = await logRecordAccess(appointmentId);
      if (active) setState(access.code ? 'denied' : 'allowed');
    }).catch(() => { if (active) setState('denied'); });
    return () => { active = false; };
  }, [patientId, search]);
  return <main className="doctor-coming-soon">{state === 'loading' ? <p>Checking patient consent…</p> : state === 'denied' ? <><h1>Access denied</h1><p>Active patient consent is required to view these records.</p></> : <><h1>Medical records</h1><p>Access verified for {appointment?.patient.name}. Records viewer is coming soon.</p></>}<Link to="/doctor/appointments">Back to appointments</Link></main>;
}
