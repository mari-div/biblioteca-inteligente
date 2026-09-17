import { useState } from "react";
import Modal from "../../components/common/Modal.jsx";
import Field from "../../components/common/Field.jsx";
import Icon from "../../components/Icon.jsx";

export default function SettingsModal({ mode, setMode, baseUrl, setBaseUrl, onClose, pushToast }) {
  const [url, setUrl] = useState(baseUrl);
  const [testing, setTesting] = useState(false);

  const test = async () => {
    setTesting(true);
    try {
      const res = await fetch(`${url}/libros`);
      if (!res.ok) throw new Error("HTTP " + res.status);
      pushToast("success", "Conexión exitosa. El backend respondió correctamente.");
      setBaseUrl(url);
      setMode("live");
    } catch (err) {
      pushToast("error", "No se pudo contactar el backend. Verifica que esté corriendo y que CORS lo permita.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <Modal
      title="Conexión y datos"
      onClose={onClose}
      footer={<button className="btn" onClick={onClose}>Cerrar</button>}
    >
      <div className="field">
        <label>Origen de los datos</label>
        <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
          <button className={"btn" + (mode === "demo" ? " btn-primary" : "")} onClick={() => setMode("demo")}>
            <Icon name="book" size={15} /> Modo demostración
          </button>
          <button className={"btn" + (mode === "live" ? " btn-primary" : "")} onClick={() => setMode("live")}>
            <Icon name="server" size={15} /> Backend real
          </button>
        </div>
        <div className="hint">
          {mode === "demo"
            ? "Los datos viven en tu navegador (localStorage) y siguen exactamente el modelo del backend, listos para migrarse."
            : "Se harán peticiones reales a tu API de Spring Boot con los mismos endpoints y campos que definiste en los controllers."}
        </div>
      </div>

      <Field label="URL base de tu API">
        <input value={url} onChange={(ev) => setUrl(ev.target.value)} placeholder="/api" />
      </Field>

      <button className="btn btn-primary" onClick={test} disabled={testing}>
        <Icon name="wifi" size={15} /> {testing ? "Probando..." : "Probar conexión y usar este backend"}
      </button>

      <p className="hint" style={{ marginTop: "12px" }}>
        En desarrollo, deja <code>/api</code>: Vite reenvía esas peticiones a tu backend en{" "}
        <code>http://localhost:8080</code> (mira <code>vite.config.js</code>), así que no necesitas CORS mientras
        programas. En producción, si sirves el build compilado desde el propio Spring Boot, tampoco lo necesitarás
        porque todo queda en el mismo origen.
      </p>
    </Modal>
  );
}
