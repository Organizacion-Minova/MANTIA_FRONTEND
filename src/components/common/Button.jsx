import { useRef, useState } from "react";
import { Link } from "react-router-dom";

// Tiempo mínimo entre dos clics del mismo botón cuando su acción termina al instante
// (no devuelve una promesa). Cubre el doble clic sin molestar al usar el botón a ritmo normal.
const ENFRIAMIENTO_MS = 300;

// Un solo clic a la vez: mientras la acción anterior no termina, los demás clics se ignoran.
// Se usa un ref (y no solo estado) porque el estado no alcanza a cambiar entre dos clics muy seguidos.
function useUnSoloClic(onClick) {
    const ocupadoRef = useRef(false);
    const [ocupado, setOcupado] = useState(false);

    const manejarClick = async (e) => {
        if (ocupadoRef.current) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        if (!onClick) return;

        ocupadoRef.current = true;
        try {
            const resultado = onClick(e);
            if (resultado && typeof resultado.then === "function") {
                // Acción asíncrona (guardar, eliminar, exportar...): bloqueado hasta que termine.
                // El botón se ve deshabilitado un instante DESPUÉS del clic: si se hiciera dentro
                // del propio clic, un botón "submit" no alcanzaría a enviar su formulario.
                const aviso = setTimeout(() => { if (ocupadoRef.current) setOcupado(true); }, 0);
                try {
                    await resultado;
                } finally {
                    clearTimeout(aviso);
                }
            } else {
                // Acción inmediata: enfriamiento corto por si lanza trabajo sin devolver su promesa
                await new Promise((resolver) => setTimeout(resolver, ENFRIAMIENTO_MS));
            }
        } finally {
            ocupadoRef.current = false;
            setOcupado(false);
        }
    };

    return { manejarClick, ocupado };
}

export function Boton( {clase, texto, onClick, icono, img, imgDark, disabled, key, titulo} ){
    const { manejarClick, ocupado } = useUnSoloClic(onClick);

    return(
        <button
            type="submit"
            className={clase}
            onClick={manejarClick}
            disabled={disabled || ocupado}
            aria-busy={ocupado || undefined}
            key={key}
            title={titulo}
        >
             {img ? (
                <>
                    <img
                        className={`boton-link__icono${imgDark ? " boton-link__icono--light" : ""}`}
                        src={img}
                        alt=""
                        aria-hidden="true"
                    />
                    {imgDark && (
                        <img
                            className="boton-link__icono boton-link__icono--dark"
                            src={imgDark}
                            alt=""
                            aria-hidden="true"
                        />
                    )}
                </>
            ) : icono ? (
                <i className={icono}></i>
            ) : null}
            {texto}
            
        </button> 
    )
}

export function BotonAccion({ clase, texto, onClick, icono, iconoDark, iconoFa, disabled, key, titulo }) {
    const { manejarClick, ocupado } = useUnSoloClic(onClick);

    return (
        <button type="button" className={clase} onClick={onClick} disabled={disabled} key={key} title={titulo}>
            {iconoFa ? (
                <i className={iconoFa} aria-hidden="true"></i>
            ) : icono && (
                <img
                    className={`boton-accion__icono${iconoDark ? " boton-accion__icono--light" : ""}`}
                    src={icono}
                    alt=""
                    aria-hidden="true"
                />
            )}
            {!iconoFa && iconoDark && (
                <img
                    className="boton-accion__icono boton-accion__icono--dark"
                    src={iconoDark}
                    alt=""
                    aria-hidden="true"
                />
            )}
            {texto}
        </button>
    );
}

export function BotonLink({link,clase,texto,icono,img,imgDark,titulo}){
    return(
        <Link to={link}><button  className={clase} title={titulo}>
            {img ? (
                <>
                    <img
                        className={`boton-link__icono${imgDark ? " boton-link__icono--light" : ""}`}
                        src={img}
                        alt=""
                        aria-hidden="true"
                    />
                    {imgDark && (
                        <img
                            className="boton-link__icono boton-link__icono--dark"
                            src={imgDark}
                            alt=""
                            aria-hidden="true"
                        />
                    )}
                </>
            ) : icono ? (
                <i className={icono}></i>
            ) : null}
            {texto}
        </button></Link>
    )

}