const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>🔄 Truekealo</h3>
          <p>Plataforma de intercambio de artículos</p>
        </div>

        <div className="footer-section">
          <h4>Enlaces</h4>
          <ul>
            <li><a href="/explorar">Explorar</a></li>
            <li><a href="/publicar">Publicar</a></li>
            <li><a href="/como-funciona">¿Cómo funciona?</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><a href="/terminos">Términos y Condiciones</a></li>
            <li><a href="/privacidad">Política de Privacidad</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contacto</h4>
          <p>contacto@truekealo.com</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Truekealo. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
