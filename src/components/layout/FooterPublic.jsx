import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const icons = {
  mail: "M4 4h16v16H4V4z M4 6l8 7 8-7",
  pin: "M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21z M12 11.3a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z",
};

function Icon({ name, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={icons[name]} />
    </svg>
  );
}

export default function FooterPublic() {
  const [footerInView, setFooterInView] = useState(false);
  const footerRef = useRef(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return undefined;

    const updateFooterVisibility = () => {
      const rect = footer.getBoundingClientRect();
      const visible = rect.top < window.innerHeight && rect.bottom > 0;
      setFooterInView(visible);
    };

    const observer = new IntersectionObserver(
      ([entry]) => setFooterInView(entry.isIntersecting),
      { threshold: 0.05 }
    );
    updateFooterVisibility();
    observer.observe(footer);
    window.addEventListener("scroll", updateFooterVisibility, {
      passive: true,
    });
    window.addEventListener("resize", updateFooterVisibility);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateFooterVisibility);
      window.removeEventListener("resize", updateFooterVisibility);
    };
  }, []);

  return (
    <footer
      className={`mt-footer-full${footerInView ? " in-view" : ""}`}
      ref={footerRef}
    >
      <div className="mt-footer-top">
        <div className="mt-footer-col">
          <div className="mt-footer-logo-row">
            <img
              src="src/assets/img/mantia-cm.jpg"
              alt="MANTIA"
              className="mt-footer-logo-img"
            />
          </div>
          <p className="mt-footer-tagline">
            Sistema web para control del inventario de máquinas, equipos,
            herramientas y gases. Enfocado también en el manejo de formatos y
            mantenimientos.
          </p>
        </div>

        <div className="mt-footer-col">
          <h4>Derechos de autor</h4>
          <span className="mt-footer-tagline">
            El software, su diseño y su código son propiedad de Mantia CM. Los
            datos que registras (Elementos, formatos, mediciones) siguen siendo
            de tu empresa.
          </span>
        </div>

        <div className="mt-footer-col">
          <h4>Términos y condiciones</h4>
          <ul className="mt-footer-linklist">
            <li>
              <Link to="/terms">Términos de uso</Link>
            </li>
          </ul>
        </div>

        <div className="mt-footer-col">
          <h4>Canales de Asistencia</h4>
          <div className="mt-footer-contact-list">
            <div className="mt-footer-contact-row">
              <div className="mt-footer-contact-icon">
                <Icon name="mail" size={15} />
              </div>
              <div>
                <strong>Correo de contacto</strong>
                <span>MantiaCM@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-footer-col">
          <h4>Centro de Operaciones</h4>
          <div className="mt-footer-contact-list">
            <div className="mt-footer-contact-row">
              <div className="mt-footer-contact-icon">
                <Icon name="pin" size={15} />
              </div>
              <div>
                <strong>Centro Nacional Minero</strong>
                <span>Sogamoso, Boyacá, Colombia</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-footer-bottom">
        © {new Date().getFullYear()} MANTIA · Mantenimiento e inventario de
        activos · Todos los derechos reservados
      </div>
    </footer>
  );
}
