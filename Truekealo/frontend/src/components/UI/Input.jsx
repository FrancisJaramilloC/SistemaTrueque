import React from 'react';
import '../../styles/ui-components.css';

const Input = ({ 
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`ui-input-group ${className}`}>
      {label && (
        <label className="ui-input-label">
          {label}
          {required && <span className="ui-required">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`ui-input ${error ? 'ui-input--error' : ''}`}
        {...props}
      />
      {(error || helperText) && (
        <span className={`ui-input-helper ${error ? 'ui-input-helper--error' : ''}`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
};

export default Input;
