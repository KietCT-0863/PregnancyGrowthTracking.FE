import { Link } from 'react-router-dom';
import { playUISound } from '../../utils/soundUtils';

/**
 * A Link component that plays a sound when clicked
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Link content
 * @param {string} props.to - Link destination
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.rest - Any other props to pass to the Link
 * @returns {JSX.Element} Link with sound effect
 */
const SoundLink = ({ children, to, onClick, className = '', ...rest }) => {
  const handleClick = (e) => {
    playUISound();
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link
      to={to}
      className={`sound-link ${className}`}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </Link>
  );
};

export default SoundLink; 