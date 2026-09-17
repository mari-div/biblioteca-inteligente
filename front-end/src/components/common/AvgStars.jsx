import Icon from "../Icon.jsx";

export default function AvgStars({ items, idLibro }) {
  const rel = items.filter((c) => c.idLibro === idLibro);
  if (!rel.length) return <span style={{ color: "var(--muted)" }}>Sin calificaciones</span>;
  const avg = rel.reduce((s, c) => s + c.puntuacion, 0) / rel.length;
  return (
    <span className="stars">
      <Icon name="star" size={13} /> {avg.toFixed(1)}
      <span style={{ color: "var(--muted)" }}> ({rel.length})</span>
    </span>
  );
}
