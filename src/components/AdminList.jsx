import Sidebar from "./Sidebar";
import s from "../styles/styles";
import { PRIMARY, WHITE, BORDER, BG } from "../styles/tokens";

export default function AdminList({ page, title, columns, rows, onNavigate }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: BG }}>
      <Sidebar role="admin" page={page} onNavigate={onNavigate} />
      <main style={{ flex: 1, padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={s.sectionTitle}>{title}</h2>
          <button style={s.btn}>➕ Ajouter</button>
        </div>
        <div style={{ ...s.card, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: PRIMARY, color: WHITE }}>
                {columns.map((c) => (
                  <th key={c} style={{ padding: "0.6rem 1rem", textAlign: "left", fontWeight: 600 }}>{c}</th>
                ))}
                <th style={{ padding: "0.6rem 1rem" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? WHITE : BG }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: "0.6rem 1rem" }}>{cell}</td>
                  ))}
                  <td style={{ padding: "0.6rem 1rem" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={{ ...s.btn, fontSize: 12, padding: "0.25rem 0.7rem" }}>Éditer</button>
                      <button style={{ ...s.btnDanger, fontSize: 12, padding: "0.25rem 0.7rem" }}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
