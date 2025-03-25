/**
 * Global UI sound effects for buttons and links
 * This script adds click sound effects to all interactive elements
 */
(function() {
  // Configuration
  const config = {
    soundFile: '/audio/ui-pop-sound-316482.mp3',
    volume: 0.3,
    selectors: [
      'button', 
      'a', 
      '.nav-link', 
      '.btn', 
      '.action-button', 
      '[role="button"]',
      '.clickable',
      '.navbar-item',
      '.sidebar-item',
      '.tab',
      '.header-action-button',
      '.user-button',
      '.dropdown-item',
      '.mobile-toggle',
      '.menu-item'
    ],
    excludeSelectors: [
      '.no-sound',
      '[disabled]',
      '.disabled'
    ],
    isEnabled: true
  };

  // Create audio element
  let audio = null;

  // Initialize the audio
  function initAudio() {
    audio = new Audio(config.soundFile);
    audio.volume = config.volume;
    
    // Preload the audio
    audio.load();
    
    // Allow multiple plays
    audio.onended = function() {
      this.currentTime = 0;
    };
  }

  // Play the sound
  function playSound() {
    if (!config.isEnabled || !audio) return;
    
    // Clone the audio to allow for multiple overlapping sounds
    const sound = audio.cloneNode();
    sound.volume = config.volume;
    
    // Play with error handling
    sound.play().catch(error => {
      console.error('Error playing UI sound:', error);
    });
  }

  // Handle click events
  function handleClick(event) {
    // Don't play for right-clicks
    if (event.button === 2) return;
    
    // Don't play for disabled elements
    if (event.currentTarget.disabled || 
        event.currentTarget.classList.contains('disabled') ||
        event.currentTarget.getAttribute('aria-disabled') === 'true') {
      return;
    }
    
    // Check if in exclude list
    for (const selector of config.excludeSelectors) {
      if (event.currentTarget.matches(selector)) {
        return;
      }
    }
    
    playSound();
  }

  // Add event listeners to all matching elements
  function addSoundToElements() {
    const elements = document.querySelectorAll(config.selectors.join(', '));
    elements.forEach(element => {
      element.addEventListener('click', handleClick);
    });
  }

  // Initialize everything on load
  function init() {
    initAudio();
    addSoundToElements();
    
    // Also handle dynamically added elements
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          setTimeout(addSoundToElements, 100);
        }
      });
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
  }

  // Public API
  window.UISound = {
    enable: function() {
      config.isEnabled = true;
    },
    disable: function() {
      config.isEnabled = false;
    },
    toggle: function() {
      config.isEnabled = !config.isEnabled;
      return config.isEnabled;
    },
    isEnabled: function() {
      return config.isEnabled;
    }
  };

  // Start when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(); 