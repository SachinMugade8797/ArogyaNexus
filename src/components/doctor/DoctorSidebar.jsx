import { Activity, CalendarDays, Clock3, FileText, LayoutDashboard, LockKeyhole, LogOut, MessageCircle, Pill, Settings, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const links = [
  [LayoutDashboard, 'Dashboard', '/doctor/dashboard'],
  [CalendarDays, 'Appointments', '/doctor/appointments'],
  [Users, 'Patients', '/doctor/patients'],
  [Clock3, 'Availability', '/doctor/availability'],
  [FileText, 'Medical Records', '/doctor/medical-records'],
  [Pill, 'Prescriptions', '/doctor/prescriptions'],
  [LockKeyhole, 'Access Requests', '/doctor/access-requests'],
  [MessageCircle, 'Messages', '/doctor/messages'],
  [Settings, 'Settings', '/doctor/settings'],
];

export default function DoctorSidebar({ user, onLogout }) {
  return <aside className="doctor-sidebar" aria-label="Doctor navigation">
    <NavLink className="doctor-brand" to="/doctor/dashboard" aria-label="ArogyaNexus dashboard">
      <span className="doctor-brand-icon"><Activity size={25} /></span>
      <span>AROGYA<span>NEXUS</span></span>
    </NavLink>
    <nav className="doctor-nav">{links.map(([Icon, label, to]) => <NavLink end key={label} to={to} className={({ isActive }) => `doctor-nav-link${isActive ? ' is-active' : ''}`}>
      <Icon size={19} /><span>{label}</span>{label === 'Messages' && <span className="doctor-nav-badge">1</span>}
    </NavLink>)}</nav>
    <div className="doctor-mobile-promo"><strong>ArogyaNexus Mobile</strong><span>Access patients on the go.</span><span className="doctor-store-badges">App Store　 Google Play</span></div>
    <div className="doctor-sidebar-bottom">
      <div className="doctor-mini-profile"><span className="doctor-avatar">{user.full_name?.charAt(0) || 'D'}</span><span><strong>{user.full_name}</strong><small>Cardiologist</small></span></div>
      <button className="doctor-logout" type="button" onClick={onLogout}><LogOut size={17} /> Log out</button>
    </div>
  </aside>;
}
