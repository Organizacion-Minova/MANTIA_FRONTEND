import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const navLinks = [
  { texto: "Inicio", ruta: "/" },
  // { texto: "Acerca de", ruta: "/about" },
  // { texto: "Ayuda", ruta: "/help" },
];

const loginIcon =
  "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M10 17l5-5-5-5 M15 12H3";

function TopbarPublic({ solid = false }) {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className={`mt-header${solid ? " mt-header-solid" : ""}`}>
      <img src="src/assets/img/mantia-cm.jpg" alt="MANTIA" className="mt-logo-img" />
      <div className="mt-right-nav">
        {/* <nav className="mt-navlinks">
          {navLinks.map((link) => (
            <Link key={link.texto} to={link.ruta}>
              {link.texto}
            </Link>
          ))}
        </nav> */}
        {isAuthenticated ? (
          <button className="mt-login-btn" onClick={handleLogout}>
            <Icon />
            Cerrar sesión
          </button>
        ) : (
          <Link to="/login" className="mt-login-btn">
            <Icon />
            Iniciar sesión
          </Link>
        )}
      </div>
    </header>
  );
}

function Icon() {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={loginIcon} />
    </svg>
  );
}

export default TopbarPublic;