import { useEffect, useState } from 'react';
import { obtenerRolesResponsables } from '../api/responsables';

export function useRolesResponsables(valorActual = "") {
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        let montado = true;

        obtenerRolesResponsables()
            .then((rolesDisponibles) => {
                if (montado) setRoles(rolesDisponibles);
            })
            .catch((error) => {
                console.error('Error al cargar los roles responsables:', error);
                if (montado) setRoles([]);
            });

        return () => {
            montado = false;
        };
    }, []);

    const opciones = [
        { valor: "", etiqueta: "Seleccione el rol responsable" },
        ...roles.map((rol) => ({ valor: rol, etiqueta: rol })),
    ];

    if (valorActual && !roles.includes(valorActual)) {
        opciones.push({
            valor: valorActual,
            etiqueta: `${valorActual} (valor anterior)`,
        });
    }

    return opciones;
}
