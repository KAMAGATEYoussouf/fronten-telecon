import { Sidebar } from "../../components";
import { useApi, useAction } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import RendezVousService from "../../services/RendezVousService";
import { BG } from "../../styles/tokens";

const G = "linear-gradient(90deg,#1565c0,#1e88e5)";

const STATUT_CONFIG = {
  confirme:   { label:"Confirmé", cls:"confirme" },
  en_attente: { label:"Planifié", cls:"planifie" },
  planifie:   { label:"Planifié", cls:"planifie" },
  annule:     { label:"Annulé",   cls:"annule"   },
  refuse:     { label:"Refusé",   cls:"annule"   },
  termine:    { label:"Terminé",  cls:"planifie" },
};

const statusStyle = {
  confirme: { background:"#dcfce7", color:"#166534" },
  planifie: { background:"#fef9c3", color:"#854d0e" },
  annule:   { background:"#fee2e2", color:"#991b1b" },
};

export default function AppointmentsList({ onNavigate }) {
  const { user } = useAuth();
  const { data, loading, refetch } = useApi(() => RendezVousService.liste());
  const { execute: annuler } = useAction(RendezVousService.annuler);

  const rdvs = data?.data ?? [];

  async function handleAnnuler(id) {
    if (!confirm("Confirmer l'annulation ?")) return;
    try { await annuler(id); refetch(); }
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
          <span style={{ fontSize:13, color:"rgba(255,255,255,0.8)" }}>Accueil</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color:"#fff", fontSize:18 }}>🔔</span>
          <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(255,255,255,0.25)", border:"1.5px solid rgba(255,255,255,0.5)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11 }}>
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <Sidebar role="patient" page="appointments" onNavigate={onNavigate} />

        <main style={{ flex:1, overflowY:"auto", padding:20 }}>

          {/* Titre */}
          <div style={{ background:G, borderRadius:14, padding:"22px 28px", marginBottom:24, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", right:-30, top:-30, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
            <div style={{ position:"absolute", right:60, bottom:-20, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
            <div style={{ textAlign:"center", position:"relative", zIndex:1 }}>
              <h1 style={{ fontSize:28, fontWeight:700, color:"#fff", margin:0 }}>Mes Rendez-vous</h1>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.85)", margin:"6px 0 0" }}>
                Consultez et gérez l'ensemble de vos rendez-vous médicaux.
              </p>
            </div>
          </div>

          {/* Grille */}
          {loading ? (
            <p style={{ color:"#111827", textAlign:"center", padding:"2rem", fontSize:15 }}>Chargement...</p>
          ) : rdvs.length === 0 ? (
            <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", padding:"3rem", textAlign:"center" }}>
              <p style={{ color:"#111827", fontSize:15, marginBottom:12 }}>Aucun rendez-vous trouvé.</p>
              <button onClick={() => onNavigate("book-appointment")} style={btnEdit}>
                Prendre un rendez-vous
              </button>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
              {rdvs.map((rdv) => {
                const cfg = STATUT_CONFIG[rdv.statut] ?? { label:rdv.statut, cls:"planifie" };
                const st  = statusStyle[cfg.cls] ?? statusStyle.planifie;
                const date = new Date(rdv.date_heure).toLocaleDateString("fr-FR")
                           + " " + new Date(rdv.date_heure).toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" });

                return (
                  <div key={rdv.id} style={{ background:"#fff", borderRadius:10, overflow:"hidden", border:"1px solid #e5e7eb" }}>

                    {/* En-tête */}
                    <div style={{ background:G, padding:"10px 12px", display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ color:"#fff", fontSize:14 }}>📅</span>
                      <span style={{ color:"#fff", fontSize:14, fontWeight:500 }}>{date}</span>
                    </div>

                    {/* Corps */}
                    <div style={{ padding:14 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                        <div style={{ width:40, height:40, borderRadius:"50%", background:G, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:20 }}>👨‍⚕️</div>
                        <div>
                          <div style={{ fontSize:14, fontWeight:500, color:"#111827" }}>
                            Dr. {rdv.medecin?.utilisateur?.prenom} {rdv.medecin?.utilisateur?.nom}
                          </div>
                          <div style={{ fontSize:13, color:"#111827" }}>
                            🩺 Spécialité : {rdv.medecin?.specialite?.nom ?? "—"}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize:13, color:"#111827", marginBottom:10, display:"flex", alignItems:"center", gap:4 }}>
                        <span style={{ color:"#1565c0" }}>📞</span>
                        {rdv.medecin?.utilisateur?.telephone ?? "—"}
                      </div>

                      <div style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"4px 12px", borderRadius:20, fontSize:13, fontWeight:500, marginBottom:12, ...st }}>
                        {cfg.cls === "confirme" ? "✅" : "🕐"} Statut : {cfg.label}
                      </div>

                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {rdv.statut === "confirme" && (
                          <button onClick={() => onNavigate("teleconsult-patient", { rdvId:rdv.id })} style={btnCall}>
                            Démarrer l'appel
                          </button>
                        )}
                        {["en_attente","confirme"].includes(rdv.statut) && (
                          <button onClick={() => onNavigate("book-appointment", { rdvId:rdv.id })} style={btnEdit}>
                            Modifier
                          </button>
                        )}
                        {["en_attente","confirme"].includes(rdv.statut) && (
                          <button onClick={() => handleAnnuler(rdv.id)} style={btnCancel}>
                            Annuler
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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

const btnCall   = { padding:"6px 14px", background:"linear-gradient(90deg,#06b6d4,#0ea5e9)", color:"#fff", border:"none", borderRadius:6, fontSize:13, cursor:"pointer", fontWeight:500 };
const btnEdit   = { padding:"6px 14px", background:"linear-gradient(90deg,#1565c0,#1e88e5)", color:"#fff", border:"none", borderRadius:6, fontSize:13, cursor:"pointer", fontWeight:500 };
const btnCancel = { padding:"6px 14px", background:"linear-gradient(90deg,#ef4444,#dc2626)", color:"#fff", border:"none", borderRadius:6, fontSize:13, cursor:"pointer", fontWeight:500 };