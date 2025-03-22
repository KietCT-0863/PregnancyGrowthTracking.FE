import PropTypes from 'prop-types';
import './ValidationErrors.scss';

/**
 * Component to display structured validation errors
 * 
 * @param {Object} props
 * @param {Object} props.errors - Object containing validation errors, where keys are field names
 *                                and values are either strings or arrays of error messages
 */
const ValidationErrors = ({ errors }) => {
  if (!errors || Object.keys(errors).length === 0) {
    return null;
  }

  return (
    <div className="validation-errors">
      {Object.entries(errors).map(([field, messages]) => (
        <div key={field} className="error-field">
          <div className="field-name">{field}</div>
          <div className="error-messages">
            {Array.isArray(messages)
              ? messages.map((message, idx) => (
                  <div key={`${field}-${idx}`} className="error-message">
                    {message}
                  </div>
                ))
              : (
                <div className="error-message">
                  {messages}
                </div>
              )
            }
          </div>
        </div>
      ))}
    </div>
  );
};

ValidationErrors.propTypes = {
  errors: PropTypes.object
};

export default ValidationErrors; 