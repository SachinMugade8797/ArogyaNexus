import { Check } from 'lucide-react';

export default function Stepper({ steps, currentStep }) {
  return <ol className="patient-stepper" aria-label="Appointment booking steps">{steps.map((step, index) => {
    const number = index + 1;
    const complete = number < currentStep;
    const current = number === currentStep;
    return <li key={step} className={`${complete ? 'complete' : ''}${current ? ' current' : ''}`} aria-current={current ? 'step' : undefined}><span>{complete ? <Check size={14} /> : number}</span><b>{step}</b></li>;
  })}</ol>;
}
