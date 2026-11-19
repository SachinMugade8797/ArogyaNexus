import { useMemo, useState } from 'react';
import { ProfileContext } from './activeProfile';
import { useAuth } from './AuthContext';

export function ActiveProfileProvider({ children }) {
  let authUser = null;
  try {
    const auth = useAuth();
    authUser = auth?.user;
  } catch {
    // outside AuthProvider during unit testing
  }

  const patientName = authUser?.full_name || 'Sachin Shinde';

  const defaultProfiles = useMemo(
    () => [
      { id: 'me', label: 'Me', name: patientName, color: 'teal' },
      { id: 'mother', label: 'Mother', name: 'Sunita Shinde', color: 'violet' },
      { id: 'son', label: 'Son', name: 'Aarav Shinde', color: 'amber' },
    ],
    [patientName]
  );

  const [extraProfiles, setExtraProfiles] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('arogyanexus.extraProfiles') || '[]');
    } catch {
      return [];
    }
  });

  const allProfiles = useMemo(() => [...defaultProfiles, ...extraProfiles], [defaultProfiles, extraProfiles]);

  const [activeProfileId, setActiveProfileId] = useState(() => {
    const saved = window.localStorage.getItem('arogyanexus.activeProfile');
    return allProfiles.some((profile) => profile.id === saved) ? saved : 'me';
  });

  const activeProfile = allProfiles.find((profile) => profile.id === activeProfileId) || defaultProfiles[0];

  const value = useMemo(
    () => ({
      profiles: allProfiles,
      activeProfile,
      setActiveProfile(id, details) {
        if (!allProfiles.some((profile) => profile.id === id)) {
          if (!details) return;
          const extra = {
            id,
            label: details.relation || 'Family',
            name: details.name || 'Family member',
            relation: details.relation || 'Family',
            color: 'teal',
          };
          setExtraProfiles((current) => {
            const next = [...current.filter((item) => item.id !== id), extra];
            window.localStorage.setItem('arogyanexus.extraProfiles', JSON.stringify(next));
            return next;
          });
        }
        window.localStorage.setItem('arogyanexus.activeProfile', id);
        setActiveProfileId(id);
      },
    }),
    [activeProfile, allProfiles]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
