import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { ActiveProfileProvider } from '../contexts/ActiveProfileContext';
import { useActiveProfile } from '../contexts/activeProfile';
import { getConsentDaysRemaining } from '../utils/consent';

function ProfileProbe() {
  const { activeProfile, setActiveProfile } = useActiveProfile();
  return <div><span data-testid="profile">{activeProfile.id}</span><button onClick={() => setActiveProfile('mother')}>Mother profile</button></div>;
}

describe('patient dashboard profile and consent helpers', () => {
  it('switches profiles and saves the selection in localStorage', async () => {
    window.localStorage.removeItem('arogyanexus.activeProfile');
    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => root.render(<ActiveProfileProvider><ProfileProbe /></ActiveProfileProvider>));
    expect(container.querySelector('[data-testid="profile"]').textContent).toBe('me');
    await act(async () => container.querySelector('button').click());
    expect(container.querySelector('[data-testid="profile"]').textContent).toBe('mother');
    expect(window.localStorage.getItem('arogyanexus.activeProfile')).toBe('mother');
    await act(async () => root.unmount());
  });

  it('counts down to the 30-day consent review and handles missing dates', () => {
    const now = new Date('2026-10-27T12:00:00Z').getTime();
    expect(getConsentDaysRemaining('2026-10-17T12:00:00Z', now)).toBe(20);
    expect(getConsentDaysRemaining('2026-09-01T12:00:00Z', now)).toBe(0);
    expect(getConsentDaysRemaining(null, now)).toBeNull();
  });
});
