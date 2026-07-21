import { useState } from "react";
import { Sidebar } from "../../components";
import { useApi, useAction } from "../../hooks/useApi";
import { AdminService } from "../../services";
import { BG } from "../../styles/tokens";

const G = "linear-gradient(90deg,#1565c0,#1e88e5)";

export default function AdminDoctors({ onNavigate }) {
  const { data, loading, refetch } = useApi(() => AdminService.medecins());
  const { execute: valider }   = useAction(AdminService.validerMedecin);
  const { execute: suspendre } = useAction(AdminService.suspendreMedecin);
  const { execute: supprimer } = useAction(AdminService.supprimerMedecin);

  const [search, setSearch] = useState("");

  const medecins = (data?.data ?? []).filter(m => {
    const nom = `${m.utilisateur?.prenom} ${m.utilisateur?.nom}`.toLowerCase();
    return nom.includes(search.toLowerCase());
  });

  async function handle(action, id) {
    if (!confirm("Confirmer cette action ?")) return;
    try { await action(id); refetch(); }
    catch (e) { alert(e.message); }
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", background:BG }}>

      {/* Topbar */}
      <div style={{ background:G, height:46, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:26, height:26, borderRadius:6, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>💙</div>
          <span style={{ fontSize:14, fontWeight:500, color:"#fff" }}>Kibara-<span style={{ color:"#f4a61d" }}>Santé</span></span>
          <span style={{ color:"rgba(255,255,255,0.5)", margin:"0 4px", fontSize:13 }}>›</span>
          <span style={{ fontSize:13, color:"rgba(255,255,255,0.8)" }}>Administration</span>
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <Sidebar role="admin" page="admin-doctors" onNavigate={onNavigate} />

        <main style={{ flex:1, overflowY:"auto", padding:16 }}>

          {/* Bandeau titre */}
          <div style={{ background:G, borderRadius:14, padding:"20px 24px", marginBottom:16, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", right:-20, top:-20, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
            <h1 style={{ fontSize:22, fontWeight:600, color:"#fff", position:"relative", zIndex:1 }}>👨‍⚕️ Gestion des Médecins</h1>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.85)", marginTop:4, position:"relative", zIndex:1 }}>
              Validez, suspendez ou supprimez les comptes médecins.
            </p>
          </div>

          {/* Barre de recherche */}
          <div style={{ marginBottom:16 }}>
            <input
              type="text"
              placeholder="🔍 Rechercher un médecin..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width:"100%", padding:"10px 14px", border:"1px solid #d1d5db", borderRadius:8, fontSize:14, outline:"none", color:"#111827" }}
            />
          </div>

          {/* Liste */}
          {loading ? (
            <p style={{ color:"#111827", textAlign:"center", fontSize:15 }}>Chargement...</p>
          ) : medecins.length === 0 ? (
            <p style={{ color:"#111827", textAlign:"center", fontSize:15 }}>Aucun médecin trouvé.</p>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {medecins.map(m => (
                <div key={m.id} style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", padding:"14px 16px", display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>

                  {/* ✅ Photo ou initiales */}
                  {m.utilisateur?.photo_profil ? (
                    <img
                      src={m.utilisateur.photo_profil}
                      alt="photo"
                      style={{ width:52, height:52, borderRadius:"50%", objectFit:"cover", border:"2px solid #e5e7eb", flexShrink:0 }}
                    />
                  ) : (
                    <div style={{ width:52, height:52, borderRadius:"50%", background:G, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0, color:"#fff", fontWeight:500 }}>
                      {m.utilisateur?.prenom?.[0]}{m.utilisateur?.nom?.[0]}
                    </div>
                  )}

                  {/* Infos */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ margin:0, fontWeight:600, fontSize:15, color:"#111827" }}>
                      Dr. {m.utilisateur?.prenom} {m.utilisateur?.nom}
                    </p>
                    <p style={{ margin:"3px 0 0", fontSize:13, color:"#111827" }}>
                      🩺 {m.specialite?.nom ?? "—"} — 📍 {m.region?.nom ?? "—"}
                    </p>
                    <p style={{ margin:"3px 0 0", fontSize:13, color:"#111827" }}>
                      📞 {m.utilisateur?.telephone ?? "—"} — ✉️ {m.utilisateur?.email ?? "—"}
                    </p>
                    <div style={{ marginTop:6 }}>
                      <span style={{
                        padding:"3px 12px", borderRadius:20, fontSize:12, fontWeight:500,
                        background: m.statut_validation ? "#dcfce7" : "#fef9c3",
                        color:      m.statut_validation ? "#166534" : "#854d0e",
                      }}>
                        {m.statut_validation ? "✅ Validé" : "⏳ En attente"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {!m.statut_validation && (
                      <button onClick={() => handle(valider, m.id)} style={btnConfirm}>
                        ✅ Valider
                      </button>
                    )}
                    <button onClick={() => handle(suspendre, m.id)} style={btnWarn}>
                      ⏸ Suspendre
                    </button>
                    <button onClick={() => handle(supprimer, m.id)} style={btnDanger}>
                      🗑 Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <div style={{ background:G, padding:10, textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.85)" }}>
        © 2026 <span style={{ color:"#f4a61d" }}>Kibara-Santé</span>. Tous droits réservés.
      </div>
    </div>
  );
}

const btnConfirm = { padding:"6px 14px", background:"linear-gradient(90deg,#16a34a,#22c55e)", color:"#fff", border:"none", borderRadius:6, fontSize:13, cursor:"pointer", fontWeight:500 };
const btnWarn    = { padding:"6px 14px", background:"linear-gradient(90deg,#d97706,#f59e0b)", color:"#fff", border:"none", borderRadius:6, fontSize:13, cursor:"pointer", fontWeight:500 };
const btnDanger  = { padding:"6px 14px", background:"linear-gradient(90deg,#dc2626,#ef4444)", color:"#fff", border:"none", borderRadius:6, fontSize:13, cursor:"pointer", fontWeight:500 };