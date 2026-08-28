import "../../styles/variables.css";
import "../../styles/index.css";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const slides = [
  {
    tag: "Mantenimiento",
    tagIcon: "gear",
    heading: "Gestión Inteligente de Equipos Mineros",
    text: "Optimice el mantenimiento preventivo y correctivo de su flota pesada con tecnología diseñada para el sector extractivo colombiano.",
  },
  {
    tag: "Inventario",
    tagIcon: "boxes",
    heading: "Control Total de Repuestos y Herramientas",
    text: "Monitoree stock subterráneo y de superficie en tiempo real, anticipe necesidades de reemplazo y evite paradas de línea.",
  },
  {
    tag: "Seguridad Minera",
    tagIcon: "shield",
    heading: "Monitoreo de Protocolos y Gases",
    text: "Garantice la integridad operacional en frentes de explotación bajo los estándares normativos de seguridad industrial.",
  },
  {
    tag: "Innovación SENA",
    tagIcon: "industry",
    heading: "Tecnología desde el Centro Nacional Minero",
    text: "Soluciones de software de alta precisión desarrolladas en Sogamoso, Boyacá, para transformar la industria minera.",
  },
];

const navLinks = [
  { texto: "Inicio", ruta: "/" },
  { texto: "Acerca de", ruta: "/about" },
  { texto: "Ayuda", ruta: "/help" },
];

const icons = {
  chevLeft: "M15 6l-6 6 6 6",
  chevRight: "M9 6l6 6-6 6",
  gear: "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M12 3v2.2 M12 18.8V21 M21 12h-2.2 M5.2 12H3 M18.4 5.6l-1.5 1.5 M7.1 16.9l-1.5 1.5 M18.4 18.4l-1.5-1.5 M7.1 7.1 5.6 5.6",
  boxes: "M4 8l8-4 8 4v8l-8 4-8-4V8z M4 8l8 4 8-4 M12 12v8",
  industry: "M4 21V10l6 4V10l6 4V4h4v17H4z",
  login: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M10 17l5-5-5-5 M15 12H3",
  phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.8 2.3z",
  mail: "M4 4h16v16H4V4z M4 6l8 7 8-7",
  pin: "M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21z M12 11.3a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z",
  headset: "M4 13v-2a8 8 0 0 1 16 0v2 M4 13a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1v-5H4z M20 13a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1v-5h1z M9 20a3 3 0 0 0 3 1",
  external: "M14 3h7v7 M21 3l-9 9 M4 5h6v0H4v15h15v-6",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
};

const Icon = ({ name, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={icons[name] || ""} />
  </svg>
);

const AUTOPLAY_MS = 5500;

export default function MantiaInicio() {
  const [current, setCurrent] = useState(0);
  const [footerInView, setFooterInView] = useState(false);
  const timerRef = useRef(null);
  const footerRef = useRef(null);
  const total = slides.length;

  const resetAuto = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % total);
    }, AUTOPLAY_MS);
  };

  useEffect(() => {
    resetAuto();
    return () => clearInterval(timerRef.current);
  }, []);

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

  const changeSlide = (dir) => {
    setCurrent((c) => (c + dir + total) % total);
    resetAuto();
  };

  const goTo = (i) => {
    setCurrent(i);
    resetAuto();
  };

  return (
    <div className="mt-app" style={{ "--slide-index": current, "--slide-total": total }}>

      <header className="mt-header">
        <img
      src="/mantia-logo.png"
      alt="MANTIA"
      className="mt-logo-img"
      />
<div className="mt-right-nav">
  <nav className="mt-navlinks">
    {navLinks.map((l, i) => (
      <Link key={l.texto} to={l.ruta} className={i === 0 ? "active" : ""}>{l.texto}</Link>
    ))}
  </nav>
  <Link to="/login" className="mt-login-btn">
    <Icon name="login" size={15} />
    Iniciar sesión
  </Link>
</div>
      </header>

      <main className="mt-main">
        <section className="mt-carousel">
          <div className="mt-slides-track">
            {slides.map((s, i) => (
              <div className="mt-slide" key={s.heading}>
                <div className="mt-slide-bg" />
                <div className="mt-slide-overlay">
                  {i === current && (
                    <div className="mt-slide-content" key={current}>
                      <div className="mt-slide-tag">
                        <Icon name={s.tagIcon} size={13} />
                        {s.tag}
                      </div>
                      <h2>{s.heading}</h2>
                      <p>{s.text}</p>
                      <button className="mt-login-btn">
                        <Icon name="login" size={15} />
                        Ingresar al sistema
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button className="mt-carousel-btn prev" onClick={() => changeSlide(-1)} aria-label="Anterior">
            <Icon name="chevLeft" />
          </button>
          <button className="mt-carousel-btn next" onClick={() => changeSlide(1)} aria-label="Siguiente">
            <Icon name="chevRight" />
          </button>

          <div className="mt-dots-wrap">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`mt-dot${i === current ? " active" : ""}${i < current ? " done" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Ir al slide ${i + 1}`}
              >
                <span className="fill" />
              </button>
            ))}
          </div>

          <div className="mt-counter">{current + 1} / {total}</div>
        </section>
      </main>

      <footer className={`mt-footer-full${footerInView ? " in-view" : ""}`} ref={footerRef}>
        <div className="mt-footer-top">
          <div className="mt-footer-col">
            <div className="mt-footer-logo-row">
          <img
          src="/mantia-logo.png"
          alt="MANTIA"
          className="mt-footer-logo-img"
          />
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
          <Link to="/login" className="mt-login-btn">
            <Icon name="login" size={15} />
            Iniciar sesión
          </Link>
        </div>

        <div className="mt-footer-bottom">
          © {new Date().getFullYear()} MANTIA · Proyecto formativo SENA · Todos los derechos reservados
        </div>
      </footer>
    </div>
  );
}