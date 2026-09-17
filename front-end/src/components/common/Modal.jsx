import Icon from "../Icon.jsx";

export default function Modal({ title, onClose, children, footer, wide }) {
  return (
    <div className="overlay" onMouseDown={(ev) => { if (ev.target === ev.currentTarget) onClose(); }}>
      <div className={"modal" + (wide ? " wide" : "")}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </div>
  );
}
