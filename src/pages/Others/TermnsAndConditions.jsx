
import "../../styles/terms.css";
import "../../styles/Components.modules.css";
import { Link } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout.jsx";
import { useEffect, useState } from "react";
import { PageWelcome } from "../../components/common/welcome"; 



const secciones = [
  { id: "general", titulo: "Disposiciones generales" },
  { id: "servicio", titulo: "Descripción del servicio" },
  { id: "cuentas", titulo: "Cuentas y acceso" },
  { id: "uso", titulo: "Uso permitido" },
  { id: "propiedad", titulo: "Propiedad intelectual" },
  { id: "datos", titulo: "Información registrada" },
  { id: "disponibilidad", titulo: "Disponibilidad del servicio" },
  { id: "seguridad", titulo: "Seguridad y mediciones" },
  { id: "responsabilidad", titulo: "Responsabilidades" },
  { id: "privacidad", titulo: "Protección de datos" },
  { id: "cambios", titulo: "Modificaciones" },
  { id: "contacto", titulo: "Contacto" },
];

function TermnsAndConditions() {
  const [seccionActiva, setSeccionActiva] = useState("general");
  const Layout = PublicLayout;

  useEffect(() => {
    const elementos = secciones
      .map((seccion) => document.getElementById(seccion.id))
      .filter(Boolean);

    if (!("IntersectionObserver" in window)) {
      return undefined;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        const visibles = entradas
          .filter((entrada) => entrada.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );

        if (visibles.length > 0) {
          setSeccionActiva(visibles[0].target.id);
        }
      },
      {
        rootMargin: "-15% 0px -70% 0px",
        threshold: 0,
      }
    );

    elementos.forEach((elemento) => observador.observe(elemento));

    return () => observador.disconnect();
  }, []);

  return (
    <Layout>

      
    <div className="mt-legal">
      <div className="mt-legal__encabezado">
        {/* //rutas */}
        <div className="mt-legal__ruta">
          <Link to="/">Inicio</Link>
          <span aria-hidden="true">/</span>
          <span>Documentación legal</span>
        </div>

        <div className="mt-legal__titulo-fila">
          <PageWelcome
            titulo="Términos y condiciones"
            descripcion="Condiciones de acceso y uso de MANTIA CM. Documentación versión 1.0"
          />
        </div>

        <div className="mt-legal__metadatos">
          <span>Última actualización: [22/10/2026]</span>
          <span aria-hidden="true">•</span>
          <span>12 secciones</span>
        </div>
      </div>

      <div className="mt-legal__aviso">
        <span className="mt-legal__aviso-icono" aria-hidden="true">
          i
        </span>

        <p>
          Este documento establece las condiciones generales para
          utilizar la plataforma. Lee sus disposiciones antes de
          acceder a las funcionalidades de MANTIA CM.
        </p>
      </div>

      <div className="mt-legal__grid">
        <aside className="mt-legal__indice">
          <div className="mt-legal__indice-encabezado">
            <h2>Contenido</h2>
            <span>{secciones.length}</span>
          </div>

          <nav aria-label="Índice de términos y condiciones">
            <ol>
              {secciones.map((seccion, index) => (
                <li key={seccion.id}>
                  <a
                    href={`#${seccion.id}`}
                    className={
                      seccionActiva === seccion.id
                        ? "mt-legal__enlace mt-legal__enlace--activo"
                        : "mt-legal__enlace"
                    }
                    aria-current={
                      seccionActiva === seccion.id
                        ? "location"
                        : undefined
                    }
                  >
                    <span className="mt-legal__numero">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span>{seccion.titulo}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="mt-legal__documento">
          <section id="general" className="mt-legal__seccion">
            <h2>1. Disposiciones generales</h2>

            <p>
              MANTIA CM es una plataforma destinada a apoyar la
              gestión del inventario, el seguimiento y el
              mantenimiento de activos, herramientas, equipos y
              máquinas relacionados con las operaciones del Centro
              Minero.
            </p>

            <p>
              Estos términos establecen las condiciones generales
              de acceso y utilización de la plataforma, sin
              perjuicio de las políticas institucionales y las
              disposiciones legales aplicables.
            </p>
          </section>

          <section id="servicio" className="mt-legal__seccion">
            <h2>2. Descripción del servicio</h2>

            <p>
              MANTIA CM permite gestionar registros de activos,
              ubicaciones, existencias, mantenimientos y otras
              funciones habilitadas por los responsables de la
              plataforma.
            </p>

            <p>
              Las funcionalidades disponibles pueden variar según
              el perfil y los permisos asignados a cada usuario.
            </p>
          </section>

          <section id="cuentas" className="mt-legal__seccion">
            <h2>3. Cuentas y acceso</h2>

            <p>
              Los usuarios deben proteger sus credenciales,
              utilizarlas de manera personal y notificar cualquier
              sospecha de acceso no autorizado.
            </p>

            <p>
              Los administradores asignarán permisos de acuerdo
              con las funciones y responsabilidades de cada usuario.
            </p>
          </section>

          <section id="uso" className="mt-legal__seccion">
            <h2>4. Uso permitido</h2>

            <p>
              La plataforma debe utilizarse para los fines
              autorizados de gestión de activos, inventario y
              mantenimiento.
            </p>

            <p>
              No está permitido acceder sin autorización a
              funciones restringidas, alterar registros de manera
              indebida, comprometer la seguridad del sistema o
              utilizar la plataforma para actividades ilícitas.
            </p>
          </section>

          <section id="propiedad" className="mt-legal__seccion">
            <h2>5. Propiedad intelectual</h2>

            <p>
              El código, la interfaz y los elementos gráficos
              originales de MANTIA CM estarán sujetos a los
              derechos de propiedad intelectual que correspondan.
            </p>

            <p>
              Los datos institucionales conservan la titularidad
              que legalmente les corresponda. Su incorporación
              a la plataforma no implica por sí misma una
              transferencia de propiedad.
            </p>
          </section>

          <section id="datos" className="mt-legal__seccion">
            <h2>6. Información registrada</h2>

            <p>
              Los usuarios deben procurar que la información que
              registran o modifican sea precisa, completa y esté
              actualizada, de acuerdo con sus responsabilidades.
            </p>

            <p>
              Los errores identificados deben reportarse o
              corregirse mediante los procedimientos autorizados.
            </p>
          </section>

          <section id="disponibilidad" className="mt-legal__seccion">
            <h2>7. Disponibilidad del servicio</h2>

            <p>
              El acceso puede verse afectado por labores de
              mantenimiento, actualizaciones, fallas técnicas
              u otras circunstancias que interrumpan temporalmente
              el servicio.
            </p>

            <p>
              Los usuarios deben seguir los procedimientos
              institucionales para reportar incidentes. No debe
              presumirse la existencia de copias de seguridad
              si no hay mecanismos efectivamente implementados.
            </p>
          </section>

          <section id="seguridad" className="mt-legal__seccion">
            <h2>8. Seguridad y mediciones</h2>

            <p>
              Los registros sobre inspecciones, mediciones y
              condiciones de los activos deben corresponder
              a los procedimientos y competencias aplicables.
            </p>

            <p>
              Las funciones informativas de la plataforma no
              sustituyen los instrumentos certificados, los
              protocolos de seguridad ni la intervención de
              personal competente cuando sean necesarios.
            </p>
          </section>

          <section id="responsabilidad" className="mt-legal__seccion">
            <h2>9. Responsabilidades</h2>

            <p>
              Los usuarios deben utilizar las funciones
              autorizadas, proteger sus credenciales y registrar
              información de acuerdo con sus obligaciones.
            </p>

            <p>
              Los administradores deben gestionar los permisos
              y atender los incidentes dentro del alcance de
              sus funciones. Las responsabilidades se determinarán
              conforme a las normas aplicables.
            </p>
          </section>

          <section id="privacidad" className="mt-legal__seccion">
            <h2>10. Protección de datos</h2>

            <p>
              El tratamiento de datos personales deberá realizarse
              de conformidad con la normativa colombiana aplicable
              y la política de privacidad de MANTIA CM.
            </p>

            {/* <Link
              to="/privacy"
              className="mt-legal__enlace-documento"
            >
              Consultar política de privacidad
              <span aria-hidden="true"> →</span>
            </Link> */}
          </section>

          <section id="cambios" className="mt-legal__seccion">
            <h2>11. Modificaciones</h2>

            <p>
              Estos términos podrán actualizarse ante cambios
              funcionales, operativos o normativos. La versión
              vigente deberá estar disponible para consulta.
            </p>

            <p>
              Cuando corresponda, las modificaciones se
              comunicarán mediante los canales establecidos
              y se solicitará aceptación expresa cuando
              legalmente sea necesario.
            </p>
          </section>

          <section id="contacto" className="mt-legal__seccion">
            <h2>12. Contacto</h2>

            <p>
              Para comunicar incidencias o formular consultas
              relacionadas con estos términos, utiliza los
              canales oficiales designados por los responsables
              de MANTIA CM.
            </p>

            <div className="mt-legal__contacto">
              <div>
                <span>Responsable de la plataforma</span>
                <p>Grupo Mantia CM</p>
              </div>

              <div>
                <span>Correo de contacto</span>
                <p>MantiaCM@gmail.com</p>
              </div>
            </div>
          </section>

           {/*<div className="mt-legal__acciones">
            <Link to="/privacy" className="mt-legal__boton-secundario">
              Política de privacidad
            </Link> 

            <Link to="/" className="mt-legal__boton-principal">
              Volver al inicio
            </Link>
          </div>*/}
        </article>
      </div>
    </div>
    </Layout>
  );
}

export default TermnsAndConditions;