import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const PropuestasMenu = () => {
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
      className={`nav-propuestas-menu ${isOpen ? 'active' : ''}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        ref={buttonRef}
        className="nav-link nav-link-button propuestas-text"
        onClick={handleToggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        Propuestas
      </button>
      <div className={`submenu ${isOpen ? 'active' : ''}`} role="menu">
        <Link
          to="/propuestas/recibidas"
          className="submenu-item"
          role="menuitem"
          data-menuitem="true"
          onClick={handleMenuItemClick}
        >
          Recibidas
        </Link>
        <Link
          to="/propuestas/enviadas"
          className="submenu-item"
          role="menuitem"
          data-menuitem="true"
          onClick={handleMenuItemClick}
        >
          Enviadas
        </Link>
      </div>
    </div>
  );
};

export default PropuestasMenu;
