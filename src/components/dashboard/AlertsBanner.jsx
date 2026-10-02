export default function AlertsBanner({ criticalCount = null }) {
  const state = criticalCount === null ? "loading" : criticalCount > 0 ? "critical" : "ok";

  const content = {
    loading: {
      icon: "fa-solid fa-hourglass-half",
      text: "Alertas — próximamente",
      className: "alerts-banner--neutral",
    },
    ok: {
      icon: "fa-solid fa-circle-check",
      text: "Sin alertas críticas",
      className: "alerts-banner--ok",
    },
    critical: {
      icon: "fa-solid fa-triangle-exclamation",
      text: `${criticalCount} alerta${criticalCount === 1 ? "" : "s"} crítica${criticalCount === 1 ? "" : "s"}`,
      className: "alerts-banner--critical",
    },
  }[state];

  return (
    <div className={`alerts-banner ${content.className}`} role="status">
      <i className={content.icon} aria-hidden="true"></i>
      <span>{content.text}</span>
    </div>
  );
}