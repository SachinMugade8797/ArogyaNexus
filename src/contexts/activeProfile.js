import { createContext, useContext } from 'react';

export const ProfileContext = createContext(null);

export function useActiveProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useActiveProfile must be used within ActiveProfileProvider.');
  return context;
}
