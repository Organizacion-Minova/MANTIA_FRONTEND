import { matchPath } from "react-router-dom";
import { TIPOS } from "../components/common/Formarchine.jsx";



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
        path: "/machines/cardMachine/:id/:kind/complete",
        titulo: ({ kind }) => `Completar ${TIPOS[kind]?.titulo ?? kind} máquina`,
    },

     {
        path: "/machines/cardMachine/:id/:kind/questions",
        titulo: ({ kind }) => `Crear ${TIPOS[kind]?.titulo ?? kind} máquina`,
    },
    
     {
        path: "/machines/cardMachine/:id/:kind/edit",
        titulo: ({ kind }) => `Editar ${TIPOS[kind]?.titulo ?? kind} máquina`,
    },

     {
        path: "/machines/cardMachine/:id/:kind/records",
        titulo: ({ kind }) => `Registros ${TIPOS[kind]?.titulo ?? kind} máquina`,
    },

        {
        path: "/machines/cardMachine/:id/:kind/records/:recordId",
        titulo: ({ kind }) => `Detalle de ${TIPOS[kind]?.titulo ?? kind} máquina`,
    },

     {
        path: "inspections/machines",
        titulo: "Inspecciónes máquinas",
    },

     {
        path: "preoperational/machines",
        titulo: "Preoperacionales máquinas",
    },

     {
        path: "inspections/equipment",
        titulo: "Inspecciónes equipos",
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
        path: '/equipment/consumables',
        titulo: "Equipos consumibles",
    },

     {
        path: '/equipment/noconsumables',
        titulo: "Equipos no consumibles",
    },

    {
        path: "/equipment/cardequipment/:id",
        titulo: "Detalle del equipo",
    },
    {
        path: "equipment/cardequipment/:id/inspection",
        titulo: "inspección equipo",
    },
    {
        path: "equipment/cardequipment/:id/inspection/questions" ,
        titulo: "Crear inspección equipo",
    },
    
    {
        path: "equipment/cardequipment/:id/inspection/edit",
        titulo: "Editar inspección equipo",
    },

    {
        path: "equipment/cardequipment/:id/inspection/complete",
        titulo: "Completar inspección equipo ",
    },

    {
        path: "equipment/cardequipment/:id/inspection/records",
        titulo: "Registrar inspección equipo",
    },

    {
        path: "equipment/cardequipment/:id/inspection/records/:inspectionIds",
        titulo: "Detalle inspección equipo",
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
        path: 'consumables/tools/types',
        titulo: "Categorías consumibles",
    },

    {
        path: 'noconsumables/tools/types',
        titulo: "Categorías no consumibles",
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
       {
        path: "/admin",
        titulo: "Panel de administración",
    },

      {
        path: "/help",
        titulo: "Ayuda",
    },

      {
        path: "/about",
        titulo: "Acerca de",
    },
   
    
    
];

export function obtenerInterfazHistorial(pathname) {
    const rutaActual = pathname.length > 1
        ? pathname.replace(/\/+$/, "")
        : pathname;

    const rutaEncontrada = RUTAS_HISTORIAL
        .map((ruta) => ({
            ...ruta,
            coincidencia: matchPath(
            {
                path: ruta.path,
                end: true,
            },
            rutaActual
            ),
        }))
        .find((ruta) => ruta.coincidencia);

    if (!rutaEncontrada) {
        return null;
    }

    return {
        pathname: rutaActual,
        titulo: typeof rutaEncontrada.titulo === "function"
            ? rutaEncontrada.titulo(rutaEncontrada.coincidencia.params)
            : rutaEncontrada.titulo,
    };
}