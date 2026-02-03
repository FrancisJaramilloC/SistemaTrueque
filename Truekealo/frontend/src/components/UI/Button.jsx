import React from 'react';
import '../../styles/ui-components.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  ...props 
}) => {
  const baseClass = `ui-btn ui-btn--${variant} ui-btn--${size}`;
  
  return (
    <button
      className={`${baseClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
