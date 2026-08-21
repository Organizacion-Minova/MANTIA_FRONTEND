import { Link } from "react-router-dom";

export function Boton( {clase, texto, onClick, icono} ){
    return(
        <button type="submit" className={clase} onClick={onClick}>
            <i className={icono}></i>
            {texto}
        </button> 
    )
}
export function BotonLink({link,clase,texto,icono}){
    return(
        <Link to={link}><button  className={clase}>
            <i className={icono}></i> {texto}
        </button></Link>
    )

}
