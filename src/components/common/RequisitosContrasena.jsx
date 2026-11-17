import { requisitosContrasena } from "../../utils/validacionesUsuario";

// Lista de requisitos de la contraseña que se va marcando mientras se escribe.
// Usa los colores ya definidos en variables.css y los íconos de Font Awesome.
export default function RequisitosContrasena({ valor }) {
    if (!valor) return null;

    return (
        <ul className="form-help-text" aria-live="polite" style={{ listStyle: "none", padding: 0, margin: "0.4rem 0 0" }}>
            {requisitosContrasena(valor).map((r) => (
                <li
                    key={r.id}
                    style={{ color: r.cumple ? "var(--color-success)" : "var(--texto2)", display: "flex", gap: "0.4rem", alignItems: "center", fontSize: "0.78rem" }}
                >
                    <i className={r.cumple ? "fa-solid fa-circle-check" : "fa-regular fa-circle"} aria-hidden="true" />
                    {r.texto}
                </li>
            ))}
        </ul>
    );
}
