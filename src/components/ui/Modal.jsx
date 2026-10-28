import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ title, children, onClose, className = '' }) {
  useEffect(() => { const close = (event) => { if (event.key === 'Escape') onClose?.(); }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, [onClose]);
  return <div className="record-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}><section className={`record-modal ${className}`} role="dialog" aria-modal="true" aria-labelledby="record-modal-title"><header><h2 id="record-modal-title">{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog"><X size={19}/></button></header>{children}</section></div>;
}
export function ConfirmDialog({ title, message, confirmText = 'Confirm', onCancel, onConfirm, busy = false }) {
  return <Modal title={title} onClose={onCancel} className="record-confirm-modal"><p>{message}</p><footer><button type="button" className="patient-button secondary" onClick={onCancel}>Cancel</button><button type="button" className="patient-button danger" disabled={busy} onClick={onConfirm}>{busy ? 'Please wait…' : confirmText}</button></footer></Modal>;
}
