import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageWelcome, Searcher } from "../../components/common/welcome";
import { Boton } from "../../components/common/Button";
import { Select } from "../../components/common/forms.jsx";
import { obtenerNotificaciones, marcarComoLeida, marcarTodasComoLeidas } from "../../api/notificaciones";
import { GetMachine } from "../../api/machinesapi";
import { GetEquipments } from "../../api/Equipmentsapi";
import { obtenerMedicionesGases } from "../../api/gasMeasurement";
import { mapearNotificacionBackend, ETIQUETAS_CATEGORIA } from "../../utils/notificaciones";

// Nivel del backend (AlertaSistema) → cómo se ve en la tabla (mismas clases del diseño original)
const NIVELES = {
    danger: { clave: "grave", texto: "GRAVE", badge: "badge-grave", icono: "fa-solid fa-circle-exclamation" },
    warning: { clave: "importante", texto: "IMPORTANTE", badge: "badge-importante", icono: "fa-solid fa-triangle-exclamation" },
    info: { clave: "bien", texto: "BIEN", badge: "badge-bien", icono: "fa-solid fa-circle-check" },
};

// Pantalla a la que lleva cada tipo de alerta (botones "Escalar" y "Ver")
const RUTA_POR_CATEGORIA = {
    gas: "/gases",
    maquina: "/machines",
    equipo: "/equipment",
    herramienta: "/types/consumables",
    ubicacion: "/ubications",
    empresa: "/companies",
    categoria: "/machines/categoriesmachines",
    inspeccion: "/inspection",
};

const OPCIONES_NIVEL = [
    { valor: "", etiqueta: "Todos los niveles" },
    { valor: "danger", etiqueta: "Graves" },
    { valor: "warning", etiqueta: "Importantes" },
    { valor: "info", etiqueta: "Sin novedad" },
];

const OPCIONES_ESTADO = [
    { valor: "", etiqueta: "Atendidas y pendientes" },
    { valor: "sin-leer", etiqueta: "Pendientes" },
    { valor: "leidas", etiqueta: "Atendidas" },
];

const OPCIONES_CATEGORIA = [
    { valor: "", etiqueta: "Todas las categorías" },
    ...Object.entries(ETIQUETAS_CATEGORIA).map(([valor, etiqueta]) => ({ valor, etiqueta })),
];

function dentroDelRango(fechaISO, rango) {
    if (!rango) return true;
    const fecha = new Date(fechaISO);
    const ahora = new Date();
    if (rango === "hoy") return fecha.toDateString() === ahora.toDateString();
    if (rango === "7_dias") return ahora - fecha <= 7 * 24 * 60 * 60 * 1000;
    if (rango === "mes") return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
    if (rango === "anio") return fecha.getFullYear() === ahora.getFullYear();
    return true;
}

// Las alertas de gases dicen "Riesgo detectado en <ubicación>: ..."; de ahí se saca la ubicación
function ubicacionDe(mensaje = "") {
    const encontrada = mensaje.match(/ en ([^:]+):/);
    return encontrada ? encontrada[1].trim() : null;
}

function Alerts() {
    const navigate = useNavigate();

    const [alertas, setAlertas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [equiposSinNovedad, setEquiposSinNovedad] = useState(0);
    const [sensoresGas, setSensoresGas] = useState(0);

    const [busqueda, setBusqueda] = useState("");
    const [rangoFecha, setRangoFecha] = useState("");
    const [nivel, setNivel] = useState("");
    const [estado, setEstado] = useState("");
    const [categoria, setCategoria] = useState("");

    const cargar = useCallback(async () => {
        try {
            const datos = await obtenerNotificaciones();
            setAlertas(datos.map(mapearNotificacionBackend));
            setError(null);
        } catch (err) {
            console.error("No se pudieron cargar las alertas", err);
            setError("No se pudieron cargar las alertas. Revisa la conexión con el servidor.");
        } finally {
            setCargando(false);
        }
    }, []);

    // Tarjetas "Equipos sin novedad" y "Sensores de gases activos" (datos reales de MANTIA)
    const cargarResumen = useCallback(async () => {
        try {
            const [maquinas, equipos, gases] = await Promise.all([
                GetMachine().catch(() => []),
                GetEquipments().catch(() => []),
                obtenerMedicionesGases(),
            ]);

            const maquinasBien = (maquinas ?? []).filter((m) => m.status === "active" && m.in_operation !== false).length;
            const equiposBien = (equipos ?? []).filter((e) => e.status === "active").length;
            setEquiposSinNovedad(maquinasBien + equiposBien);

            // Ubicaciones con lectura en la medición de gases más reciente
            const ultima = (gases?.data ?? [])[0];
            const conLectura = (ultima?.detail ?? []).filter((d) =>
                ["oxygen", "methane", "carbon_dioxide", "hydrogen_sulfide", "carbon_monoxide", "nitrogen_dioxide"]
                    .some((gas) => d[gas] !== null && d[gas] !== undefined)
            ).length;
            setSensoresGas(conLectura);
        } catch (err) {
            console.error("No se pudo cargar el resumen", err);
        }
    }, []);

    useEffect(() => {
        cargar();
        cargarResumen();
        // La campana avisa cuando hay cambios; esta pantalla se actualiza con ella
        window.addEventListener("notificaciones:actualizar", cargar);
        const intervalo = setInterval(cargar, 15000);
        return () => {
            window.removeEventListener("notificaciones:actualizar", cargar);
            clearInterval(intervalo);
        };
    }, [cargar, cargarResumen]);

    // Avisa a la campana del encabezado para que actualice su contador
    const refrescarCampana = () => window.dispatchEvent(new Event("notificaciones:actualizar"));

    // "Atender": la alerta queda como leída
    const atender = async (id) => {
        setAlertas((prev) => prev.map((a) => (a.id === id ? { ...a, leida: true } : a)));
        try {
            await marcarComoLeida(id);
        } catch (err) {
            console.error("No se pudo marcar como leída", err);
        }
        refrescarCampana();
    };

    // "Escalar" y "Ver": llevan a la pantalla del módulo para revisar o corregir
    const irAlModulo = (alerta) => {
        const ruta = RUTA_POR_CATEGORIA[alerta.categoria];
        if (ruta) navigate(ruta);
    };

    const marcarTodas = async () => {
        try {
            await marcarTodasComoLeidas();
        } catch (err) {
            console.error("No se pudieron marcar como leídas", err);
        }
        refrescarCampana();
    };

    const conteo = useMemo(() => ({
        graves: alertas.filter((a) => a.tipo === "danger" && !a.leida).length,
        importantes: alertas.filter((a) => a.tipo === "warning" && !a.leida).length,
        sinLeer: alertas.filter((a) => !a.leida).length,
    }), [alertas]);

    const visibles = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();
        return alertas.filter((a) =>
            (!nivel || a.tipo === nivel) &&
            (!categoria || a.categoria === categoria) &&
            (!estado || (estado === "sin-leer" ? !a.leida : a.leida)) &&
            dentroDelRango(a.fecha, rangoFecha) &&
            (!texto || `${a.titulo} ${a.mensaje}`.toLowerCase().includes(texto))
        );
    }, [alertas, busqueda, nivel, categoria, estado, rangoFecha]);

    return (
        <div className="alerts-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo="ALERTAS"
                    descripcion="Alertas del sistema: gases, máquinas, equipos, herramientas y más."
                />
                <Searcher
                    placeholder="Buscar por nombre, código, número de serie, marca, ubicación"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    rangoFecha={rangoFecha}
                    onRangoFechaChange={setRangoFecha}
                    filtrosAdicionales={
                        <>
                            <Select id="filtro-nivel" name="filtro-nivel" value={nivel}
                                onChange={(e) => setNivel(e.target.value)} opciones={OPCIONES_NIVEL} />
                            <Select id="filtro-categoria" name="filtro-categoria" value={categoria}
                                onChange={(e) => setCategoria(e.target.value)} opciones={OPCIONES_CATEGORIA} />
                            <Select id="filtro-estado" name="filtro-estado" value={estado}
                                onChange={(e) => setEstado(e.target.value)} opciones={OPCIONES_ESTADO} />
                        </>
                    }
                />
            </header>
            <section className='cards'>
                <div className='card'>
                    <div className="icon blue"><i className="fa-solid fa-circle-exclamation"></i></div>
                    <h2 id="cntGrave">{conteo.graves}</h2>
                    <p>Alertas graves</p>
                </div>
                <div className='card'>
                    <div className="icon blue"><i className="fa-solid fa-triangle-exclamation"></i></div>
                    <h2 id="cntImportante">{conteo.importantes}</h2>
                    <p>Alertas importantes</p>
                </div>
                <div className="card">
                    <div className="icon blue"><i className="fa-solid fa-circle-check"></i></div>
                    <h2 id="cntBien">{equiposSinNovedad}</h2>
                    <p>Equipos sin novedad</p>
                </div>
                <div className="card">
                    <div className="icon blue"><i className="fa-solid fa-wind"></i></div>
                    <h2 id="cntGas">{sensoresGas}</h2>
                    <p>Sensores de gases activos</p>
                </div>
            </section>

            <section className="cards2">
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ alignSelf: "flex-end" }}>
                    <Boton
                        clase="btn-azul"
                        icono="fa-solid fa-check-double"
                        texto=" Atender todas"
                        disabled={conteo.sinLeer === 0}
                        onClick={marcarTodas}
                    />
                </div>

                <table id="tablaAlertas" style={{ width: "100%" }}>
                    <thead>
                        <tr>
                            <th>Nivel</th>
                            <th>Equipo</th>
                            <th>Descripción</th>
                            <th>Hora · Ubicación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cargando && (
                            <tr><td colSpan="5" style={{ textAlign: "center" }}>Cargando alertas...</td></tr>
                        )}
                        {!cargando && error && (
                            <tr><td colSpan="5" style={{ textAlign: "center" }}>{error}</td></tr>
                        )}
                        {!cargando && !error && visibles.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center" }}>
                                    {alertas.length === 0 ? "No hay alertas por ahora." : "Ninguna alerta coincide con los filtros."}
                                </td>
                            </tr>
                        )}
                        {!cargando && !error && visibles.map((a) => {
                            const info = NIVELES[a.tipo] ?? NIVELES.info;
                            const ubicacion = ubicacionDe(a.mensaje);
                            const hora = a.hora === "Ahora" ? "ahora" : `hace ${a.hora}`;
                            return (
                                <tr key={a.id} data-nivel={info.clave} style={a.leida ? { opacity: 0.6 } : undefined}>
                                    <td><span className={`nivel-badge ${info.badge}`}><i className={info.icono}></i> {info.texto}</span></td>
                                    <td>{a.titulo}</td>
                                    <td>{a.mensaje}</td>
                                    <td>
                                        <i className="fa-regular fa-clock"></i> {hora}
                                        {ubicacion && (
                                            <> &nbsp;·&nbsp; <i className="fa-solid fa-location-dot"></i> {ubicacion}</>
                                        )}
                                    </td>
                                    <td>
                                        {a.tipo === "info" ? (
                                            <Boton
                                                clase="btn-azul"
                                                icono="fa-solid fa-eye"
                                                texto="Ver"
                                                onClick={() => { if (!a.leida) atender(a.id); irAlModulo(a); }}
                                            />
                                        ) : a.leida ? (
                                            <span><i className="fa-solid fa-check"></i> Atendida</span>
                                        ) : (
                                            <div>
                                                <Boton
                                                    clase="btn-atender"
                                                    icono="fa-solid fa-check"
                                                    texto="Atender"
                                                    onClick={() => atender(a.id)}
                                                />
                                                <Boton
                                                    clase="btn-escalar"
                                                    icono="fa-solid fa-arrow-up"
                                                    texto="Escalar"
                                                    onClick={() => irAlModulo(a)}
                                                />
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
              </div>
            </section>
        </div>
    );
}

export default Alerts;