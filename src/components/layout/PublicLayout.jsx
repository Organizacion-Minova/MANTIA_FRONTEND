import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "../../styles/variables.css";
import "../../styles/index.css";

const navLinks = [
  { texto: "Inicio", ruta: "/" },
  { texto: "Acerca de", ruta: "/about" },
  { texto: "Ayuda", ruta: "/help" },
];

const icons = {
  login: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M10 17l5-5-5-5 M15 12H3",
  phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.8 2.3z",
  mail: "M4 4h16v16H4V4z M4 6l8 7 8-7",
  headset: "M4 13v-2a8 8 0 0 1 16 0v2 M4 13a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1v-5H4z M20 13a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1v-5h1z M9 20a3 3 0 0 0 3 1",
  pin: "M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21z M12 11.3a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z",
  chevRight: "M9 6l6 6-6 6",
  external: "M14 3h7v7 M21 3l-9 9 M4 5h6v0H4v15h15v-6",
};

const Icon = ({ name, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={icons[name] || ""} />
  </svg>
);

function PublicLayout({ children }) {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [footerInView, setFooterInView] = useState(false);
  const footerRef = useRef(null);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const updateFooterVisibility = () => {
      const rect = el.getBoundingClientRect();
      const visible = rect.top < window.innerHeight && rect.bottom > 0;
      setFooterInView(visible);
    };
    updateFooterVisibility();
    const observer = new IntersectionObserver(
      ([entry]) => setFooterInView(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    window.addEventListener("scroll", updateFooterVisibility, { passive: true });
    window.addEventListener("resize", updateFooterVisibility);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateFooterVisibility);
      window.removeEventListener("resize", updateFooterVisibility);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="mt-app">
      <header className="mt-header mt-header-solid">
        <img src="/mantia-logo.png" alt="MANTIA" className="mt-logo-img" />
        <div className="mt-right-nav">
          <nav className="mt-navlinks">
            {navLinks.map((l) => (
              <Link key={l.texto} to={l.ruta}>{l.texto}</Link>
            ))}
          </nav>
          {isAuthenticated ? (
            <button className="mt-login-btn" onClick={handleLogout}>
              <Icon name="login" size={15} />
              Cerrar sesión
            </button>
          ) : (
            <Link to="/login" className="mt-login-btn">
              <Icon name="login" size={15} />
              Iniciar sesión
            </Link>
          )}
        </div>
      </header>

      <main className="mt-main">{children}</main>

      <footer className={`mt-footer-full${footerInView ? " in-view" : ""}`} ref={footerRef}>
        <div className="mt-footer-top">
          <div className="mt-footer-col">
            <div className="mt-footer-logo-row">
              <img src="/mantia-logo.png" alt="MANTIA" className="mt-footer-logo-img" />
            </div>
            <p className="mt-footer-tagline">
              Sistema especializado en el mantenimiento de maquinaria de extracción y control de inventarios mineros.
            </p>
            <div className="mt-footer-icons">
              <button className="mt-footer-icon-btn" aria-label="Teléfono"><Icon name="phone" size={15} /></button>
              <button className="mt-footer-icon-btn" aria-label="Correo"><Icon name="mail" size={15} /></button>
              <button className="mt-footer-icon-btn" aria-label="Soporte"><Icon name="headset" size={15} /></button>
              <button className="mt-footer-icon-btn" aria-label="Ubicación"><Icon name="pin" size={15} /></button>
            </div>
          </div>

          <div className="mt-footer-col">
            <h4>Enlaces rápidos</h4>
            <ul className="mt-footer-linklist">
              {navLinks.map((l) => (
                <li key={l.texto}>
                  <Link to={l.ruta}>
                    <Icon name="chevRight" size={12} />
                    {l.texto}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/login">
                  <Icon name="chevRight" size={12} />
                  Iniciar sesión
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-footer-col">
            <h4>Centro de Operaciones</h4>
            <div className="mt-footer-contact-list">
              <div className="mt-footer-contact-row">
                <div className="mt-footer-contact-icon"><Icon name="pin" size={15} /></div>
                <div>
                  <strong>Centro Nacional Minero</strong>
                  <span>Sogamoso, Boyacá, Colombia</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-footer-col">
            <h4>Canales de Asistencia</h4>
            <div className="mt-footer-contact-list">
              <div className="mt-footer-contact-row">
                <div className="mt-footer-contact-icon"><Icon name="phone" size={15} /></div>
                <div>
                  <strong>Mesa de ayuda MANTIA</strong>
                  <span>320 5783729 (SENA)</span>
                </div>
              </div>
              <div className="mt-footer-contact-row">
                <div className="mt-footer-contact-icon"><Icon name="mail" size={15} /></div>
                <div>
                  <strong>Correo empresarial</strong>
                  <span>mantiadso@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-footer-cta">
          <Link to="/" className="mt-login-btn">
            Ir al inicio
            <Icon name="external" size={13} />
          </Link>
        </div>

        <div className="mt-footer-bottom">
          © {new Date().getFullYear()} MANTIA · Proyecto formativo SENA · Todos los derechos reservados
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;