import { useState } from "react";
import Modal from "../../components/common/Modal.jsx";
import Icon from "../../components/Icon.jsx";
import { genreColor } from "../../utils/format.js";

export default function CatalogManagerModal({ store, onClose }) {
  const { autores, generos } = store;
  const [nombreAutor, setNombreAutor] = useState("");
  const [nombreGenero, setNombreGenero] = useState("");

  return (
    <Modal title="Autores y géneros" onClose={onClose} wide>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div>
          <h4 style={{ fontSize: "13.5px", marginBottom: "10px" }}>Autores</h4>
          {autores.items.map((a) => (
            <div key={a.idAutor} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--line-soft)", fontSize: "13px" }}>
              {a.nombre}
              <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={() => autores.remove(a.idAutor)}>
                <Icon name="trash" size={12} />
              </button>
            </div>
          ))}
          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
            <input
              value={nombreAutor}
              onChange={(ev) => setNombreAutor(ev.target.value)}
              placeholder="Nuevo autor"
              style={{ flex: 1, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", borderRadius: "3px", padding: "7px 9px" }}
            />
            <button
              className="btn btn-sm"
              onClick={() => { if (nombreAutor.trim()) { autores.create({ nombre: nombreAutor.trim() }); setNombreAutor(""); } }}
            >
              <Icon name="plus" size={13} />
            </button>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: "13.5px", marginBottom: "10px" }}>Géneros</h4>
          {generos.items.map((g) => (
            <div key={g.idGenero} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid var(--line-soft)", fontSize: "13px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <span className="genre-dot" style={{ background: genreColor(g.idGenero) }} />
                {g.nombre}
              </span>
              <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={() => generos.remove(g.idGenero)}>
                <Icon name="trash" size={12} />
              </button>
            </div>
          ))}
          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
            <input
              value={nombreGenero}
              onChange={(ev) => setNombreGenero(ev.target.value)}
              placeholder="Nuevo género"
              style={{ flex: 1, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", borderRadius: "3px", padding: "7px 9px" }}
            />
            <button
              className="btn btn-sm"
              onClick={() => { if (nombreGenero.trim()) { generos.create({ nombre: nombreGenero.trim() }); setNombreGenero(""); } }}
            >
              <Icon name="plus" size={13} />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
