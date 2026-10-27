import { useMemo, useState } from 'react';
import { ProfileContext } from './activeProfile';

const profiles = [
  { id: 'me', label: 'Me', name: 'Rahul K.', color: 'teal' },
  { id: 'mother', label: 'Mother', name: 'Sunita K.', color: 'violet' },
  { id: 'son', label: 'Son', name: 'Aarav K.', color: 'amber' },
];
export function ActiveProfileProvider({ children }) {
  const [activeProfileId, setActiveProfileId] = useState(() => {
    const saved = window.localStorage.getItem('arogyanexus.activeProfile');
    return profiles.some((profile) => profile.id === saved) ? saved : 'me';
  });
  const activeProfile = profiles.find((profile) => profile.id === activeProfileId) || profiles[0];
  const value = useMemo(() => ({
    profiles,
    activeProfile,
    setActiveProfile(id) {
      if (!profiles.some((profile) => profile.id === id)) return;
      window.localStorage.setItem('arogyanexus.activeProfile', id);
      setActiveProfileId(id);
    },
  }), [activeProfile]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
