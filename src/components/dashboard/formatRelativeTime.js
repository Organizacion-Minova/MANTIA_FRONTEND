const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

const UNITS = [
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

export function formatRelativeTime(iso) {
  const seconds = Math.min(Math.round((new Date(iso) - Date.now()) / 1000), 0);

  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) {
      return rtf.format(Math.round(seconds / size), unit);
    }
  }
  return "hace un momento";
}