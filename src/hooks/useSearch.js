import { useState, useMemo } from 'react';

export function useSearch(items = [], searchFields = [], dateField = 'created_at') {
    const [busqueda, setBusqueda] = useState('');
    const [rangoFecha, setRangoFecha] = useState('');
    const [filtrosEspeciales, setFiltrosEspeciales] = useState({});

    const itemsFiltrados = useMemo(() => {
        return items.filter((item) => {
            // Búsqueda
            if (busqueda.trim()) {
                const termino = busqueda.toLowerCase();
                const cumpleTexto = searchFields.some((field) => {
                    const valor = item[field];
                    return valor ? valor.toString().toLowerCase().includes(termino) : false;
                });
                if (!cumpleTexto) return false;
            }

            // Filtro de valores exactos (ubicación, tipo, categoría, responsable, estado, etc.)
            const cumpleFiltrosEspeciales = Object.entries(filtrosEspeciales).every(([campo, valorFiltro]) => {
                if (!valorFiltro) return true;
                return item[campo]?.toString() === valorFiltro.toString();
            });
            if (!cumpleFiltrosEspeciales) return false;

            // Filtro de fecha
            if (rangoFecha && item[dateField]) {
                const fechaItem = new Date(item[dateField]);
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);

                if (rangoFecha === 'hoy') {
                    const fechaItemInicio = new Date(fechaItem);
                    fechaItemInicio.setHours(0, 0, 0, 0);
                    if (fechaItemInicio.getTime() !== hoy.getTime()) return false;
                }
                else if (rangoFecha === '7_dias') {
                    const hace7Dias = new Date(hoy);
                    hace7Dias.setDate(hoy.getDate() - 7);
                    if (fechaItem < hace7Dias) return false;
                }
                else if (rangoFecha === 'mes') {
                    if (
                        fechaItem.getMonth() !== hoy.getMonth() ||
                        fechaItem.getFullYear() !== hoy.getFullYear()
                    ) return false;
                }
                else if (rangoFecha === 'ano') {
                    if (fechaItem.getFullYear() !== hoy.getFullYear()) return false;
                }
            }
            return true;
        });
    }, [items, searchFields, busqueda, rangoFecha, filtrosEspeciales, dateField]);

    const setFiltroEspecial = (campo, valor) => {
        setFiltrosEspeciales((prev) => ({
            ...prev,
            [campo]: valor
        }));
    };

    return { busqueda, setBusqueda, rangoFecha, setRangoFecha, filtrosEspeciales, setFiltroEspecial, itemsFiltrados };
}
