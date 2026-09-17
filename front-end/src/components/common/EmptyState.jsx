export default function EmptyState({ title, sub }) {
  return (
    <div className="empty">
      <h4>{title}</h4>
      <p>{sub}</p>
    </div>
  );
}
