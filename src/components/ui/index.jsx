import { AlertCircle, Ban, CheckCircle2, Clock3, Info, LoaderCircle, ShieldOff, XCircle } from 'lucide-react';
import '../../styles/patient-dashboard.css';
export { default as Stepper } from './Stepper';
export { default as SlotChips } from './SlotChips';
export { Modal, ConfirmDialog } from './Modal';
export { Tabs, DataTable, TagInput, Toggle, ProgressRing, Popover, Dropzone, FilePreviewModal, Drawer } from './PatientExtras';

export function Card({ children, className = '', title, action, state, onRetry, emptyText = 'Nothing to show yet.' }) {
  return <section className={`patient-card ${className}`} aria-busy={state === 'loading'}>
    {(title || action) && <header className="patient-card-heading">{title && <h2>{title}</h2>}{action}</header>}
    {state === 'loading' ? <Skeleton /> : state === 'error' ? <ErrorState onRetry={onRetry} /> : state === 'empty' ? <EmptyState text={emptyText} /> : children}
  </section>;
}

export function StatusChip({ status, icon: Icon = Info, tone: toneOverride }) {
  const key = String(status).toLowerCase();
  const tone = toneOverride || (/denied|missed/.test(key) ? 'danger' : /confirmed|active|taken|approved/.test(key) ? 'success' : /pending|due|upcoming/.test(key) ? 'warning' : 'neutral');
  const StatusIcon = /revoked|cancelled/.test(key) ? ShieldOff : /expired|completed/.test(key) ? Clock3 : /denied|missed/.test(key) ? Ban : /pending|due|upcoming/.test(key) ? AlertCircle : /confirmed|active|taken|approved/.test(key) ? CheckCircle2 : Icon;
  return <span className={`patient-status ${tone}`}><StatusIcon size={14} aria-hidden="true" />{status}</span>;
}

export function Skeleton({ rows = 3 }) { return <div className="patient-skeleton" role="status" aria-label="Loading"><span className="skeleton-line wide" />{Array.from({ length: rows }, (_, i) => <span className="skeleton-line" key={i} />)}</div>; }
export function EmptyState({ text = 'Nothing here yet.' }) { return <div className="patient-state"><Info size={22} /><p>{text}</p></div>; }
export function ErrorState({ onRetry }) { return <div className="patient-state error"><XCircle size={22} /><p>We couldn’t load this section.</p>{onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}</div>; }
export function Avatar({ name = '', initials, size = 'md', className = '' }) { return <span className={`patient-avatar ${size} ${className}`} role="img" aria-label={name}>{initials || name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('')}</span>; }
export function Button({ children, variant = 'primary', className = '', ...props }) { return <button className={`patient-button ${variant} ${className}`} {...props}>{children}</button>; }
export function SkeletonIcon() { return <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />; }
