import { Sidebar, Avatar } from "../../components";
import { useAuth } from "../../context/AuthContext";
import { useApi, useAction } from "../../hooks/useApi";
import RendezVousService from "../../services/RendezVousService";
import { BG } from "../../styles/tokens";

const G  = "linear-gradient(90deg,#1565c0,#1e88e5)";
const G2 = "linear-gradient(135deg,#1565c0,#1e88e5)";

const STATUT_CFG = {
  en_attente: { label:"Planifié",  cls:"attente"  },
  confirme:   { label:"Confirmé",  cls:"confirme" },
  annule:     { label:"Annulé",    cls:"annule"   },
  refuse:     { label:"Refusé",    cls:"annule"   },
  termine:    { label:"Terminé",   cls:"confirme" },
  en_cours:   { label:"En cours",  cls:"confirme" },
};

const badgeStyle = {
  confirme: { background:"#dcfce7", color:"#166534" },
  attente:  { background:"#fef9c3", color:"#854d0e" },
  annule:   { background:"#fee2e2", color:"#991b1b" },
};

export default function DoctorAppointments({ onNavigate }) {
  const { user } = useAuth();
  const { data, loading, refetch } = useApi(() => RendezVousService.liste());
  const { execute: confirmer } = useAction(RendezVousService.confirmer);
  const { execute: refuser }   = useAction(RendezVousService.refuser);

  const rdvs = data?.data ?? [];

  async function handle(action, id) {
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
          <span style={{ fontSize:13, color:"rgba(255,255,255,0.8)" }}>Accueil</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color:"#fff", fontSize:18 }}>🔔</span>
          {/* ✅ Avatar avec photo */}
          <Avatar user={user} size={30} fontSize={11} />
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <Sidebar role="doctor" page="doctor-appointments" onNavigate={onNavigate} />

        <main style={{ flex:1, overflowY:"auto", padding:16 }}>

          {/* Bandeau titre */}
          <div style={{ background:G, borderRadius:14, padding:"20px 24px", marginBottom:20, position:"relative", overflow:"hidden", textAlign:"center" }}>
            <div style={{ position:"absolute", right:-20, top:-20, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
            <h1 style={{ fontSize:28, fontWeight:600, color:"#fff", position:"relative", zIndex:1 }}>Mes Rendez-vous</h1>
            <p style={{ fontSize:15, color:"rgba(255,255,255,0.85)", marginTop:4, position:"relative", zIndex:1 }}>
              Gérez et suivez l'ensemble de vos rendez-vous patients.
            </p>
          </div>

          {/* Contenu */}
          {loading ? (
            <p style={{ color:"#111827", textAlign:"center", padding:"2rem", fontSize:15 }}>Chargement...</p>
          ) : rdvs.length === 0 ? (
            <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", padding:"3rem", textAlign:"center" }}>
              <p style={{ color:"#111827", fontSize:15 }}>Aucun rendez-vous trouvé.</p>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
              {rdvs.map((rdv) => {
                const cfg = STATUT_CFG[rdv.statut] ?? { label:rdv.statut, cls:"attente" };
                const bs  = badgeStyle[cfg.cls] ?? badgeStyle.attente;
                const date = new Date(rdv.date_heure).toLocaleDateString("fr-FR")
                           + " " + new Date(rdv.date_heure).toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" });

                return (
                  <div key={rdv.id} style={{ background:"#fff", borderRadius:10, overflow:"hidden", border:"1px solid #e5e7eb" }}>

                    {/* En-tête bleu */}
                    <div style={{ background:G, padding:"10px 12px", display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ color:"#fff", fontSize:15 }}>📅</span>
                      <span style={{ color:"#fff", fontSize:14, fontWeight:500 }}>{date}</span>
                    </div>

                    {/* Corps */}
                    <div style={{ padding:14 }}>

                      {/* Patient */}
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                        <div style={{ width:40, height:40, borderRadius:"50%", background:G2, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:20 }}>👤</div>
                        <div>
                          <div style={{ fontSize:15, fontWeight:500, color:"#111827" }}>
                            {rdv.patient?.utilisateur?.prenom} {rdv.patient?.utilisateur?.nom}
                          </div>
                          <div style={{ fontSize:13, color:"#111827", display:"flex", alignItems:"center", gap:3, marginTop:2 }}>
                            <span style={{ color:"#1565c0" }}>📞</span>
                            {rdv.patient?.utilisateur?.telephone ?? "—"}
                          </div>
                        </div>
                      </div>

                      {/* Motif */}
                      <div style={{ fontSize:14, color:"#111827", marginBottom:10, display:"flex", alignItems:"center", gap:4 }}>
                        <span style={{ color:"#1565c0" }}>📋</span>
                        Motif : {rdv.motif ?? "Non spécifié"}
                      </div>

                      {/* Badge statut */}
                      <div style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"4px 12px", borderRadius:20, fontSize:13, fontWeight:500, marginBottom:12, ...bs }}>
                        {cfg.cls === "confirme" ? "✅" : "🕐"} Statut : {cfg.label}
                      </div>

                      {/* Boutons */}
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {rdv.statut === "en_attente" && <>
                          <button onClick={() => handle(confirmer, rdv.id)} style={btnConfirm}>Confirmer</button>
                          <button onClick={() => handle(refuser,   rdv.id)} style={btnRefuse}>Rejeter</button>
                        </>}
                        {rdv.statut === "confirme" && (
                          <button onClick={() => onNavigate("teleconsult-doctor", { rdvId:rdv.id })} style={btnCall}>
                            Démarrer l'appel
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

const btnConfirm = { padding:"6px 16px", background:"linear-gradient(90deg,#16a34a,#22c55e)", color:"#fff", border:"none", borderRadius:6, fontSize:13, cursor:"pointer", fontWeight:500 };
const btnRefuse  = { padding:"6px 16px", background:"linear-gradient(90deg,#ef4444,#dc2626)", color:"#fff", border:"none", borderRadius:6, fontSize:13, cursor:"pointer", fontWeight:500 };
const btnCall    = { padding:"6px 16px", background:"linear-gradient(90deg,#06b6d4,#0ea5e9)", color:"#fff", border:"none", borderRadius:6, fontSize:13, cursor:"pointer", fontWeight:500 };