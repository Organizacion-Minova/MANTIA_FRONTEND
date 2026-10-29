import { Link } from "react-router-dom";
function NotFound() {
  return (
    <div className="not-found">
        <img src="/joker.png" alt="Page Not Found" />
      <h1>404</h1>
      <h2>Página no encontrada :/</h2>
      <p>Disculpe, la página que está buscando no existe o fue descartada.</p>
      
      <em>Continúe navegando con el menú lateral.</em>
    </div>
  );
}

export default NotFound;