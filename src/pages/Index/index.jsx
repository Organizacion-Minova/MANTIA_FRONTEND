
import "../../styles/variables.css";
import "../../styles/index.css";
import TopbarPublic from "../../components/layout/TopbarPublic.jsx";
import FooterPublic from "../../components/layout/FooterPublic.jsx";
import { useState, useEffect, useRef } from "react";
import AccessibilityPanel from "../../components/accessibility/AccessibilityPanel";



const CARPETA = "Mina";


const modulos = import.meta.glob(
  "../../assets/img/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}",
  {
    eager: true,
    import: "default",
  }
);


const fotosPorNombre = Object.fromEntries(
  Object.entries(modulos)
    .filter(([ruta]) =>
      ruta.toLowerCase().includes(`/img/${CARPETA.toLowerCase()}/`)
    )
    .map(([ruta, url]) => {
      const nombre = ruta
        .split("/")
        .pop()
        .replace(/\.[^.]+$/, "")
        .trim()
        .toLowerCase();

      return [nombre, url];
    })
);


const slides = [
  {
    image: "mina 1",
    tag: "Inspecciones",
    tagIcon: "gear",
    heading: "Inspección y Control de Equipos Mineros",
    text: "Registre inspecciones, verifique las condiciones de los equipos y mantenga un seguimiento organizado de su estado operativo.",
  },
  {
    image: "mina 2",
    tag: "Uso Diario",
    tagIcon: "boxes",
    heading: "Control del Uso de Maquinaria y Equipos",
    text: "Consulte y registre el uso diario de los equipos, sus tiempos de operación, responsables y novedades durante las actividades mineras.",
  },
  {
    image: "mina 3",
    tag: "Seguridad Minera",
    tagIcon: "shield",
    heading: "Registro y Seguimiento de Mediciones de Gases",
    text: "Registre las mediciones de gases en las áreas mineras, consulte sus resultados y compare los valores para facilitar el seguimiento de las condiciones ambientales.",
  },
  {
    image: "mina 4",
    tag: "Gestión Digital",
    tagIcon: "industry",
    heading: "Información Minera Centralizada y Organizada",
    text: "Gestione los registros, consulte la información de máquinas, equipos y herramientas, y facilite el seguimiento de las actividades de mantenimiento.",
  },
  {
    image: "mina 6",
    tag: "Máquinas",
    tagIcon: "gear",
    heading: "Administración y Control de Máquinas Mineras",
    text: "Centralice la información de las máquinas, consulte sus características, categorías, ubicaciones y estados para facilitar su administración y seguimiento.",
  },
  {
    image: "mina 5",
    tag: "Herramientas",
    tagIcon: "boxes",
    heading: "Gestión y Organización de Herramientas",
    text: "Administre el inventario de herramientas, consulte sus características, ubicaciones y disponibilidad para mantener organizada la información de los recursos mineros.",
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

// Componente para dibujar los iconos.
const Icon = ({ name, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={icons[name] || ""} />
  </svg>
);

const AUTOPLAY_MS = 5500;

export default function MantiaInicio() {
  const [current, setCurrent] = useState(0);

  const timerRef = useRef(null);

  const total = slides.length;

  // Reiniciar el temporizador automático.
  const resetAuto = () => {
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % total);
    }, AUTOPLAY_MS);
  };

  // Iniciar y limpiar el temporizador.
  useEffect(() => {
    resetAuto();

    return () => clearInterval(timerRef.current);
  }, []);

  // Cambiar a la diapositiva anterior o siguiente.
  const changeSlide = (dir) => {
    setCurrent((c) => (c + dir + total) % total);

    resetAuto();
  };

  // Ir directamente a una diapositiva.
  const goTo = (i) => {
    setCurrent(i);

    resetAuto();
  };

  return (
    <div
      className="mt-app"
      style={{
        "--slide-index": current,
        "--slide-total": total,
      }}
    >
      <TopbarPublic />

      <main className="mt-main">
        <section className="mt-carousel">

          <div className="mt-slides-track">
            {slides.map((s, i) => {
              // Buscar la fotografía por su nombre.
              const foto = fotosPorNombre[s.image] || null;

              return (
                <div className="mt-slide" key={s.heading}>

                  <div
                    className={`mt-slide-bg${foto ? " con-foto" : ""}`}
                    style={
                      foto
                        ? {
                            backgroundImage: `url("${foto}")`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                          }
                        : undefined
                    }
                  />

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
              );
            })}
          </div>

          {/* Botón anterior */}
          <button
            className="mt-carousel-btn prev"
            onClick={() => changeSlide(-1)}
            aria-label="Anterior"
          >
            <Icon name="chevLeft" />
          </button>

          {/* Botón siguiente */}
          <button
            className="mt-carousel-btn next"
            onClick={() => changeSlide(1)}
            aria-label="Siguiente"
          >
            <Icon name="chevRight" />
          </button>

          {/* Indicadores y contador alineados */}
          <div className="mt-carousel-navigation">

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

            <div className="mt-counter">
              {current + 1} / {total}
            </div>

          </div>

        </section>
      </main>

      <AccessibilityPanel />

      <FooterPublic />
    </div>
  );
}
