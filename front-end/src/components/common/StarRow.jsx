import Icon from "../Icon.jsx";

export default function StarRow({ value, onChange, size = 22, readOnly }) {
  if (readOnly) {
    return (
      <div className="star-pick readonly" role="img" aria-label={`${value} de 5 estrellas`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} style={{ color: n <= value ? "var(--brass)" : "var(--line)" }}>
            <Icon name={n <= value ? "star" : "starOutline"} size={size} />
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="star-pick" role="radiogroup" aria-label="Tu calificación">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={n === value}
          aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
          className="star-btn"
          onClick={() => onChange(n)}
          style={{ color: n <= value ? "var(--brass)" : "var(--line)" }}
        >
          <Icon name={n <= value ? "star" : "starOutline"} size={size} />
        </button>
      ))}
    </div>
  );
}
