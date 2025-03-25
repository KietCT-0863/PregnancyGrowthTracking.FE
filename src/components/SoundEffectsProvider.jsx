import React, { createContext, useContext, useState } from 'react';
import useGlobalSoundEffects from '../hooks/useGlobalSoundEffects';

// Create context for sound effects
export const SoundEffectsContext = createContext({
  enabled: true,
  toggleSounds: () => {},
});

// Hook to use sound effects context
export const useSoundEffects = () => useContext(SoundEffectsContext);

/**
 * Provider component that adds global sound effects
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Sound effects provider
 */
const SoundEffectsProvider = ({ children }) => {
  const [enabled, setEnabled] = useState(true);

  // Toggle sound effects on/off
  const toggleSounds = () => {
    setEnabled(prev => !prev);
  };

  // Apply global sound effects
  useGlobalSoundEffects({ enabled });

  return (
    <SoundEffectsContext.Provider value={{ enabled, toggleSounds }}>
      {children}
    </SoundEffectsContext.Provider>
  );
};

export default SoundEffectsProvider; 