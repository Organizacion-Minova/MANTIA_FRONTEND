import { useState } from 'react'
import './index.css'
import App from './App.jsx'
import './base.css'

function Base() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [openSubmenu, setOpenSubmenu] = useState('herramientas')

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev)
  }

  const toggleSubmenu = (name) => {
    setOpenSubmenu((prev) => (prev === name ? null : name))
  }

  return (
    <div className="grid-base">
      <header className="topbar">
        <div
          className="menu-contenedor"
          onClick={toggleSidebar}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              toggleSidebar()
            }
          }}
        >
          <div id="toggleSidebar" className={sidebarOpen ? '' : 'cerrado'}>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>

        <div className="logo" aria-label="Logo" />

        <div className="centro">
          <h2>SISTEMA DE MANTENIMIENTO E INVENTARIO</h2>
        </div>

        <nav className="derecha">
          <button className="bell-btn" type="button" title="Alertas">
            <i className="fa-solid fa-bell"></i>
            <span className="bell-badge">5</span>
          </button>

          <button className="profile-btn" type="button">
            <div>
              <h4>PAPOI</h4>
              <span className="role-tag">
                <i className="fa-solid fa-shield-halved"></i> PAPOI
              </span>
            </div>
          </button>
        </nav>
      </header>

      <aside className={`sidebar ${sidebarOpen ? '' : 'cerrado'}`} id="sidebar">
        <ul>
          <li>
            <a href="#">
              <i className="fa-solid fa-house"></i>
              <span>Inicio</span>
            </a>
          </li>

          <li className={`menu-desplegable ${openSubmenu === 'herramientas' ? 'activo' : ''}`}>
            <a
              className="menu-titulo"
              href="#"
              onClick={(event) => {
                event.preventDefault()
                toggleSubmenu('herramientas')
              }}
            >
              <i className="fa-solid fa-screwdriver-wrench"></i>
              <span>Herramientas</span>
            </a>

            <ul className="submenu">
              <li>
                <a href="#">
                  <i className="fa-solid fa-wrench"></i>
                  <span>Consumibles</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fa-solid fa-tools"></i>
                  <span>No consumibles</span>
                </a>
              </li>
            </ul>
          </li>

          <li>
            <a href="#">
              <i className="fa-solid fa-gears"></i>
              <span>Equipos</span>
            </a>
          </li>

          <li>
            <a href="#">
              <i className="fa-solid fa-industry"></i>
              <span>Maquinas</span>
            </a>
          </li>

          <li>
            <a href="#">
              <i className="fa-solid fa-map-marker-alt"></i>
              <span>Ubicaciones</span>
            </a>
          </li>

          <li>
            <a href="#">
              <i className="fa-solid fa-clipboard-check"></i>
              <span>Empresas</span>
            </a>
          </li>

          <li>
            <a href="#">
              <i className="fa-solid fa-info-circle"></i>
              <span>Acerca de</span>
            </a>
          </li>

          <li>
            <a href="#">
              <i className="fa-solid fa-circle-question"></i>
              <span>Ayuda</span>
            </a>
          </li>

          <li>
            <a href="#">
              <i className="fa-solid fa-right-from-bracket"></i>
              <span>Iniciar sesión</span>
            </a>
          </li>
        </ul>
      </aside>

      <main className={sidebarOpen ? '' : 'cerrado'}>
        <App />
      </main>
      <footer className={sidebarOpen ? '' : 'cerrado'}>
        <div className="secFooterPrincipal">
          <div className="descripcion-logos">
            Sistema de Mantenimiento y inventariado de elementos Mineros
            <br />
            Copyright © 2026. Todos los derechos reservados.
          </div>
        </div>

        <div className="infoFooter">
          <strong>CONTACTANOS</strong>
          <br />
          minovaskls@gmail.com
        </div>
      </footer>
    </div>
  )
}

export default Base