import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const UserMenu = ({ userName, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsPinned(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsPinned(false);
        buttonRef.current?.focus();
      }

      if (isOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault();
        const items = containerRef.current?.querySelectorAll('[data-menuitem="true"]');
        if (!items || items.length === 0) return;
        const itemsArray = Array.from(items);
        const currentIndex = itemsArray.indexOf(document.activeElement);
        const nextIndex = event.key === 'ArrowDown'
          ? (currentIndex + 1 + itemsArray.length) % itemsArray.length
          : (currentIndex - 1 + itemsArray.length) % itemsArray.length;

        itemsArray[nextIndex]?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    setIsPinned((prev) => !prev);
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      setIsOpen(false);
    }
  };

  const handleMenuItemClick = () => {
    setIsOpen(false);
    setIsPinned(false);
  };

  return (
    <div
      ref={containerRef}
      className={`nav-user ${isOpen ? 'active' : ''}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        ref={buttonRef}
        className="user-name nav-link-button"
        onClick={handleToggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {userName}
      </button>
      <div className={`user-dropdown ${isOpen ? 'active' : ''}`} role="menu">
        <Link
          to="/perfil"
          className="dropdown-item"
          role="menuitem"
          data-menuitem="true"
          onClick={handleMenuItemClick}
        >
          Mi Perfil
        </Link>
        <Link
          to="/configuracion"
          className="dropdown-item"
          role="menuitem"
          data-menuitem="true"
          onClick={handleMenuItemClick}
        >
          Configuración
        </Link>
        <hr className="dropdown-divider" />
        <button
          type="button"
          onClick={() => {
            handleMenuItemClick();
            onLogout();
          }}
          className="dropdown-item logout-btn"
          role="menuitem"
          data-menuitem="true"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default UserMenu;
