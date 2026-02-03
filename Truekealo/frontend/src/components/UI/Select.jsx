import React from 'react';
import '../../styles/ui-components.css';

const Select = ({
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  required = false,
  placeholder = 'Selecciona una opción',
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
      <select
        value={value}
        onChange={onChange}
        className={`ui-select ${error ? 'ui-input--error' : ''}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options && options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {(error || helperText) && (
        <span className={`ui-input-helper ${error ? 'ui-input-helper--error' : ''}`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
};

export default Select;
