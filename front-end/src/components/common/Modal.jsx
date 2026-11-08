import { useEffect, useId } from "react";
import Icon from "../Icon.jsx";

export default function Modal({ title, onClose, children, footer, wide }) {
  const titleId = useId();

  // Esc cierra el diálogo, como en cualquier hoja modal del sistema.
  useEffect(() => {
    const onKey = (ev) => { if (ev.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="overlay" onMouseDown={(ev) => { if (ev.target === ev.currentTarget) onClose(); }}>
      <div className={"modal" + (wide ? " wide" : "")} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="modal-head">
          <h3 id={titleId}>{title}</h3>
          <button type="button" className="icon-btn" aria-label="Cerrar" onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </div>
  );
}
