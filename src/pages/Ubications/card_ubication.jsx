
import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Boton, BotonAccion, BotonLink } from "../../components/common/Button";
import { PageWelcome, Searcher } from "../../components/common/welcome";
import { Select } from "../../components/common/forms";
import { useSearch } from "../../hooks/useSearch";
import LoadingScreen from "../../components/LoadingScreen";
import { usePaginacion, Paginacion } from "../../components/common/Paginacion";
import { useToast } from "../../context/ToastContext.jsx";
import reestablecerFiltrosIcon from "../../assets/icons/reestablecerFiltros.svg";
import {
    obtenerInventarioUbicacion,
    exportarInventarioUbicacionExcel,
    exportarInventarioUbicacionPdf,
} from "../../api/location";
import verIcono from "../../assets/icons/ver.svg";
import izquierdaIcon from"../../assets/icons/flecha-izquierda.svg"
import izquierdaIcon2 from"../../assets/icons/flecha-izquierda2.svg"
import excelIcon from "../../assets/icons/excel.svg"
import pdfIcon from "../../assets/icons/pdf.svg"
import excelIcon2 from "../../assets/icons/excel2.svg"
import pdfIcon2 from "../../assets/icons/pdf2.svg"
import "../../styles/Ubications/ubications.css";

const CLASE_ESTADO = {
    Activo: "badge-bien",
    Inactivo: "badge-grave",
    Mantenimiento: "badge-importante",
    Bueno: "badge-bien",
    Regular: "badge-importante",
    Malo: "badge-grave",
    "Stock bajo": "badge-importante",
    "Fuera de rango": "badge-grave",
    "Dentro de los límites": "badge-bien",
};

const CAMPOS_BUSQUEDA = [
    "tipoNombre",
    "codigo",
    "nombre",
    "categoria",
    "responsable",
    "extra",
    "estadoTexto",
];

const ORDEN_ESTADOS = [
    "Activo",
    "Mantenimiento",
    "Inactivo",
    "Bueno",
    "Regular",
    "Malo",
    "Stock bajo",
    "Dentro de los límites",
    "Fuera de rango",
];

const TIPOS = [
    { valor: "maquinas", etiqueta: "Máquinas", dato: "maquinas" },
    { valor: "equipos-consumibles", etiqueta: "Equipos consumibles", dato: "equipos" },
    { valor: "equipos-no-consumibles", etiqueta: "Equipos no consumibles", dato: "equipos" },
    { valor: "herramientas-consumibles", etiqueta: "Herramientas consumibles", dato: "herramientas" },
    { valor: "herramientas-no-consumibles", etiqueta: "Herramientas no consumibles", dato: "herramientas" },
    { valor: "gases", etiqueta: "Mediciones de gases", dato: "gases" },
];

const COLUMNAS = [
    "Tipo",
    "Código",
    "Nombre",
    "Categoría",
    "Responsable",
    "Estado / condición",
    "Acciones",
];

const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const [anio, mes, dia] = String(fecha).slice(0, 10).split("-");
    return `${dia}/${mes}/${anio}`;
};

function InsigniaEstado({ estado }) {
    const clave = String(estado).split(":")[0];

    return (
        <span className={`nivel-badge ${CLASE_ESTADO[clave] ?? "badge-info"}`}>
            {estado}
        </span>
    );
}

// Muestra las condiciones de las herramientas según el filtro seleccionado.
function CondicionesHerramienta({ herramienta, filtroCondicion = "" }) {
    const condiciones = [
        { nombre: "Bueno", cantidad: herramienta.bueno ?? 0 },
        { nombre: "Regular", cantidad: herramienta.regular ?? 0 },
        { nombre: "Malo", cantidad: herramienta.malo ?? 0 },
    ];

    const condicionesVisibles = filtroCondicion
        ? condiciones.filter(
              (condicion) => condicion.nombre === filtroCondicion
          )
        : condiciones;

    return (
        <div
            className="ubicacion-condiciones-herramienta"
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.35rem",
                justifyContent: "center",
            }}
        >
            {condicionesVisibles.map((condicion) => (
                <InsigniaEstado
                    key={condicion.nombre}
                    estado={`${condicion.nombre}: ${condicion.cantidad}`}
                />
            ))}

            {(!filtroCondicion || filtroCondicion === "Stock bajo") &&
                herramienta.stock_bajo && (
                    <InsigniaEstado estado="Stock bajo" />
                )}
        </div>
    );
}

function TarjetaResumen({ titulo, valor, alerta = false }) {
    return (
        <div className="summary-card">
            <h3 className="summary-card__title">{titulo}</h3>
            <p
                className={`summary-card__total ${
                    alerta && valor > 0 ? "ubicacion-fuera-rango" : ""
                }`}
            >
                {valor}
            </p>
        </div>
    );
}

function TablaInventario({ filas, vacio, reiniciar, acciones }) {
    const {
        datosPagina,
        paginaActual,
        totalPaginas,
        setPaginaActual,
    } = usePaginacion(filas, 7);

    useEffect(() => {
        setPaginaActual(1);
    }, [reiniciar, setPaginaActual]);

    return (
        <section className="ubicacion-seccion">
            <h3 className="ubicacion-seccion__titulo">
                <i
                    className="fa-solid fa-boxes-stacked"
                    aria-hidden="true"
                ></i>{" "}
                Inventario de la ubicación ({filas.length})
            </h3>

            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            {COLUMNAS.map((columna) => (
                                <th key={columna}>{columna}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {datosPagina.length > 0 ? (
                            datosPagina.map((fila) => (
                                <tr key={fila.key}>
                                    {fila.celdas.map((celda, i) => (
                                        <td key={i}>{celda}</td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={COLUMNAS.length}
                                    style={{ textAlign: "center" }}
                                >
                                    {vacio}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="ubicacion-seccion__pie">
                {acciones}
                <Paginacion
                    paginaActual={paginaActual}
                    totalPaginas={totalPaginas}
                    setPaginaActual={setPaginaActual}
                />
                
            </div>
        </section>
    );
}

const botonVer = (link, titulo) => (
    <div className="btn-container__acciones">
        <BotonLink
            link={link}
            clase="btn-azul"
            img={verIcono}
            titulo={titulo}
        />
    </div>
);

// Convierte cada elemento en una fila de la tabla.
function construirFila(item, filtroCondicion = "") {
    const o = item.origen;

    if (item.seccion === "maquinas") {
        return {
            key: `maquinas-${o.id}`,
            celdas: [
                item.tipoNombre,
                o.codigo,
                o.nombre,
                o.categoria ?? "—",
                o.responsable,
                <InsigniaEstado key="estado" estado={o.estado} />,
                botonVer(
                    `/machines/cardMachine/${o.id}`,
                    "Ver ficha de la máquina"
                ),
            ],
        };
    }

    if (item.seccion === "equipos") {
        return {
            key: `equipos-${o.id}`,
            celdas: [
                item.tipoNombre,
                o.codigo,
                o.nombre,
                item.categoria || "Sin especificar",
                o.responsable,
                <InsigniaEstado key="estado" estado={o.estado} />,
                botonVer(
                    `/equipment/cardequipment/${o.id}`,
                    "Ver ficha del equipo"
                ),
            ],
        };
    }

    if (item.seccion === "herramientas") {
        return {
            key: `herramientas-${o.id}`,
            celdas: [
                item.tipoNombre,
                "—",
                <>
                    {o.nombre}
                    <br />
                    <small>
                        {o.consumible ? "Consumible" : "No consumible"} ·
                        Total de unidades: {o.stock_total}
                    </small>
                </>,
                o.categoria ?? "—",
                "—",
                <CondicionesHerramienta
                    key="condiciones"
                    herramienta={o}
                    filtroCondicion={filtroCondicion}
                />,
                botonVer(
                    o.consumible
                        ? "/consumables/tools"
                        : "/noconsumables/tools",
                    "Ir al listado de herramientas"
                ),
            ],
        };
    }

    // Mediciones de gases.
    const fueraDeRango = (o.fuera_de_rango ?? []).length > 0;

    return {
        key: `gases-${o.id}-${o.fecha}-${o.hora}`,
        celdas: [
            item.tipoNombre,
            "—",
            <>
                Medición del {formatearFecha(o.fecha)} {o.hora ?? ""}
                {fueraDeRango && (
                    <>
                        <br />
                        <small className="ubicacion-fuera-rango">
                            Fuera de rango:{" "}
                            {o.fuera_de_rango.join(", ")}
                        </small>
                    </>
                )}
            </>,
            "—",
            o.responsable || "—",
            fueraDeRango ? (
                <span
                    key="estado"
                    className="nivel-badge badge-grave"
                >
                    Fuera de rango
                </span>
            ) : (
                <span
                    key="estado"
                    className="nivel-badge badge-bien"
                >
                    Dentro de los límites
                </span>
            ),
            botonVer(
                `/gases/gas_format/${o.id}`,
                "Ver formato de la medición"
            ),
        ],
    };
}

export function CardUbication() {
    const { id } = useParams();

    const [datos, setDatos] = useState(null);
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [exportando, setExportando] = useState(false);
    const [filtroCondicion, setFiltroCondicion] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("");

    const { advertencia } = useToast();

    useEffect(() => {
        let activo = true;

        obtenerInventarioUbicacion(id)
            .then((respuesta) => {
                if (activo) setDatos(respuesta);
            })
            .catch((err) => {
                if (activo) {
                    setError(
                        err.response?.status === 404
                            ? "La ubicación no existe."
                            : "No se pudo cargar la ubicación."
                    );
                }
            })
            .finally(() => {
                if (activo) setCargando(false);
            });

        return () => {
            activo = false;
        };
    }, [id]);

    const exportar = async (descargar) => {
        setExportando(true);

        try {
            await descargar(id, datos.ubicacion.nombre);
        } catch {
            advertencia(
                "No se pudo exportar el inventario de la ubicación."
            );
        } finally {
            setExportando(false);
        }
    };

    const esUbicacionMina =
        datos?.ubicacion?.categoria?.trim().toLowerCase() === "mina";
    const filtroTipoActivo =
        !esUbicacionMina && filtroTipo === "gases" ? "" : filtroTipo;

    // Todas las filas se agrupan en una sola lista.
    const items = useMemo(() => {
        if (!datos) return [];

        const base = {
            codigo: "",
            nombre: "",
            categoria: "",
            responsable: "",
            extra: "",
        };

        return [
            ...(datos.maquinas ?? []).map((m) => ({
                ...base,
                seccion: "maquinas",
                tipoFiltro: "maquinas",
                tipoNombre: "Máquina",
                codigo: m.codigo,
                nombre: m.nombre,
                categoria: m.categoria ?? "",
                responsable: m.responsable,
                estadoFiltro: m.estado,
                estadoTexto: m.estado,
                origen: m,
            })),

            ...(datos.equipos ?? []).map((e) => ({
                ...base,
                seccion: "equipos",
                tipoFiltro: e.categoria === "Consumible"
                    ? "equipos-consumibles"
                    : e.categoria === "NoConsumible"
                        ? "equipos-no-consumibles"
                        : "equipos",
                tipoNombre: "Equipo",
                codigo: e.codigo,
                nombre: e.nombre,
                categoria: e.categoria === "NoConsumible"
                    ? "No consumible"
                    : e.categoria ?? "",
                responsable: e.responsable,
                estadoFiltro: e.estado,
                estadoTexto: e.estado,
                origen: e,
            })),

            ...(datos.herramientas ?? []).map((h) => ({
                ...base,
                seccion: "herramientas",
                tipoFiltro: h.consumible
                    ? "herramientas-consumibles"
                    : "herramientas-no-consumibles",
                tipoNombre: "Herramienta",
                nombre: h.nombre,
                categoria: h.categoria ?? "",
                extra: h.consumible
                    ? "Consumible"
                    : "No consumible",
                estadoFiltro: "",
                estadoTexto: [
                    h.bueno > 0 ? "Bueno" : "",
                    h.regular > 0 ? "Regular" : "",
                    h.malo > 0 ? "Malo" : "",
                    h.stock_bajo ? "Stock bajo" : "",
                ]
                    .filter(Boolean)
                    .join(" "),
                condicionesFiltro: [
                    h.bueno > 0 ? "Bueno" : "",
                    h.regular > 0 ? "Regular" : "",
                    h.malo > 0 ? "Malo" : "",
                ].filter(Boolean),
                origen: h,
            })),

            ...((esUbicacionMina ? datos.gases : []) ?? []).map((g) => ({
                ...base,
                seccion: "gases",
                tipoFiltro: "gases",
                tipoNombre: "Medición de gases",
                responsable: g.responsable ?? "",
                extra: (g.fuera_de_rango ?? []).join(" "),
                estadoFiltro:
                    (g.fuera_de_rango ?? []).length > 0
                        ? "Fuera de rango"
                        : "Dentro de los límites",
                estadoTexto:
                    (g.fuera_de_rango ?? []).length > 0
                        ? "Fuera de rango"
                        : "Dentro de los límites",
                origen: g,
            })),
        ];
    }, [datos, esUbicacionMina]);

    const {
        busqueda,
        setBusqueda,
        filtrosEspeciales,
        setFiltroEspecial,
        itemsFiltrados,
    } = useSearch(items, CAMPOS_BUSQUEDA);

    // Tipos a los que el usuario tiene acceso.
    const tiposDisponibles = useMemo(
        () =>
            datos
                ? TIPOS.filter(
                      (tipo) =>
                          datos[tipo.dato] !== null &&
                              datos[tipo.dato] !== undefined &&
                              (tipo.valor !== "gases" || esUbicacionMina)
                  ).map(({ valor, etiqueta }) => ({
                      valor,
                      etiqueta,
                  }))
                : [],
        [datos, esUbicacionMina]
    );

    const categoriasUnicas = useMemo(
        () =>
            [
                ...new Set(
                    items
                        .filter((item) => item.seccion !== "equipos")
                        .map((item) => item.categoria)
                        .filter(Boolean)
                ),
            ]
                .sort((a, b) => a.localeCompare(b))
                .map((categoria) => ({
                    valor: categoria,
                    etiqueta: categoria,
                })),
        [items]
    );

    // Estados y condiciones que realmente existen en la ubicación.
    const estadosDisponibles = useMemo(() => {
        const existen = new Set();

        items.forEach((item) => {
            if (item.seccion === "herramientas") {
                item.condicionesFiltro.forEach((condicion) =>
                    existen.add(condicion)
                );

                if (item.origen.stock_bajo) {
                    existen.add("Stock bajo");
                }
            } else if (item.estadoFiltro) {
                existen.add(item.estadoFiltro);
            }
        });

        return ORDEN_ESTADOS.filter((estado) => existen.has(estado)).map(
            (estado) => ({
                valor: estado,
                etiqueta: estado,
            })
        );
    }, [items]);

    // Filtro de estados para máquinas/equipos/gases y condiciones para herramientas.
    const itemsFiltradosPorTipo = itemsFiltrados.filter(
        (item) => !filtroTipoActivo || item.tipoFiltro === filtroTipoActivo
    );

    const itemsFiltradosPorEstado = itemsFiltradosPorTipo.filter((item) => {
        if (!filtroCondicion) return true;

        if (item.seccion === "herramientas") {
            if (filtroCondicion === "Stock bajo") {
                return Boolean(item.origen.stock_bajo);
            }

            return item.condicionesFiltro.includes(filtroCondicion);
        }

        return item.estadoFiltro === filtroCondicion;
    });

    // Se pasa el filtro a la fila para que también cambien las insignias visibles.
    const filas = itemsFiltradosPorEstado.map((item) =>
        construirFila(item, filtroCondicion)
    );

    const hayFiltros =
        busqueda.trim() !== "" ||
        filtroCondicion !== "" ||
        filtroTipoActivo !== "" ||
        Object.values(filtrosEspeciales).some(Boolean);

    const claveFiltros =
        busqueda +
        JSON.stringify(filtrosEspeciales) +
        filtroCondicion +
        filtroTipoActivo;

    const limpiarFiltros = () => {
        setBusqueda("");
        setFiltroEspecial("categoria", "");
        setFiltroCondicion("");
        setFiltroTipo("");
    };

    const botonRegresar = (
        <BotonLink
            link="/ubications"
            clase="btn-regresar"
            img={izquierdaIcon}
            imgDark={izquierdaIcon2}
            texto="Regresar"
            titulo="Regresar a las ubicaciones"
        />
    );

    if (cargando) {
        return <LoadingScreen indeterminado />;
    }

    if (error || !datos) {
        return (
            <div className="list-grid">
                <header className="bienvenida">
                    <PageWelcome
                        titulo="UBICACIÓN"
                        descripcion={
                            error ?? "No se pudo cargar la ubicación."
                        }
                    />
                </header>

                <div className="btn-container-page">
                    <div className="btn-container">
                        <BotonLink
                            link="/ubications"
                            clase="btn-2"
                            icono="fa-solid fa-arrow-left"
                            texto="Regresar"
                        />
                    </div>
                </div>
            </div>
        );
    }

    const {
        ubicacion,
        resumen,
        maquinas,
        equipos,
        herramientas,
        gases,
    } = datos;

    const sinAcceso = [
        maquinas,
        equipos,
        herramientas,
        gases,
    ].every((seccion) => seccion === null);

    return (
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo={ubicacion.nombre.toUpperCase()}
                    descripcion={ubicacion.descripcion}
                    mostrarHistorial={true}
                />

                {!sinAcceso && (
                    <Searcher
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por tipo, código, nombre, categoría, responsable o estado"
                        filtrosAdicionales={
                            <div className="btn-container">
                                <Select
                                    id="filtro-tipo"
                                    name="filtro-tipo"
                                    value={filtroTipoActivo}
                                    onChange={(e) => setFiltroTipo(e.target.value)}
                                    opciones={[
                                        {
                                            valor: "",
                                            etiqueta: "Todos los tipos",
                                        },
                                        ...tiposDisponibles,
                                    ]}
                                />

                                <Select
                                    id="filtro-estado"
                                    name="filtro-estado"
                                    value={filtroCondicion}
                                    onChange={(e) =>
                                        setFiltroCondicion(e.target.value)
                                    }
                                    opciones={[
                                        {
                                            valor: "",
                                            etiqueta: "Todos los estados",
                                        },
                                        ...estadosDisponibles,
                                    ]}
                                />

                                <Select
                                    id="filtro-categoria"
                                    name="filtro-categoria"
                                    value={
                                        filtrosEspeciales.categoria || ""
                                    }
                                    onChange={(e) =>
                                        setFiltroEspecial(
                                            "categoria",
                                            e.target.value
                                        )
                                    }
                                    opciones={[
                                        {
                                            valor: "",
                                            etiqueta: "Todas las categorías",
                                        },
                                        ...categoriasUnicas,
                                    ]}
                                />
                                {hayFiltros && (
                                    <BotonAccion
                                        clase="btn-borrar"
                                        icono={reestablecerFiltrosIcon}
                                        texto="Borrar filtros"
                                        onClick={limpiarFiltros}
                                        titulo="Quitar la búsqueda y todos los filtros"
                                    />
                                )}
                            </div>
                        }
                    />
                )}
            </header>

            <div className="ubicacion-contenido">
                <div className="ubicacion-info">
                    <div className="ubicacion-info__dato">
                        <strong>Categoría:</strong>{" "}
                        <span>
                            {ubicacion.categoria ?? "Sin categoría"}
                        </span>
                    </div>

                    <div className="ubicacion-info__dato">
                        <strong>Estado:</strong>{" "}
                        <InsigniaEstado estado={ubicacion.estado} />
                    </div>
                </div>

                {sinAcceso ? (
                    <p>
                        Tu rol no tiene acceso a los elementos de esta
                        ubicación.
                    </p>
                ) : (
                    <>
                        <div className="ubicacion-resumen">
                            {resumen.maquinas !== null && (
                                <TarjetaResumen
                                    titulo="Máquinas"
                                    valor={resumen.maquinas}
                                />
                            )}

                            {resumen.equipos !== null && (
                                <TarjetaResumen
                                    titulo="Equipos"
                                    valor={resumen.equipos}
                                />
                            )}

                            {resumen.herramientas !== null && (
                                <TarjetaResumen
                                    titulo="Herramientas"
                                    valor={resumen.herramientas}
                                />
                            )}

                            {esUbicacionMina && resumen.mediciones_gases !== null && (
                                <TarjetaResumen
                                    titulo="Mediciones de gases"
                                    valor={resumen.mediciones_gases}
                                />
                            )}

                            {(maquinas !== null || equipos !== null) && (
                                <TarjetaResumen
                                    titulo="Activos"
                                    valor={resumen.activos ?? 0}
                                />
                            )}
                        </div>

                        <TablaInventario
                            filas={filas}
                            vacio={
                                hayFiltros
                                    ? "No se encontraron resultados"
                                    : "Esta ubicación no tiene elementos"
                            }
                            reiniciar={claveFiltros}
                            acciones={
                                <div className="ubicacion-seccion__acciones">
                                    <div className="ubicacion-seccion__exportar">
                                        <Boton
                                            clase="btn-3"
                                            img={excelIcon}
                                            imgDark={excelIcon2}
                                            texto="Exportar Excel"
                                            onClick={() =>
                                                exportar(
                                                    exportarInventarioUbicacionExcel
                                                )
                                            }
                                            disabled={exportando}
                                            titulo="Exportar inventario en un archivo de Excel"
                                        />

                                        <Boton
                                            clase="btn-3"
                                            img={pdfIcon}
                                            imgDark={pdfIcon2}
                                            texto="Exportar PDF"
                                            onClick={() =>
                                                exportar(
                                                    exportarInventarioUbicacionPdf
                                                )
                                            }
                                            disabled={exportando}
                                            titulo="Exportar inventario en un archivo PDF"
                                        />
                                    </div>

                                    <div className="footer-btns">
                                        {botonRegresar}
                                    </div>
                                </div>
                            }
                        />
                    </>
                )}

                {sinAcceso && (
                    <div className="btn-container">
                        <div className="footer-btns">
                            {botonRegresar}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CardUbication;
