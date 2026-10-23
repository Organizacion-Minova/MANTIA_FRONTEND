import "../../styles/variables.css";
import "../../styles/index.css";
import TopbarPublic from "../../components/layout/TopbarPublic.jsx";
import FooterPublic from "../../components/layout/FooterPublic.jsx";
import { useState, useEffect, useRef } from "react";
import AccessibilityPanel from "../../components/accessibility/AccessibilityPanel";

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

const icons = {
  chevLeft: "M15 6l-6 6 6 6",
  chevRight: "M9 6l6 6-6 6",
  gear: "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M12 3v2.2 M12 18.8V21 M21 12h-2.2 M5.2 12H3 M18.4 5.6l-1.5 1.5 M7.1 16.9l-1.5 1.5 M18.4 18.4l-1.5-1.5 M7.1 7.1 5.6 5.6",
  boxes: "M4 8l8-4 8 4v8l-8 4-8-4V8z M4 8l8 4 8-4 M12 12v8",
  industry: "M4 21V10l6 4V10l6 4V4h4v17H4z",
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
  const timerRef = useRef(null);
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
      <TopbarPublic />

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
      <AccessibilityPanel />

      <FooterPublic />
    </div>
  );
}