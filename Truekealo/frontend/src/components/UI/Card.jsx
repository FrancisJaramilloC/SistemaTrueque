import React from 'react';
import '../../styles/ui-components.css';

const Card = ({ children, className = '', elevated = false, ...props }) => {
  return (
    <div
      className={`ui-card ${elevated ? 'ui-card--elevated' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
