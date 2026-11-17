import { useState, useEffect, useCallback, useMemo } from "react";
import { Boton } from "../../components/common/Button";
import { Form, Text, Select, Checkbox, Date as CampoFecha } from "../../components/common/forms";
import { useToast } from "../../context/ToastContext";
import LoadingScreen from "../../components/LoadingScreen";
import { Paginacion } from "../../components/common/Paginacion";
import { formatRelativeTime } from "../../components/dashboard/formatRelativeTime";
import { obtenerHistorial, obtenerCambio, revertirCambio } from "../../api/admin";
import { erroresDelServidor } from "../../utils/validacionesUsuario";
import "../../styles/paneles-admin.css";

// Historial de cambios con forma de "ramas" (como el gráfico de GitHub):
//   - cada USUARIO es una rama (una línea vertical),
//   - el COLOR de la rama es el de su ROL,
//   - cada cambio es un punto en su rama, con un ícono según el TIPO de cambio.
// Solo se usan colores que ya existen en styles/variables.css e íconos de Font Awesome.

const COLOR_ROL = {
    "Superadministrador": "var(--rojo)",
    "Jefe de mina": "var(--secundario)",
    "SST": "var(--color-warning)",
    "Mantenimiento": "var(--verde)",
    "Operario mantenimiento": "var(--acento-mantia)",
    "Operario gases": "var(--amarillo)",
    "Almacenista": "var(--sidebar)",
    "Visitante": "var(--texto2)",
};
const COLORES_EXTRA = ["var(--color-critical)", "var(--color-success)", "var(--acento-mantia2)", "var(--texto)"];

function colorDeRol(rol) {
    if (COLOR_ROL[rol]) return COLOR_ROL[rol];
    const n = [...String(rol ?? "")].reduce((a, c) => a + c.charCodeAt(0), 0);
    return COLORES_EXTRA[n % COLORES_EXTRA.length];
}

function iconoDeCambio(c) {
    if (c.es_reversion) return "fa-solid fa-rotate-left";
    if (c.accion === "created" || c.accion === "user_created") return "fa-solid fa-plus";
    if (c.accion === "updated") return "fa-solid fa-pen";
    if (c.accion === "deleted") return "fa-solid fa-trash";
    if (c.accion === "role_changed") return "fa-solid fa-user-shield";
    if (c.accion === "password_reset") return "fa-solid fa-key";
    if (c.accion?.startsWith("backup")) return "fa-solid fa-database";
    if (c.accion === "tests_run") return "fa-solid fa-vial";
    return "fa-solid fa-circle-info";
}

function claseAccion(c) {
    if (c.accion === "deleted" || c.accion === "backup_deleted" || c.accion === "backup_restored") return "badge-fuera";
    if (c.accion === "updated" || c.accion === "role_changed" || c.accion === "password_reset") return "badge-mantto";
    if (c.accion === "created" || c.accion === "user_created" || c.accion === "backup_created") return "badge-activo";
    return "badge-inactivo";
}

const ANCHO_CARRIL = 22;
const CENTRO_PUNTO = 26; // px desde arriba de cada fila

// ---------- Columna del gráfico de una fila ----------
function GraficoFila({ fila, carriles, colores }) {
    const ancho = (carriles.length + 1) * ANCHO_CARRIL;
    const xDe = (i) => (i + 1) * ANCHO_CARRIL - ANCHO_CARRIL / 2;
    const xMain = ANCHO_CARRIL / 2;

    return (
        <div aria-hidden="true" style={{ position: "relative", width: ancho, minWidth: ancho, alignSelf: "stretch" }}>
            {/* Línea principal (el sistema) */}
            <span style={{ position: "absolute", left: xMain - 1, top: 0, bottom: 0, width: 2, background: "var(--borde-contenedor)" }} />

            {carriles.map((usuario, i) => {
                const tramo = fila.tramos[usuario];
                if (!tramo) return null;
                const x = xDe(i);
                return (
                    <span key={usuario}>
                        <span
                            style={{
                                position: "absolute", left: x - 1, width: 2, background: colores[usuario],
                                top: tramo.empieza ? CENTRO_PUNTO : 0,
                                bottom: tramo.termina ? `calc(100% - ${CENTRO_PUNTO}px)` : 0,
                            }}
                        />
                        {/* Donde nace la rama: se une a la línea principal */}
                        {tramo.termina && (
                            <span
                                style={{
                                    position: "absolute", top: CENTRO_PUNTO - 1, height: 2,
                                    left: xMain, width: x - xMain, background: colores[usuario], opacity: 0.6,
                                }}
                            />
                        )}
                    </span>
                );
            })}

            {/* El punto del cambio */}
            <span
                title={fila.cambio.accion_texto}
                style={{
                    position: "absolute",
                    left: xDe(fila.carril) - 10,
                    top: CENTRO_PUNTO - 10,
                    width: 20, height: 20, borderRadius: "50%",
                    background: fila.cambio.revertido ? "var(--contenedor)" : colores[fila.usuario],
                    border: `2px solid ${colores[fila.usuario]}`,
                    color: fila.cambio.revertido ? colores[fila.usuario] : "var(--blanco)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, zIndex: 1,
                }}
            >
                <i className={iconoDeCambio(fila.cambio)} />
            </span>
        </div>
    );
}

// ---------- Tabla antes / después ----------
function Diferencias({ diferencias }) {
    if (!diferencias?.length) return null;

    return (
        <div className="table-responsive" style={{ marginTop: "0.5rem" }}>
            <table className="table">
                <thead>
                    <tr>
                        <th>Campo</th>
                        <th>Antes</th>
                        <th>Después</th>
                    </tr>
                </thead>
                <tbody>
                    {diferencias.map((d) => (
                        <tr key={d.campo}>
                            <td>{d.etiqueta}</td>
                            <td style={{ background: d.antes != null ? "var(--color-critical-bg)" : undefined, wordBreak: "break-word" }}>
                                {d.antes ?? "—"}
                            </td>
                            <td style={{ background: d.despues != null ? "var(--color-success-bg)" : undefined, wordBreak: "break-word" }}>
                                {d.despues ?? "—"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ---------- Confirmar reversión ----------
function FormularioRevertir({ cambio, onCancel, onListo }) {
    const [password, setPassword] = useState("");
    const [forzar, setForzar] = useState(false);
    const [conflicto, setConflicto] = useState(null);
    const [error, setError] = useState(null);
    const [detalle, setDetalle] = useState(null);
    const { advertencia } = useToast();

    useEffect(() => {
        obtenerCambio(cambio.id).then(setDetalle).catch(() => setDetalle(cambio));
    }, [cambio]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password) {
            setError("Escribe tu contraseña para confirmar.");
            advertencia("Escribe tu contraseña para confirmar.", "Contraseña requerida");
            return;
        }

        try {
            await revertirCambio(cambio.id, password, forzar);
            onListo();
        } catch (err) {
            setPassword("");
            const codigo = err.response?.data?.codigo;
            if (codigo === "conflicto") {
                // El aviso emergente ya lo mostró axios; aquí se ofrece forzar
                setConflicto(err.response.data.message);
                return;
            }
            setError(erroresDelServidor(err).password ?? null);
        }
    };

    const que = {
        created: "Se ELIMINARÁ el registro que se creó.",
        updated: "Se devolverán los valores de la columna «Antes».",
        deleted: "Se RECUPERARÁ el registro eliminado" + (cambio.dependientes ? ` y ${cambio.dependientes} dato(s) relacionado(s).` : "."),
    }[cambio.accion];

    return (
        <Form
            titulo="Revertir cambio"
            descripcion={`${cambio.descripcion} — por ${cambio.usuario} (${cambio.rol}). ${que ?? ""} La reversión queda registrada en el historial.`}
            onCancel={onCancel}
            onSubmit={handleSubmit}
            textoBoton="Revertir"
            iconoBoton="fa-solid fa-rotate-left"
            tituloBoton="Revertir este cambio"
            noValidate
        >
            <div className="col-span-6">
                {detalle ? <Diferencias diferencias={detalle.diferencias} /> : <p className="form-help-text">Cargando detalle…</p>}
            </div>
            {conflicto && (
                <div className="col-span-6">
                    <p className="error-texto" role="alert">{conflicto}</p>
                    <Checkbox
                        id="forzar-revertir"
                        name="forzar-revertir"
                        label="Revertir de todas formas (se perderán los cambios posteriores en esos campos)"
                        checked={forzar}
                        onChange={() => setForzar((v) => !v)}
                    />
                </div>
            )}
            <div className="col-span-6">
                <Text
                    label="Tu contraseña:" id="password-revertir" name="password-revertir" type="password"
                    placeholder="Confirma con tu contraseña" value={password} maxLength={64}
                    onChange={(e) => { setPassword(e.target.value.slice(0, 64)); setError(null); }} required
                />
                {error && <p className="error-texto" role="alert">{error}</p>}
            </div>
        </Form>
    );
}

const FILTROS_VACIOS = { usuario: "", rol: "", modulo: "", accion: "", desde: "", hasta: "", buscar: "" };

function PanelHistorial() {
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [filtros, setFiltros] = useState(FILTROS_VACIOS);
    const [aplicados, setAplicados] = useState(FILTROS_VACIOS);
    const [pagina, setPagina] = useState(1);
    const [abiertos, setAbiertos] = useState({});
    const [aRevertir, setARevertir] = useState(null);
    const { advertencia } = useToast();

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            setDatos(await obtenerHistorial({ ...aplicados, pagina }));
        } catch (err) {
            setError(err.response?.data?.message || "No se pudo cargar el historial.");
        } finally {
            setCargando(false);
        }
    }, [aplicados, pagina]);

    useEffect(() => { cargar(); }, [cargar]);

    const aplicarFiltros = (e) => {
        e?.preventDefault?.();
        if (filtros.desde && filtros.hasta && filtros.hasta < filtros.desde) {
            advertencia("La fecha final no puede ser anterior a la inicial.", "Fechas inválidas");
            return;
        }
        setPagina(1);
        setAplicados({ ...filtros, buscar: filtros.buscar.trim() });
    };

    const limpiarFiltros = () => {
        setFiltros(FILTROS_VACIOS);
        setAplicados(FILTROS_VACIOS);
        setPagina(1);
    };

    // Arma los carriles: un carril por usuario, ordenados por su cambio más reciente
    const grafico = useMemo(() => {
        const cambios = datos?.cambios ?? [];
        const carriles = [];
        const colores = {};
        const primera = {};
        const ultima = {};

        cambios.forEach((c, i) => {
            const clave = String(c.usuario_id ?? c.usuario ?? "sistema");
            if (!carriles.includes(clave)) carriles.push(clave);
            colores[clave] = colorDeRol(c.rol);
            if (primera[clave] === undefined) primera[clave] = i;
            ultima[clave] = i;
        });

        const filas = cambios.map((c, i) => {
            const usuario = String(c.usuario_id ?? c.usuario ?? "sistema");
            const tramos = {};
            carriles.forEach((u) => {
                if (i >= primera[u] && i <= ultima[u]) {
                    tramos[u] = {
                        empieza: i === primera[u],   // la punta de la rama (cambio más reciente)
                        termina: i === ultima[u],    // donde nace la rama (cambio más antiguo de la página)
                    };
                }
            });
            return { cambio: c, usuario, carril: carriles.indexOf(usuario), tramos };
        });

        return { carriles, colores, filas };
    }, [datos]);

    if (cargando && !datos) return <LoadingScreen indeterminado />;
    if (error) return <p className="error-texto" role="alert">{error}</p>;

    const opciones = datos?.filtros ?? { modulos: [], roles: [], acciones: [] };
    const ramas = datos?.ramas ?? [];

    return (
        <>
            {/* Filtros */}
            <form className="form-container" style={{ marginBottom: "1.5rem" }} onSubmit={aplicarFiltros} noValidate>
                <h3 className="form-title">Historial de cambios</h3>
                <p className="form-description">
                    Cada rama es un usuario y su color indica el rol. Cada punto es un cambio: <i className="fa-solid fa-plus" aria-hidden="true" /> creó,{" "}
                    <i className="fa-solid fa-pen" aria-hidden="true" /> editó, <i className="fa-solid fa-trash" aria-hidden="true" /> eliminó,{" "}
                    <i className="fa-solid fa-rotate-left" aria-hidden="true" /> reversión. Un punto hueco es un cambio que ya fue revertido.
                    {!datos?.puede_revertir && " Aquí no aparecen los cambios del Superadministrador ni de los Visitantes."}
                </p>
                <div className="form-grid">
                    <div className="col-span-2">
                        <Select
                            label="Usuario" id="filtro-usuario" name="usuario" value={filtros.usuario}
                            onChange={(e) => setFiltros((f) => ({ ...f, usuario: e.target.value }))}
                            opciones={[{ valor: "", etiqueta: "Todos" }, ...ramas.map((r) => ({ valor: String(r.user_id), etiqueta: r.user_name }))]}
                        />
                    </div>
                    <div className="col-span-2">
                        <Select
                            label="Rol" id="filtro-rol" name="rol" value={filtros.rol}
                            onChange={(e) => setFiltros((f) => ({ ...f, rol: e.target.value }))}
                            opciones={[{ valor: "", etiqueta: "Todos" }, ...opciones.roles.map((r) => ({ valor: r, etiqueta: r }))]}
                        />
                    </div>
                    <div className="col-span-2">
                        <Select
                            label="Módulo" id="filtro-modulo" name="modulo" value={filtros.modulo}
                            onChange={(e) => setFiltros((f) => ({ ...f, modulo: e.target.value }))}
                            opciones={[{ valor: "", etiqueta: "Todos" }, ...opciones.modulos.map((m) => ({ valor: m, etiqueta: m }))]}
                        />
                    </div>
                    <div className="col-span-2">
                        <Select
                            label="Tipo de cambio" id="filtro-accion" name="accion" value={filtros.accion}
                            onChange={(e) => setFiltros((f) => ({ ...f, accion: e.target.value }))}
                            opciones={[{ valor: "", etiqueta: "Todos" }, ...opciones.acciones]}
                        />
                    </div>
                    <div className="col-span-2">
                        <CampoFecha
                            label="Desde" id="filtro-desde" name="desde" value={filtros.desde}
                            onChange={(e) => setFiltros((f) => ({ ...f, desde: e.target.value }))}
                        />
                    </div>
                    <div className="col-span-2">
                        <CampoFecha
                            label="Hasta" id="filtro-hasta" name="hasta" value={filtros.hasta}
                            onChange={(e) => setFiltros((f) => ({ ...f, hasta: e.target.value }))}
                        />
                    </div>
                    <div className="col-span-6">
                        <Text
                            label="Buscar" id="filtro-buscar" name="buscar" placeholder="Ej: martillo, Juan, ubicación..."
                            value={filtros.buscar} maxLength={100}
                            onChange={(e) => setFiltros((f) => ({ ...f, buscar: e.target.value.slice(0, 100) }))}
                        />
                    </div>
                </div>
                <div className="btn-container" style={{ marginTop: "1rem" }}>
                    <Boton clase="btn-azul" icono="fa-solid fa-filter" texto="Filtrar" titulo="Aplicar filtros" onClick={aplicarFiltros} />
                    <Boton clase="btn-2" icono="fa-solid fa-eraser" texto="Limpiar" titulo="Quitar filtros" onClick={(e) => { e.preventDefault(); limpiarFiltros(); }} />
                </div>
            </form>

            {/* Leyenda de ramas */}
            {ramas.length > 0 && (
                <div className="form-container" style={{ marginBottom: "1rem" }}>
                    <p className="form-label" style={{ marginBottom: "0.5rem" }}>Ramas ({ramas.length})</p>
                    <div className="admin-branches-list">
                        {ramas.map((r) => (
                            <button
                                type="button"
                                key={r.user_id}
                                className="admin-branch-button"
                                title={`Ver solo los cambios de ${r.user_name}`}
                                onClick={() => { const f = { ...FILTROS_VACIOS, usuario: String(r.user_id) }; setFiltros(f); setAplicados(f); setPagina(1); }}
                            >
                                <i className="fa-solid fa-code-branch" style={{ color: colorDeRol(r.user_role) }} aria-hidden="true" />
                                <strong>{r.user_name}</strong>
                                <span className="form-help-text">{r.user_role} · {r.total}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Gráfico */}
            <div className="form-container" aria-busy={cargando || undefined}>
                {grafico.filas.length === 0 ? (
                    <p style={{ textAlign: "center" }}>No hay cambios para mostrar.</p>
                ) : (
                    <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                        {grafico.filas.map((fila) => {
                            const c = fila.cambio;
                            const abierto = abiertos[c.id];
                            return (
                                <li key={c.id} style={{ display: "flex", gap: "0.75rem" }}>
                                    <GraficoFila fila={fila} carriles={grafico.carriles} colores={grafico.colores} />

                                    <div style={{ flex: 1, minWidth: 0, padding: "0.6rem 0", borderBottom: "1px solid var(--borde-contenedor)" }}>
                                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.4rem" }}>
                                            <code title="Identificador del cambio" style={{ color: "var(--texto2)" }}>{c.hash}</code>
                                            <strong style={{ color: "var(--texto)", wordBreak: "break-word" }}>{c.descripcion}</strong>
                                        </div>
                                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.4rem", marginTop: "0.35rem" }}>
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                                                <i className="fa-solid fa-code-branch" style={{ color: grafico.colores[fila.usuario] }} aria-hidden="true" />
                                                <strong>{c.usuario}</strong>
                                            </span>
                                            <span className="badge badge-inactivo">{c.rol}</span>
                                            <span className={`badge ${claseAccion(c)}`}>{c.accion_texto}</span>
                                            <span className="badge badge-inactivo">{c.modulo}</span>
                                            {c.revertido && <span className="badge badge-fuera">Revertido</span>}
                                            {c.es_reversion && <span className="badge badge-mantto">Reversión</span>}
                                            <span className="form-help-text" title={new Date(c.fecha).toLocaleString("es-CO")}>
                                                {new Date(c.fecha).toLocaleString("es-CO")} · {formatRelativeTime(c.fecha)}
                                            </span>
                                        </div>

                                        <div className="btn-container" style={{ marginTop: "0.4rem" }}>
                                            {c.total_diferencias > 0 && (
                                                <Boton
                                                    clase="btn-2"
                                                    icono={abierto ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down"}
                                                    texto={abierto ? "Ocultar cambios" : `Ver cambios (${c.total_diferencias})`}
                                                    titulo="Ver los valores antes y después"
                                                    onClick={(e) => { e.preventDefault(); setAbiertos((a) => ({ ...a, [c.id]: !a[c.id] })); }}
                                                />
                                            )}
                                            {c.revertible && (
                                                <Boton
                                                    clase="btn-borrar"
                                                    icono="fa-solid fa-rotate-left"
                                                    texto="Revertir"
                                                    titulo="Deshacer este cambio"
                                                    onClick={(e) => { e.preventDefault(); setARevertir(c); }}
                                                />
                                            )}
                                        </div>

                                        {abierto && <Diferencias diferencias={c.diferencias} />}
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                )}

                <div className="roles-actions">
                    <Paginacion
                        paginaActual={datos?.paginacion?.pagina ?? 1}
                        totalPaginas={datos?.paginacion?.paginas ?? 1}
                        setPaginaActual={setPagina}
                    />
                </div>
            </div>

            {aRevertir && (
                <FormularioRevertir
                    cambio={aRevertir}
                    onCancel={() => setARevertir(null)}
                    onListo={() => { setARevertir(null); cargar(); }}
                />
            )}
        </>
    );
}

export default PanelHistorial;
