import { Link } from "react-router-dom";

export function Boton( {clase, texto, onClick, icono, disabled, key, titulo} ){
    return(
        <button type="submit" className={clase} onClick={onClick} disabled={disabled} key={key} title={titulo}>
            <i className={icono}></i>
            {texto}
        </button> 
    )
}

export function BotonAccion({ clase, texto, onClick, icono, iconoDark, disabled, key, titulo }) {
    return (
        <button type="button" className={clase} onClick={onClick} disabled={disabled} key={key} title={titulo}>
            {icono && (
                <img
                    className={`boton-accion__icono${iconoDark ? " boton-accion__icono--light" : ""}`}
                    src={icono}
                    alt=""
                    aria-hidden="true"
                />
            )}
            {iconoDark && (
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

export function BotonLink({link,clase,texto,icono,img,titulo}){
    return(
        <Link to={link}><button  className={clase} title={titulo}>
            {img ? (
                <img className="boton-link__icono" src={img} alt="" aria-hidden="true" />
            ) : icono ? (
                <i className={icono}></i>
            ) : null}
            {texto}
        </button></Link>
    )

}
