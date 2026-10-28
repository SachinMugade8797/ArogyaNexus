import { AlertCircle, CheckCircle2, Info, LoaderCircle, XCircle } from 'lucide-react';
import '../../styles/patient-dashboard.css';
export { default as Stepper } from './Stepper';
export { default as SlotChips } from './SlotChips';

export function Card({ children, className = '', title, action, state, onRetry, emptyText = 'Nothing to show yet.' }) {
  return <section className={`patient-card ${className}`} aria-busy={state === 'loading'}>
    {(title || action) && <header className="patient-card-heading">{title && <h2>{title}</h2>}{action}</header>}
    {state === 'loading' ? <Skeleton /> : state === 'error' ? <ErrorState onRetry={onRetry} /> : state === 'empty' ? <EmptyState text={emptyText} /> : children}
  </section>;
}

export function StatusChip({ status, icon: Icon = Info }) {
  const tone = /confirmed|active|taken|approved/i.test(status) ? 'success' : /pending|due|upcoming/i.test(status) ? 'warning' : 'neutral';
  const StatusIcon = /confirmed|active|taken|approved/i.test(status) ? CheckCircle2 : /pending|due|upcoming/i.test(status) ? AlertCircle : Icon;
  return <span className={`patient-status ${tone}`}><StatusIcon size={14} aria-hidden="true" />{status}</span>;
}

export function Skeleton({ rows = 3 }) { return <div className="patient-skeleton" role="status" aria-label="Loading"><span className="skeleton-line wide" />{Array.from({ length: rows }, (_, i) => <span className="skeleton-line" key={i} />)}</div>; }
export function EmptyState({ text = 'Nothing here yet.' }) { return <div className="patient-state"><Info size={22} /><p>{text}</p></div>; }
export function ErrorState({ onRetry }) { return <div className="patient-state error"><XCircle size={22} /><p>We couldn’t load this section.</p>{onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}</div>; }
export function Avatar({ name = '', initials, size = 'md', className = '' }) { return <span className={`patient-avatar ${size} ${className}`} role="img" aria-label={name}>{initials || name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('')}</span>; }
export function Button({ children, variant = 'primary', className = '', ...props }) { return <button className={`patient-button ${variant} ${className}`} {...props}>{children}</button>; }
export function SkeletonIcon() { return <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />; }
