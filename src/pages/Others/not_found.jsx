import { Link } from "react-router-dom";
function NotFound() {
  return (
    <div className="not-found">
        <img src="/joker.png" alt="Page Not Found" />
      <h1>404</h1>
      <h2>Pagina no encontrada :/</h2>
      <p>Disulpe, la pagina que esta buscando no existe o fue descartada.</p>
      
      <em>Continue navegando con el menu lateral</em>
    </div>
  );
}

export default NotFound;