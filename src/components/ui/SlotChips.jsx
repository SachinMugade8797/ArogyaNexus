export default function SlotChips({ slots, value, onChange, label = 'Available appointment times' }) {
  return <fieldset className="patient-slot-fieldset"><legend>{label}</legend><div className="patient-slot-chips">{slots.map((slot) => <label key={slot} className={value === slot ? 'selected' : ''}><input type="radio" name="appointment-slot" value={slot} checked={value === slot} onChange={() => onChange(slot)} /><span>{slot}</span></label>)}</div></fieldset>;
}
