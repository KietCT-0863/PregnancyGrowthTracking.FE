import React from 'react';
import { playUISound } from '../../utils/soundUtils';

/**
 * A button component that plays a sound when clicked
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.rest - Any other props to pass to the button
 * @returns {JSX.Element} Button with sound effect
 */
const SoundButton = ({ children, onClick, className = '', ...rest }) => {
  const handleClick = (e) => {
    playUISound();
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={`sound-button ${className}`}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </button>
  );
};

export default SoundButton; 