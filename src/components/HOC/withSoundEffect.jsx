import React from 'react';
import { playUISound } from '../../utils/soundUtils';

/**
 * Higher-Order Component to add sound effects to interactive elements
 * @param {React.ComponentType} Component - The component to enhance with sound effects
 * @returns {React.ComponentType} Enhanced component with sound effects
 */
const withSoundEffect = (Component) => {
  const EnhancedComponent = (props) => {
    // Create enhanced onClick handler
    const enhancedProps = { ...props };
    
    if (typeof props.onClick === 'function') {
      enhancedProps.onClick = (e) => {
        playUISound();
        props.onClick(e);
      };
    } else if (props.to || props.href) {
      // For Link or a components
      enhancedProps.onClick = (e) => {
        playUISound();
        if (props.onClick) {
          props.onClick(e);
        }
      };
    }
    
    return <Component {...enhancedProps} />;
  };

  // For debugging purposes
  EnhancedComponent.displayName = `withSoundEffect(${Component.displayName || Component.name || 'Component'})`;
  
  return EnhancedComponent;
};

export default withSoundEffect; 