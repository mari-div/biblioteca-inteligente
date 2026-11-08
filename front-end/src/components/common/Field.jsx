import { Children, cloneElement, isValidElement, useId } from "react";

// Enlaza la etiqueta con su control (clic en la etiqueta enfoca el campo y los lectores de pantalla la anuncian).
export default function Field({ label, children, hint }) {
  const id = useId();
  const control = Children.count(children) === 1 && isValidElement(children) && typeof children.type === "string"
    ? cloneElement(children, { id: children.props.id || id })
    : children;
  const controlId = isValidElement(control) ? control.props.id : undefined;

  return (
    <div className="field">
      <label htmlFor={controlId}>{label}</label>
      {control}
      {hint ? <div className="hint">{hint}</div> : null}
    </div>
  );
}
