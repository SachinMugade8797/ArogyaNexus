import { useEffect, useState } from 'react';

export function Textarea(props) { return <textarea {...props} className={`appointment-modal-field ${props.className || ''}`} />; }
export function DatePicker({ value, onChange, min }) { return <input className="appointment-modal-field" type="date" value={value} min={min} onChange={(event) => onChange(event.target.value)} />; }
export function SlotChips({ slots, value, onChange }) { return <div className="appointment-slot-chips">{slots.map((slot) => <button key={slot.startsAt} type="button" className={value === slot.startsAt ? 'selected' : ''} onClick={() => onChange(slot.startsAt)}>{new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' }).format(new Date(slot.startsAt))}</button>)}</div>; }
export function Autocomplete({ value, onChange, search, onSelect, placeholder = 'Search patients' }) {
  const [results, setResults] = useState([]);
  useEffect(() => { let active = true; if (value.trim().length >= 2) search(value).then((items) => { if (active) setResults(items); }).catch(() => setResults([])); else setResults([]); return () => { active = false; }; }, [value, search]);
  return <div className="appointment-autocomplete"><input className="appointment-modal-field" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />{results.length > 0 && <div className="appointment-autocomplete-results">{results.map((patient) => <button type="button" key={patient.id} onClick={() => { onSelect(patient); setResults([]); }}>{patient.name} <small>{patient.age}, {patient.gender} · Last visit {new Date(patient.lastVisit).toLocaleDateString('en-IN')}</small></button>)}</div>}</div>;
}
