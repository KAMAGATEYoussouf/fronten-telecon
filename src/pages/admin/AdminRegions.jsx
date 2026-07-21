import { useState } from "react";
import { Sidebar } from "../../components";
import { useApi, useAction } from "../../hooks/useApi";
import { AdminService } from "../../services";
import s from "../../styles/styles";
import { PRIMARY, BG, TEXT_MUTED, WHITE, BORDER } from "../../styles/tokens";

export default function AdminRegions({ onNavigate }) {
  const { data, loading, refetch } = useApi(() => AdminService.regions());
  const { execute: creer }    = useAction(AdminService.creerRegion);
  const { execute: update }   = useAction(AdminService.updateRegion);
  const { execute: supprimer }= useAction(AdminService.supprimerRegion);

  const [newNom, setNewNom]   = useState("");
  const [editId, setEditId]   = useState(null);
  const [editNom, setEditNom] = useState("");

  const regions = data ?? [];

  async function handleCreate() {
    if (!newNom.trim()) return;
    try { await creer(newNom.trim()); setNewNom(""); refetch(); }
    catch (e) { alert(e.message); }
  }

  async function handleUpdate(id) {
    try { await update(id, editNom); setEditId(null); refetch(); }
    catch (e) { alert(e.message); }
  }

  async function handleDelete(id) {
    if (!confirm("Supprimer cette région ?")) return;
    try { await supprimer(id); refetch(); }
    catch (e) { alert(e.message); }
  }

  return (
    <div style={{ display:"flex", minHeight:"100vh", background: BG }}>
      <Sidebar role="admin" page="admin-regions" onNavigate={onNavigate} />
      <main style={{ flex:1, padding:"2rem" }}>
        <h2 style={{ ...s.sectionTitle, marginBottom:"1.5rem" }}>🏠 Gestion des Régions</h2>

        <div style={{ ...s.card, marginBottom:"1.5rem" }}>
          <h3 style={{ fontWeight:700, marginBottom:10, fontSize:15 }}>Ajouter une région</h3>
          <div style={{ display:"flex", gap:8 }}>
            <input style={{ ...s.input, flex:1 }} value={newNom} onChange={(e) => setNewNom(e.target.value)} placeholder="Nom de la région" onKeyDown={(e) => e.key==="Enter" && handleCreate()} />
            <button style={s.btn} onClick={handleCreate}>➕ Ajouter</button>
          </div>
        </div>

        {loading ? <p style={{ color: TEXT_MUTED }}>Chargement...</p> : (
          <div style={{ ...s.card, overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
              <thead>
                <tr style={{ background: PRIMARY, color: WHITE }}>
                  {["N°","Nom","Nb Médecins","Actions"].map(c => (
                    <th key={c} style={{ padding:"0.6rem 1rem", textAlign:"left", fontWeight:600 }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {regions.length === 0 && (
                  <tr><td colSpan={4} style={{ padding:"1.5rem", textAlign:"center", color: TEXT_MUTED }}>Aucune région.</td></tr>
                )}
                {regions.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom:`1px solid ${BORDER}`, background: i%2===0 ? WHITE : BG }}>
                    <td style={{ padding:"0.6rem 1rem" }}>{r.id}</td>
                    <td style={{ padding:"0.6rem 1rem" }}>
                      {editId === r.id ? (
                        <div style={{ display:"flex", gap:6 }}>
                          <input style={{ ...s.input, width:200 }} value={editNom} onChange={(e) => setEditNom(e.target.value)} autoFocus />
                          <button style={{ ...s.btn, fontSize:12, padding:"0.25rem 0.7rem" }} onClick={() => handleUpdate(r.id)}>✓</button>
                          <button style={{ ...s.btnOutline, fontSize:12, padding:"0.25rem 0.7rem" }} onClick={() => setEditId(null)}>✕</button>
                        </div>
                      ) : r.nom}
                    </td>
                    <td style={{ padding:"0.6rem 1rem" }}>{r.medecins_count ?? 0}</td>
                    <td style={{ padding:"0.6rem 1rem" }}>
                      <div style={{ display:"flex", gap:5 }}>
                        <button style={{ ...s.btn, fontSize:12, padding:"0.25rem 0.7rem" }} onClick={() => { setEditId(r.id); setEditNom(r.nom); }}>Éditer</button>
                        <button style={{ ...s.btnDanger, fontSize:12, padding:"0.25rem 0.7rem" }} onClick={() => handleDelete(r.id)}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
