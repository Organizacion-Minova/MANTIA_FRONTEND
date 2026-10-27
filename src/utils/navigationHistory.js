import { matchPath } from "react-router-dom";

export const RUTAS_HISTORIAL = [
    {
        path: "/dashboard",
        titulo: "Panel de control",
    },
    {
        path: "/ubications",
        titulo: "Ubicaciones",
    },
    {
        path: "/ubications/categoriesubications",
        titulo: "Categorías de ubicaciones",
    },
    {
        path: "/machines",
        titulo: "Máquinas",
    },
    {
        path: "/machines/categoriesmachines",
        titulo: "Categorías de máquinas",
    },
    {
        path: "/machines/cardMachine/:id",
        titulo: "Detalle de máquina",
    },
    {
        path: "/inspection",
        titulo: "Inspecciones",
    },
    {
        path: "/inspection/completeinspection",
        titulo: "Completar inspección",
    },
    {
        path: "/inspection/completeinspection/showinspection",
        titulo: "Resultado de inspección",
    },
    {
        path: "/equipment",
        titulo: "Equipos",
    },
    {
        path: "/equipment/cardequipment/:id",
        titulo: "Detalle del equipo",
    },
    {
        path: "/consumables/tools/types",
        titulo: "Tipos de consumibles",
    },
    {
        path: "/noconsumables/tools/types",
        titulo: "Tipos de no consumibles",
    },
    {
        path: "/consumables/tools",
        titulo: "Herramientas consumibles",
    },
    {
        path: "/noconsumables/tools",
        titulo: "Herramientas no consumibles",
    },
    {
        path: "/dailyuse",
        titulo: "Uso diario",
    },
    {
        path: "/gases",
        titulo: "Medición de gases",
    },
    {
        path: "/gases/compare_gases",
        titulo: "Comparación de gases",
    },
    {
        path: "/gases/gas_format/:id",
        titulo: "Formato de gases",
    },
    {
        path: "/profile",
        titulo: "Mi perfil",
    },
    {
        path: "/alerts",
        titulo: "Alertas",
    },
];

export function obtenerInterfazHistorial(pathname) {
    const rutaActual = pathname.length > 1
        ? pathname.replace(/\/+$/, "")
        : pathname;

    const rutaEncontrada = RUTAS_HISTORIAL.find((ruta) =>
        matchPath(
            {
                path: ruta.path,
                end: true,
            },
            rutaActual
        )
    );

    if (!rutaEncontrada) {
        return null;
    }

    return {
        pathname: rutaActual,
        titulo: rutaEncontrada.titulo,
    };
}