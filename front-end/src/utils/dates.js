export const today = new Date();

export const iso = (d) => d.toISOString().slice(0, 10);

export const addDays = (d, n) => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};

export const fmtDate = (s) => {
  if (!s) return "—";
  const d = new Date(s + (s.length <= 10 ? "T00:00:00" : ""));
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
};

export const fmtRelative = (s) => {
  const d = new Date(s + (s.length <= 10 ? "T00:00:00" : ""));
  const diff = Math.round((today - d) / 86400000);
  if (diff <= 0) return "hoy";
  if (diff === 1) return "ayer";
  if (diff < 30) return `hace ${diff} días`;
  return fmtDate(s);
};
