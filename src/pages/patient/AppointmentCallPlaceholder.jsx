import { Link, useParams } from 'react-router-dom';
import { Video } from 'lucide-react';
import PatientLayout from '../../components/patient/PatientLayout';
import { Card } from '../../components/ui';
import { useActiveProfile } from '../../contexts/activeProfile';

export default function AppointmentCallPlaceholder() {
  const { id } = useParams(); const { activeProfile } = useActiveProfile();
  return <PatientLayout profile={activeProfile}><main className="patient-content"><Card className="appointments-empty"><Video size={26} /><h2>Video visit</h2><p>Video visits are not available yet.</p><Link className="patient-button secondary" to="/patient/appointments">Return to appointments</Link><span className="sr-only">Appointment {id}</span></Card></main></PatientLayout>;
}
