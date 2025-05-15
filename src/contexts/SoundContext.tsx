
import React, { createContext, useContext, ReactNode } from 'react';
import { useSoundEffects } from '@/hooks/use-sound-effects';

interface SoundContextType {
  playSound: (type: 'wave' | 'droplet' | 'bubble') => void;
  toggleSounds: () => void;
  soundsEnabled: boolean;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
  const soundEffects = useSoundEffects();

  return (
    <SoundContext.Provider value={soundEffects}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  
  return context;
}
