import Icon from "../Icon.jsx";

export default function StarRow({ value, onChange, size = 20, readOnly }) {
  return (
    <div className="star-pick">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={readOnly ? undefined : () => onChange(n)}
          style={{ color: n <= value ? "var(--brass)" : "var(--line)", cursor: readOnly ? "default" : "pointer" }}
        >
          <Icon name={n <= value ? "star" : "starOutline"} size={size} />
        </span>
      ))}
    </div>
  );
}
