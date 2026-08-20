import { Link } from "react-router-dom";

export function Boton( {clase, texto, onclick, icono} ){
    return(
        <button className={clase} >
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