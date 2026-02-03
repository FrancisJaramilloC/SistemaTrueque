import React from 'react';
import '../../styles/ui-components.css';

const PageHeader = ({ 
  title, 
  subtitle, 
  action,
  className = '' 
}) => {
  return (
    <div className={`ui-page-header ${className}`}>
      <div className="ui-page-header__content">
        <h1 className="ui-page-header__title">{title}</h1>
        {subtitle && <p className="ui-page-header__subtitle">{subtitle}</p>}
      </div>
      {action && <div className="ui-page-header__action">{action}</div>}
    </div>
  );
};

export default PageHeader;
