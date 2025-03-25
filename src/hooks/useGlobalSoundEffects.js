import { useEffect } from 'react';
import { playUISound } from '../utils/soundUtils';

/**
 * Hook to add sound effects to all clickable elements globally
 * @param {Object} options - Configuration options
 * @param {Array<string>} options.selectors - CSS selectors for elements to add sound to
 * @param {boolean} options.enabled - Whether sound effects are enabled
 */
const useGlobalSoundEffects = (options = {}) => {
  const {
    selectors = [
      'button', 
      'a', 
      '.nav-link', 
      '.btn', 
      '.action-button', 
      '.clickable',
      '[role="button"]',
      '.navbar-item',
      '.sidebar-item',
      '.tab'
    ],
    enabled = true
  } = options;

  useEffect(() => {
    if (!enabled) return;

    // Function to play sound
    const playSound = (e) => {
      // Don't play sound for disabled elements
      if (e.currentTarget.disabled || e.currentTarget.classList.contains('disabled')) {
        return;
      }
      
      // Prevent sound for right-clicks
      if (e.button === 2) return;
      
      playUISound();
    };

    // Select all elements matching the selectors
    const elements = document.querySelectorAll(selectors.join(', '));
    
    // Add event listeners
    elements.forEach(element => {
      element.addEventListener('click', playSound);
    });

    // Cleanup function
    return () => {
      elements.forEach(element => {
        element.removeEventListener('click', playSound);
      });
    };
  }, [enabled, selectors]);
};

export default useGlobalSoundEffects; 