function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found__image">
        <img src="/joker.png" alt="Page Not Found" />
      </div>
      <h1>404</h1>
      <h2>Página no encontrada :/</h2>
      <p>Disculpe, la página que está buscando no existe o fue descartada.</p>
      
      <em>Continúe navegando con el menú lateral.</em>
    </div>
  );
}

export default NotFound;