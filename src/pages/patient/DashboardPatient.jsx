import { Sidebar } from "../../components";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import RendezVousService from "../../services/RendezVousService";

const G  = "linear-gradient(90deg,#1565c0,#1e88e5)";
const G2 = "linear-gradient(135deg,#1565c0,#1e88e5)";

function Spinner() {
  return <div style={{ textAlign:"center", padding:"1.5rem", color:"#1565c0", fontSize:15 }}>Chargement...</div>;
}

export default function DashboardPatient({ onNavigate }) {
  const { user } = useAuth();
  const { data, loading } = useApi(() => RendezVousService.liste({ statut:"confirme" }));

  const rdvs     = data?.data ?? [];
  const total    = data?.total ?? 0;
  const termines = rdvs.filter(r => r.statut === "termine").length;
  const aVenir   = rdvs.filter(r => r.statut !== "termine" && r.statut !== "annule" && r.statut !== "refuse").length;
  const prochain = rdvs[0]?.date_heure ? new Date(rdvs[0].date_heure).toLocaleDateString("fr-FR") : "—";

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", background:"#f0f4f8" }}>

      {/* Topbar */}
      <div style={{ background:G, height:46, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:26, height:26, borderRadius:6, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>💙</div>
          <span style={{ fontSize:14, fontWeight:500, color:"#fff" }}>Kibara-<span style={{ color:"#f4a61d" }}>Santé</span></span>
          <span style={{ color:"rgba(255,255,255,0.5)", fontSize:13, margin:"0 4px" }}>›</span>
          <span style={{ fontSize:13, color:"rgba(255,255,255,0.8)" }}>Accueil</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color:"#fff", fontSize:18 }}>🔔</span>
          <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(255,255,255,0.25)", border:"1.5px solid rgba(255,255,255,0.5)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:500 }}>
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <Sidebar role="patient" page="dashboard-patient" onNavigate={onNavigate} />

        <main style={{ flex:1, overflowY:"auto", padding:18 }}>

          {/* Profil */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
            <div style={{ width:52, height:52, borderRadius:"50%", background:"#e3edf7", border:"2px solid #1565c0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>👤</div>
            <div>
              <div style={{ fontSize:20, fontWeight:500, color:"#111827", marginBottom:2 }}>Bonjour, {user?.prenom} {user?.nom}</div>
              <div style={{ fontSize:14, color:"#111827" }}>Bienvenue sur votre tableau de bord</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
            {[
              { icon:"📅", val:total,    lbl:"Rendez-vous totaux"   },
              { icon:"✅", val:termines, lbl:"Rendez-vous terminés"  },
              { icon:"🕐", val:aVenir,   lbl:"Rendez-vous à venir"   },
            ].map(({ icon, val, lbl }) => (
              <div key={lbl} style={{ background:G2, borderRadius:10, padding:"14px 10px", textAlign:"center", color:"#fff" }}>
                <div style={{ fontSize:24, marginBottom:6 }}>{icon}</div>
                <div style={{ fontSize:24, fontWeight:500, marginBottom:3 }}>{val}</div>
                <div style={{ fontSize:14, opacity:.9 }}>{lbl}</div>
              </div>
            ))}
          </div>

          {/* RDV confirmés */}
          <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", marginBottom:14, overflow:"hidden" }}>
            <div style={{ background:G, padding:"10px 16px", display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:16 }}>✅</span>
              <span style={{ color:"#fff", fontSize:15, fontWeight:500 }}>Rendez-vous confirmés</span>
            </div>
            <div style={{ padding:10, display:"flex", flexDirection:"column", gap:8 }}>
              {loading ? <Spinner /> : rdvs.length === 0 ? (
                <p style={{ color:"#111827", fontSize:14, padding:"6px 4px" }}>Aucun rendez-vous confirmé.</p>
              ) : rdvs.map((rdv) => (
                <div key={rdv.id} style={{ background:"#f8fafd", border:"1px solid #dce8f5", borderRadius:8, padding:"10px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:14, color:"#111827" }}>
                      <span style={{ color:"#1565c0" }}>📅</span>
                      <b style={{ fontWeight:500, color:"#1a3a5c", marginRight:2 }}>Date :</b>
                      {new Date(rdv.date_heure).toLocaleString("fr-FR")}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:14, color:"#111827" }}>
                      <span style={{ color:"#1565c0" }}>👤</span>
                      <b style={{ fontWeight:500, color:"#1a3a5c", marginRight:2 }}>Médecin :</b>
                      Dr. {rdv.medecin?.utilisateur?.prenom} {rdv.medecin?.utilisateur?.nom}
                    </div>
                    {rdv.motif && <div style={{ fontSize:13, color:"#111827" }}>Motif : {rdv.motif}</div>}
                  </div>
                  <button
                    onClick={() => onNavigate("teleconsult-patient", { rdvId:rdv.id })}
                    style={{ padding:"7px 16px", background:G, color:"#fff", border:"none", borderRadius:7, fontSize:13, cursor:"pointer", fontWeight:500, whiteSpace:"nowrap" }}
                  >
                    Démarrer l'appel
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Prochain RDV + Statut */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
            <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:16, textAlign:"center" }}>
              <div style={{ fontSize:28, color:"#1565c0", marginBottom:6 }}>🕐</div>
              <div style={{ fontSize:18, fontWeight:500, color:"#1a3a5c", marginBottom:3 }}>{prochain}</div>
              <div style={{ fontSize:14, color:"#111827" }}>Prochain rendez-vous</div>
            </div>
            <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:16, textAlign:"center" }}>
              <div style={{ fontSize:28, color:"#1565c0", marginBottom:6 }}>🛡️</div>
              <div style={{ fontSize:18, fontWeight:500, color:"#16a34a", marginBottom:3 }}>{user?.statut === "actif" ? "Actif" : user?.statut}</div>
              <div style={{ fontSize:14, color:"#111827" }}>Statut du compte</div>
            </div>
          </div>

        </main>
      </div>

      {/* Footer */}
      <div style={{ background:G, padding:10, textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.85)" }}>
        © 2026 <span style={{ color:"#f4a61d" }}>Kibara-Santé</span>. Tous droits réservés.
      </div>
    </div>
  );
}