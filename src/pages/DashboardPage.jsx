import React, { useEffect, useState } from 'react';
import { Activity, LayoutDashboard, LogOut, X } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../services/auth/authService';
import '../styles/dashboard.css';

const dashboardPaths = {
  patient: '/patient/dashboard',
  doctor: '/doctor/dashboard',
  admin: '/admin/dashboard',
};

const roleLabels = {
  patient: 'Patient',
  doctor: 'Doctor',
  admin: 'Administrator',
};

export default function DashboardPage({ role }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    getCurrentUser().then((currentUser) => {
      if (active) {
        setUser(currentUser);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  const confirmLogout = async () => {
    setLoggingOut(true);
    setLogoutError('');
    try {
      await logoutUser();
      navigate('/login', { replace: true });
    } catch {
      setLogoutError('Could not sign out. Please try again.');
      setLoggingOut(false);
    }
  };

  if (loading) {
    return <main className="dashboard-loading" aria-live="polite">Loading your dashboard…</main>;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={dashboardPaths[user.role] || '/login'} replace />;
  if (role === 'doctor' && user.doctor_profile?.status !== 'approved') {
    return <Navigate to="/login" replace />;
  }

  const title = role === 'admin' ? 'Admin dashboard' : `${roleLabels[role]} dashboard`;

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
        <Link className="dashboard-brand" to={dashboardPaths[role]} aria-label="ArogyaNexus dashboard">
          <span className="dashboard-brand-mark"><Activity size={21} /></span>
          <span>ArogyaNexus</span>
        </Link>

        <nav className="dashboard-nav">
          <Link className="dashboard-nav-link active" to={dashboardPaths[role]} aria-current="page">
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </Link>
        </nav>

        <div className="dashboard-sidebar-footer">
          <div className="dashboard-user">
            <span className="dashboard-avatar" aria-hidden="true">
              {user.full_name?.trim()?.charAt(0)?.toUpperCase() || roleLabels[role].charAt(0)}
            </span>
            <span className="dashboard-user-copy">
              <strong>{user.full_name}</strong>
              <small>{roleLabels[role]}</small>
            </span>
          </div>
          <button className="dashboard-logout-link" type="button" onClick={() => setShowLogoutDialog(true)}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">{roleLabels[role]} portal</p>
            <h1>{title}</h1>
          </div>
          <span className="dashboard-header-avatar" aria-hidden="true">
            {user.full_name?.trim()?.charAt(0)?.toUpperCase() || roleLabels[role].charAt(0)}
          </span>
        </header>
        <section className="dashboard-welcome-card" aria-labelledby="dashboard-welcome-title">
          <div className="dashboard-welcome-icon"><Activity size={24} /></div>
          <p className="dashboard-eyebrow">Your workspace</p>
          <h2 id="dashboard-welcome-title">Welcome, {user.full_name}</h2>
          <p>You’re signed in to your {roleLabels[role].toLowerCase()} account.</p>
        </section>
      </main>

      {showLogoutDialog && (
        <div className="dashboard-dialog-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !loggingOut) setShowLogoutDialog(false);
        }}>
          <section className="dashboard-dialog" role="dialog" aria-modal="true" aria-labelledby="logout-title">
            <button
              className="dashboard-dialog-close"
              type="button"
              aria-label="Close logout confirmation"
              disabled={loggingOut}
              onClick={() => setShowLogoutDialog(false)}
            >
              <X size={19} />
            </button>
            <span className="dashboard-dialog-icon"><LogOut size={21} /></span>
            <h2 id="logout-title">Log out?</h2>
            <p>You’ll be signed out of your account and returned to the login page.</p>
            {logoutError && <p className="dashboard-dialog-error" role="alert">{logoutError}</p>}
            <div className="dashboard-dialog-actions">
              <button className="dashboard-button-secondary" type="button" disabled={loggingOut} onClick={() => setShowLogoutDialog(false)}>
                Cancel
              </button>
              <button className="dashboard-button-primary" type="button" disabled={loggingOut} onClick={confirmLogout}>
                {loggingOut ? 'Logging out…' : 'Log out'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
