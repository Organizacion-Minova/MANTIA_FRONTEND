import { useState, useEffect, useMemo } from "react";
import { Boton } from "../../components/common/Button";
import LoadingScreen from "../../components/LoadingScreen";
import { useConfirm } from "../../context/ConfirmContext.jsx";
import { obtenerPruebas, correrPruebas } from "../../api/admin";
import "../../styles/paneles-admin.css";

// Botón para correr las pruebas automatizadas del backend (solo Superadministrador).
// Las pruebas usan una base de datos temporal en memoria: no tocan los datos reales.

const ESTADOS = {
    aprobada: { clase: "badge-activo", icono: "fa-solid fa-circle-check", texto: "Aprobada" },
    fallida: { clase: "badge-fuera", icono: "fa-solid fa-circle-xmark", texto: "Fallida" },
    error: { clase: "badge-fuera", icono: "fa-solid fa-triangle-exclamation", texto: "Error" },
    omitida: { clase: "badge-inactivo", icono: "fa-solid fa-forward", texto: "Omitida" },
};

function PanelPruebas() {
    const [estado, setEstado] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [corriendo, setCorriendo] = useState(false);
    const [soloFallas, setSoloFallas] = useState(false);
    const [abierta, setAbierta] = useState(null);
    const pedirConfirmacion = useConfirm();

    useEffect(() => {
        obtenerPruebas()
            .then(setEstado)
            .catch(() => setEstado({ disponible: false, resultado: null }))
            .finally(() => setCargando(false));
    }, []);

    const correr = async () => {
        const ok = await pedirConfirmacion({
            titulo: "Correr pruebas automatizadas",
            mensaje: "Las pruebas pueden tardar unos minutos. Usan una base de datos temporal y no modifican tus datos. ¿Continuar?",
            textoConfirmar: "Correr pruebas",
            tipo: "warning",
        });
        if (!ok) return;

        setCorriendo(true);
        try {
            const data = await correrPruebas();
            setEstado((prev) => ({ ...prev, resultado: data.resultado }));
        } catch {
            // El aviso de error ya lo mostró axios
        } finally {
            setCorriendo(false);
        }
    };

    const resultado = estado?.resultado;

    const grupos = useMemo(() => {
        const lista = (resultado?.pruebas ?? []).filter((p) => !soloFallas || p.estado === "fallida" || p.estado === "error");
        return lista.reduce((acc, p) => {
            (acc[p.grupo] ??= []).push(p);
            return acc;
        }, {});
    }, [resultado, soloFallas]);

    if (cargando) return <LoadingScreen indeterminado />;

    return (
        <>
            <div className="form-container" style={{ marginBottom: "1.5rem" }}>
                <h3 className="form-title">Pruebas automatizadas</h3>
                <p className="form-description">
                    Revisa que el sistema funcione bien: crear cuentas, validaciones, permisos de cada rol, copias de seguridad,
                    historial de cambios, máquinas, equipos, alertas y más. Corren en una base de datos temporal, sin tocar tus datos.
                </p>

                {!estado?.disponible && (
                    <p className="error-texto" role="alert">
                        Las pruebas no están instaladas en este servidor (se instalan con «composer install» sin --no-dev).
                    </p>
                )}

                <div className="btn-container" style={{ marginTop: "1rem" }}>
                    <Boton
                        clase="btn-azul"
                        icono={corriendo ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-play"}
                        texto={corriendo ? "Corriendo pruebas..." : "Correr pruebas"}
                        titulo="Ejecutar todas las pruebas automatizadas"
                        disabled={corriendo || !estado?.disponible}
                        onClick={(e) => { e.preventDefault(); return correr(); }}
                    />
                    {resultado?.total > 0 && (
                        <Boton
                            clase="btn-2"
                            icono="fa-solid fa-filter"
                            texto={soloFallas ? "Ver todas" : "Ver solo fallas"}
                            titulo="Filtrar resultados"
                            onClick={(e) => { e.preventDefault(); setSoloFallas((v) => !v); }}
                        />
                    )}
                </div>
            </div>

            {corriendo && <LoadingScreen indeterminado />}

            {!corriendo && resultado && (
                <div className="form-container">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}>
                        <span className="badge badge-activo"><i className="fa-solid fa-circle-check" aria-hidden="true" /> {resultado.aprobadas} aprobadas</span>
                        <span className="badge badge-fuera"><i className="fa-solid fa-circle-xmark" aria-hidden="true" /> {resultado.fallidas + resultado.errores} con fallas</span>
                        <span className="badge badge-inactivo"><i className="fa-solid fa-forward" aria-hidden="true" /> {resultado.omitidas} omitidas</span>
                        <span className="form-help-text">
                            {resultado.total} pruebas · {resultado.duracion} s · {new Date(resultado.ejecutado_en).toLocaleString("es-CO")} · por {resultado.ejecutado_por}
                        </span>
                    </div>

                    {resultado.error && (
                        <>
                            <p className="error-texto" role="alert">{resultado.error}</p>
                            {resultado.salida && (
                                <pre style={{ whiteSpace: "pre-wrap", maxHeight: 320, overflow: "auto", background: "var(--fondo)", padding: "0.75rem", borderRadius: 8 }}>
                                    {resultado.salida}
                                </pre>
                            )}
                        </>
                    )}

                    {Object.entries(grupos).map(([grupo, pruebas]) => (
                        <div key={grupo} style={{ marginBottom: "1rem" }}>
                            <p className="form-label">{grupo}</p>
                            <div className="table-responsive">
                                <table className="table admin-test-table">
                                    <thead>
                                        <tr>
                                            <th>Prueba</th>
                                            <th>Resultado</th>
                                            <th>Tiempo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pruebas.map((p, i) => {
                                            const info = ESTADOS[p.estado] ?? ESTADOS.omitida;
                                            const id = `${grupo}-${i}`;
                                            return (
                                                <tr key={id}>
                                                    <td>
                                                        <div className="admin-test-name">
                                                            <span>{p.nombre}</span>
                                                            {p.mensaje && (
                                                                <button
                                                                    type="button"
                                                                    className="admin-test-detail"
                                                                    onClick={() => setAbierta(abierta === id ? null : id)}
                                                                >
                                                                    {abierta === id ? "Ocultar detalle" : "Ver detalle"}
                                                                </button>
                                                            )}
                                                        </div>
                                                        {abierta === id && (
                                                            <pre className="admin-test-message">{p.mensaje}</pre>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${info.clase}`}>
                                                            <i className={info.icono} aria-hidden="true" /> {info.texto}
                                                        </span>
                                                    </td>
                                                    <td>{p.tiempo} s</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}

                    {soloFallas && Object.keys(grupos).length === 0 && <p>Todas las pruebas pasaron.</p>}
                </div>
            )}

            {!corriendo && !resultado && estado?.disponible && (
                <p className="form-help-text">Todavía no se han corrido las pruebas desde aquí.</p>
            )}
        </>
    );
}

export default PanelPruebas;
