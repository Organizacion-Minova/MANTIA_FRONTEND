/* =====================================================================
   MANTIA IA · Widget de chat (React)
   Uso:
     import IAMantia from './IA_Mantia';
     <IAMantia onSend={async (texto, historial) => 'respuesta'} />

   onSend recibe el texto del usuario y el historial
   [{ role: 'user' | 'assistant', content: '...' }] y debe devolver
   (o resolver con) el texto de la respuesta, o { respuesta, acciones }
   cuando hay acciones de administrador por confirmar. Ahí conectas tu backend.
   Requiere IA_Mantia.css, Font Awesome 6 y las fuentes Archivo + Barlow.
   ===================================================================== */
import { Fragment, useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { esRutaPermitida, sugerenciasPorPantalla } from '../../utils/sugerenciasIA';
import TarjetaAccion from './TarjetaAccion.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { avatarPorDefecto } from '../../utils/avatar';
import { actualizar, asegurarUsuario, nuevoId, obtenerEstado, suscribir } from './chatStore.js';


const hora = () =>
  new Date().toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });

// Convierte el historial visible en el formato que espera el backend
const aHistorial = (mensajes) =>
  mensajes
    .filter((m) => !m.bienvenida && !m.escribiendo && !m.excluir)
    .map((m) => ({ role: m.rol === 'user' ? 'user' : 'assistant', content: m.texto }));

// Renderiza **negrita** dentro de un fragmento de texto.
const conNegrita = (texto, clave) =>
  texto.split(/\*\*(.+?)\*\*/g).map((parte, j) => (j % 2 ? <b key={`${clave}-${j}`}>{parte}</b> : parte));

// Renderiza **negrita**, saltos de línea y enlaces [texto](/ruta) como elementos de React.
// Los enlaces solo funcionan si la ruta está en la lista permitida (utils/sugerenciasIA.js);
// si la IA escribe otra ruta, se muestra solo el texto. No usa dangerouslySetInnerHTML (sin XSS).
function Texto({ children, onIr }) {
  return String(children)
    .split('\n')
    .map((linea, i) => (
      <Fragment key={i}>
        {i > 0 && <br />}
        {linea.split(/(\[[^\]]+\]\([^)\s]+\))/g).map((trozo, j) => {
          const enlace = trozo.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
          if (!enlace) return <Fragment key={j}>{conNegrita(trozo, j)}</Fragment>;

          const [, etiqueta, ruta] = enlace;
          if (!esRutaPermitida(ruta)) return <Fragment key={j}>{etiqueta}</Fragment>;

          return (
            <button key={j} type="button" className="mc-link" onClick={() => onIr(ruta)} title={etiqueta}>
              {etiqueta} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          );
        })}
      </Fragment>
    ));
}

export default function IAMantia({
  titulo = 'Asistente MANTIA',
  estado = 'en línea',
  placeholder = 'Pregúntale algo a MANTIA IA…',
  bienvenida = '¡Hola! Soy **MANTIA IA**. Puedo consultar máquinas, equipos, herramientas, gases, uso diario, inspecciones y alertas, y explicarte cómo usar la plataforma. Solo respondo preguntas sobre MANTIA.',
  chips, // opcional: si no se pasa, las sugerencias dependen de la pantalla actual
  abiertoInicial = false,
  onSend = async () => 'Aún no hay un backend conectado. Pasa la prop onSend a <IAMantia />.',
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  // Misma foto (o avatar con iniciales) que se ve en el header y en el perfil de la página
  const fotoPerfil = usuario?.photo_url || avatarPorDefecto(`${usuario?.name ?? ''} ${usuario?.last_name ?? ''}`);
  const idUsuario = usuario?.id ?? usuario?.email ?? null;
  const sugerencias = chips ?? sugerenciasPorPantalla(pathname);

  // La conversación vive en chatStore (fuera del componente): no se pierde al cambiar de página
  const { mensajes: guardados, abierto, sinLeer, valor, enviando, pantallaUltimaPregunta } =
    useSyncExternalStore(suscribir, obtenerEstado);

  const crearBienvenida = () => ({
    id: nuevoId(), rol: 'ia', texto: bienvenida, hora: hora(), bienvenida: true,
  });
  // Mientras no haya mensajes guardados se muestra la bienvenida
  const bienvenidaInicial = useMemo(
    () => ({ id: 0, rol: 'ia', texto: bienvenida, hora: hora(), bienvenida: true }),
    [bienvenida]
  );
  const conBienvenida = useCallback(
    (s) => (s.mensajes.length ? s.mensajes : [bienvenidaInicial]),
    [bienvenidaInicial]
  );
  const mensajes = guardados.length ? guardados : [bienvenidaInicial];

  const setAbierto = useCallback(
    (v) => actualizar((p) => ({ abierto: typeof v === 'function' ? v(p.abierto) : v })),
    []
  );

  const mensajesRef = useRef(null);
  const textareaRef = useRef(null);

  // Se muestran al empezar y cada vez que el usuario cambia de pantalla
  const mostrarChips = !enviando && pathname !== pantallaUltimaPregunta;

  // Si entra otro usuario, la conversación empieza de cero
  useEffect(() => {
    asegurarUsuario(idUsuario);
  }, [idUsuario]);

  // Solo la primera vez (sin conversación guardada) se respeta abiertoInicial
  useEffect(() => {
    if (abiertoInicial && obtenerEstado().mensajes.length === 0) actualizar({ abierto: true, sinLeer: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lleva al usuario a la pantalla del enlace. En celular se cierra el chat para que vea la página.
  const irA = useCallback(
    (ruta) => {
      navigate(ruta);
      if (window.matchMedia('(max-width: 600px)').matches) setAbierto(false);
    },
    [navigate, setAbierto]
  );

  // Al abrir: quita el badge y enfoca el campo de texto
  useEffect(() => {
    if (abierto) {
      if (obtenerEstado().sinLeer) actualizar({ sinLeer: false });
      textareaRef.current?.focus();
    }
  }, [abierto]);

  // Escape cierra el chat mientras está abierto
  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e) => e.key === 'Escape' && setAbierto(false);
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [abierto, setAbierto]);

  // Scroll al último mensaje
  useEffect(() => {
    const el = mensajesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [guardados, abierto]);

  // El textarea crece con el texto (máximo 96px)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 96) + 'px';
  }, [valor]);

  const enviar = useCallback(
    async (texto) => {
      texto = (texto || '').trim();
      const actual = obtenerEstado();
      if (!texto || actual.enviando) return;

      const historial = aHistorial(conBienvenida(actual));
      const idUser = nuevoId();
      const idIA = nuevoId();

      actualizar((prev) => ({
        enviando: true,
        pantallaUltimaPregunta: pathname,
        valor: '',
        mensajes: [
          ...conBienvenida(prev),
          { id: idUser, rol: 'user', texto, hora: hora() },
          { id: idIA, rol: 'ia', texto: '', hora: hora(), escribiendo: true },
        ],
      }));

      // Si el usuario cambia de página mientras la IA responde, la respuesta igual llega al almacén
      try {
        const resultado = await onSend(texto, historial, pathname);
        // onSend puede devolver solo el texto o { respuesta, acciones } (acciones de administrador)
        const { respuesta, acciones = [] } =
          typeof resultado === 'object' && resultado !== null ? resultado : { respuesta: resultado };
        actualizar((prev) => ({
          mensajes: prev.mensajes.map((m) =>
            m.id === idIA ? { ...m, texto: String(respuesta), acciones, escribiendo: false } : m
          ),
        }));
      } catch (error) {
        actualizar((prev) => ({
          mensajes: prev.mensajes.map((m) => {
            if (m.id === idIA)
              return { ...m, texto: error?.message || 'No pude responder en este momento. Intenta de nuevo.', escribiendo: false, excluir: true };
            if (m.id === idUser) return { ...m, excluir: true };
            return m;
          }),
        }));
      } finally {
        actualizar({ enviando: false });
        textareaRef.current?.focus();
      }
    },
    [onSend, pathname, conBienvenida]
  );

  const limpiar = () => {
    actualizar({ mensajes: [crearBienvenida()], pantallaUltimaPregunta: null, acciones: {} });
  };

  const alTeclear = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar(valor);
    }
  };

  return (
    <div id="mantia-chat">
      {/* Botón flotante */}
      <button
        type="button"
        className={'mc-toggle' + (enviando ? ' mc-hablando' : '')}
        aria-label="Abrir asistente"
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
      >
        <span className="mc-orbit mc-orbit1" />
        <span className="mc-orbit mc-orbit2" />
        <span className="mc-bot" aria-hidden="true">
          <span className="mc-face">
            <span className="mc-eye" />
            <span className="mc-eye" />
          </span>
          <span className="mc-casco">
            <span className="mc-lampara" />
          </span>
        </span>
        <span className="mc-toggle-label">
          <strong>MANTIA IA</strong>
          <small>Pregúntame algo</small>
        </span>
        <span className="mc-online" />
        {sinLeer && <span className="mc-badge">1</span>}
      </button>

      {/* Ventana */}
      <div className={'mc-win' + (abierto ? ' open' : '')} role="dialog" aria-label="Chat MANTIA IA">
        <div className="mc-header">
          <div className="mc-avatar"><i className="fa-solid fa-robot" /></div>
          <div className="mc-info">
            <h4>{titulo}</h4>
            <p><span className="mc-dot" /> <span>{estado}</span></p>
          </div>
          <div className="mc-actions">
            <button type="button" title="Limpiar conversación" onClick={limpiar}>
              <i className="fa-solid fa-trash-can" />
            </button>
            <button type="button" className="mc-cerrar" title="Cerrar" aria-label="Cerrar chat" onClick={() => setAbierto(false)}>
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        </div>

        <div className="mc-messages" aria-live="polite" ref={mensajesRef}>
          {mensajes.map((m) => (
            <div key={m.id} className={`mc-row ${m.rol}`}>
              <div className={`mc-icon ${m.rol}`}>
                {m.rol === 'user' ? (
                  <img src={fotoPerfil} alt={usuario?.name || 'Tú'} />
                ) : (
                  <i className="fa-solid fa-robot" />
                )}
              </div>
              <div>
                <div className="mc-bubble">
                  {m.escribiendo ? (
                    <span className="mc-typing"><span /><span /><span /></span>
                  ) : (
                    <Texto onIr={irA}>{m.texto}</Texto>
                  )}
                </div>
                {m.acciones?.map((accion) => (
                  <TarjetaAccion key={accion.id} accion={accion} />
                ))}
                <div className="mc-time">{m.hora}</div>
              </div>
            </div>
          ))}
        </div>

        {mostrarChips && (
          <div className="mc-chips">
            {sugerencias.map((texto) => (
              <button type="button" key={texto} className="mc-chip" onClick={() => enviar(texto)}>
                {texto}
              </button>
            ))}
          </div>
        )}

        <div className="mc-input-area">
          <textarea
            ref={textareaRef}
            rows={1}
            value={valor}
            placeholder={placeholder}
            onChange={(e) => actualizar({ valor: e.target.value })}
            onKeyDown={alTeclear}
          />
          <button
            type="button"
            className="mc-send"
            title="Enviar"
            disabled={enviando}
            onClick={() => enviar(valor)}
          >
            <i className="fa-solid fa-paper-plane" />
          </button>
        </div>
      </div>
    </div>
  );
}