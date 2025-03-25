import { useCallback } from 'react';
import { playUISound } from '../utils/soundUtils';

/**
 * Custom hook to add sound effects to UI elements
 * @returns {Object} Object containing callbacks for various UI interactions with sound
 */
const useSoundEffect = () => {
  // Create a callback for click events that will play the UI sound
  const withSound = useCallback((callback) => {
    return (e) => {
      playUISound();
      if (callback) {
        callback(e);
      }
    };
  }, []);

  // Enhanced navigation functions for common use cases
  const soundNavigation = useCallback((navigate, path) => {
    return () => {
      playUISound();
      navigate(path);
    };
  }, []);

  // Button click with sound
  const handleButtonClick = useCallback((callback) => {
    return (e) => {
      playUISound();
      if (callback) {
        callback(e);
      }
    };
  }, []);

  return {
    withSound,
    soundNavigation,
    handleButtonClick,
    playUISound
  };
};

export default useSoundEffect; 