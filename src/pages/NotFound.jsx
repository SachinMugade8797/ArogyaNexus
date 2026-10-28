import { Link } from 'react-router-dom';

export default function NotFound({ patient = false }) {
  const home = patient ? '/patient/dashboard' : '/';
  return <main className="app-error-page"><span aria-hidden="true">404</span><p>AROGYANEXUS</p><h1>We couldn’t find that page</h1><p>The link may be out of date, or the page may have moved.</p><div><Link to={home}>Back to {patient ? 'your dashboard' : 'home'}</Link></div></main>;
}
