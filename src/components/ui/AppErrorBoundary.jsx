import React from 'react';
import { Link } from 'react-router-dom';

export default class AppErrorBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="app-error-page"><span aria-hidden="true">!</span><p>AROGYANEXUS</p><h1>We hit an unexpected error</h1><p>Your health information is still safe. Reload the page or return to the dashboard.</p><div><button type="button" onClick={() => window.location.reload()}>Reload page</button><Link to="/">Go to home</Link></div></main>;
  }
}
