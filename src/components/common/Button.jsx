import { Link } from "react-router-dom";

export function Boton( {clase, texto, onClick, icono, disabled, key, titulo} ){
    return(
        <button type="submit" className={clase} onClick={onClick} disabled={disabled} key={key} title={titulo}>
            <i className={icono}></i>
            {texto}
        </button> 
    )
}
export function BotonLink({link,clase,texto,icono,titulo}){
    return(
        <Link to={link}><button  className={clase} title={titulo}>
            <i className={icono}></i> {texto}
        </button></Link>
    )

}
