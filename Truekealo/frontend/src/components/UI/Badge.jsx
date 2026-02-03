import React from 'react';
import '../../styles/ui-components.css';

const Badge = ({ children, variant = 'default', size = 'small', className = '', ...props }) => {
  return (
    <span className={`ui-badge ui-badge--${variant} ui-badge--${size} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
