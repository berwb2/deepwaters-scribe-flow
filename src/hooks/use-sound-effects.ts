
import { useState, useEffect } from 'react';

// Define sound types
type SoundType = 'wave' | 'droplet' | 'bubble';

export function useSoundEffects() {
  // Get initial state from localStorage
  const [soundsEnabled, setSoundsEnabled] = useState(() => {
    const saved = localStorage.getItem('deepwaters-sounds-enabled');
    return saved !== null ? JSON.parse(saved) : true; // Default to true
  });

  // Define audio objects
  const sounds = {
    wave: new Audio('/sounds/ocean-wave.mp3'),
    droplet: new Audio('/sounds/water-droplet.mp3'),
    bubble: new Audio('/sounds/soft-bubble.mp3')
  };

  // Update localStorage when preference changes
  useEffect(() => {
    localStorage.setItem('deepwaters-sounds-enabled', JSON.stringify(soundsEnabled));
  }, [soundsEnabled]);

  // Play sound function
  const playSound = (type: SoundType) => {
    if (soundsEnabled) {
      // Reset the audio to start position in case it's already playing
      sounds[type].currentTime = 0;
      sounds[type].play().catch(error => {
        // Handle potential error when browser blocks autoplay
        console.error('Error playing sound:', error);
      });
    }
  };

  // Toggle sounds on/off
  const toggleSounds = () => {
    setSoundsEnabled(prev => !prev);
  };

  return {
    playSound,
    toggleSounds,
    soundsEnabled
  };
}
