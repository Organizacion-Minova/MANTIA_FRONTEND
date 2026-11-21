import { useEffect, useRef, useState } from "react";
import { Chart, DoughnutController, ArcElement } from "chart.js";

Chart.register(DoughnutController, ArcElement);

const STATUS_VAR = {
  success: "--secundario",
  warning: "--amarillo",
  critical: "--color-critical",
};

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export default function DonutChart({ segments, label, children }) {
  const canvasRef = useRef(null);
  const [themeTick, setThemeTick] = useState(0);

  useEffect(() => {
    const observer = new MutationObserver(() => setThemeTick((n) => n + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const visible = segments.filter((s) => s.value > 0);
    const isEmpty = visible.length === 0;

    const chart = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: isEmpty ? [1] : visible.map((s) => s.value),
            backgroundColor: isEmpty
              ? [cssVar("--fondo")]
              : visible.map((s) => cssVar(STATUS_VAR[s.status] ?? "--fondo")),
            borderColor: cssVar("--contenedor"),
            borderWidth: isEmpty ? 0 : 2,
          },
        ],
      },
      options: {
        cutout: "70%",
        animation: false,
        events: [],
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
      },
    });

    return () => chart.destroy();
  }, [segments, themeTick]);

  return (
    <div className="donut-chart">
      <canvas ref={canvasRef} role="img" aria-label={label}></canvas>
      <div className="donut-chart__center">{children}</div>
    </div>
  );
} 