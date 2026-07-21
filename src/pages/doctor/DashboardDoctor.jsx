import { Sidebar, Avatar } from "../../components";
import { useAuth } from "../../context/AuthContext";
import { useApi, useAction } from "../../hooks/useApi";
import MedecinService from "../../services/MedecinService";
import RendezVousService from "../../services/RendezVousService";
import { BG } from "../../styles/tokens";

const G = "linear-gradient(90deg,#1565c0,#1e88e5)";
const JOURS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const jMap  = { "Lun":1,"Mar":2,"Mer":3,"Jeu":4,"Ven":5,"Sam":6,"Dim":0 };

export default function DashboardDoctor({ onNavigate }) {
  const { user }   = useAuth();
  const { data, loading, refetch } = useApi(() => MedecinService.dashboard());
  const { data: dispData }         = useApi(() => MedecinService.getDisponibilites());
  const { data: rdvData }          = useApi(() => RendezVousService.liste());
  const { execute: confirmer }     = useAction((id) => RendezVousService.confirmer(id));
  const { execute: refuser }       = useAction((id) => RendezVousService.refuser(id));

  const aVenir    = data?.a_venir    ?? [];
  const enAttente = data?.en_attente ?? [];
  const rdvs      = rdvData?.data    ?? [];

  let slots = {};
  if (dispData?.disponibilites) {
    try {
      const parsed = JSON.parse(dispData.disponibilites);
      const s = parsed.slots || {};
      const isOldFormat = Object.keys(s).some(key =>
        ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].some(j => key.startsWith(j))
      );
      if (!isOldFormat) slots = s;
    } catch {}
  }

  function isReserved(date, heure) {
    return rdvs.some(rdv => {
      const d   = new Date(rdv.date_heure);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`;
      const h   = `${String(d.getUTCHours()).padStart(2,"0")}:${String(d.getUTCMinutes()).padStart(2,"0")}`;
      return key === date && h === heure && ["en_attente","confirme"].includes(rdv.statut);
    });
  }

  const slotsByDate = {};
  Object.keys(slots).forEach(key => {
    if (!slots[key]) return;
    const parts = key.split("-");
    const heure = parts.pop();
    const date  = parts.join("-");
    if (!slotsByDate[date]) slotsByDate[date] = [];
    slotsByDate[date].push({ heure, key });
  });
  const dates = Object.keys(slotsByDate).sort();

  async function handleConfirmer(id) {
    try { await confirmer(id); refetch(); } catch (e) { alert(e.message); }
  }
  async function handleRefuser(id) {
    try { await refuser(id); refetch(); } catch (e) { alert(e.message); }
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

      <div style={{ display:"flex", flex:1 }}>
        <Sidebar role="doctor" page="dashboard-doctor" onNavigate={onNavigate} />

        <main style={{ flex:1, overflowY:"auto", padding:20 }}>

          {/* Profil */}
          <div style={{ background:"#fff", borderRadius:14, padding:"16px 20px", marginBottom:16, display:"flex", alignItems:"center", gap:14, border:"1px solid #e5e7eb" }}>
            {/* ✅ Grande photo de profil */}
            <Avatar user={user} size={56} fontSize={20} />
            <div>
              <h2 style={{ margin:0, fontWeight:600, fontSize:18, color:"#1a3a5c" }}>
                Bonjour, Dr. {user?.prenom} {user?.nom}
              </h2>
              <p style={{ margin:"4px 0 0", color:"#111827", fontSize:15 }}>
                Spécialité : {user?.medecin?.specialite?.nom ?? "—"}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12, marginBottom:16 }}>
            {[
              { icon:"📅", val: data?.total_rendez_vous ?? "—", lbl:"Rendez-vous totaux" },
              { icon:"👥", val: data?.patients_suivis   ?? "—", lbl:"Patients suivis"    },
            ].map(({ icon, val, lbl }) => (
              <div key={lbl} style={{ background:"#EFF6FF", borderRadius:10, padding:"16px 14px", textAlign:"center", border:"1px solid #bfdbfe" }}>
                <div style={{ fontSize:22, marginBottom:6, color:"#1565c0" }}>{icon}</div>
                <div style={{ fontSize:24, fontWeight:600, marginBottom:3, color:"#1565c0" }}>{val}</div>
                <div style={{ fontSize:14, color:"#111827" }}>{lbl}</div>
              </div>
            ))}
          </div>

          {/* Créneaux à venir */}
          <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", padding:16, marginBottom:16 }}>
            <h3 style={{ fontSize:17, fontWeight:600, color:"#1a3a5c", marginBottom:14 }}>
              🗓 Créneaux à venir
            </h3>
            {dates.length === 0 ? (
              <p style={{ color:"#111827", fontSize:15 }}>Aucun créneau défini.</p>
            ) : (
              <>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6, marginBottom:8 }}>
                  {JOURS.map(j => (
                    <div key={j} style={{ fontSize:14, fontWeight:600, color:"#1565c0", textAlign:"center", padding:"5px 4px", background:"#EFF6FF", borderRadius:6 }}>
                      {j}
                    </div>
                  ))}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6 }}>
                  {JOURS.map(j => {
                    const matchDates = dates.filter(d => new Date(d).getDay() === jMap[j]);
                    if (matchDates.length === 0) return <div key={j} />;
                    return (
                      <div key={j} style={{ display:"flex", flexDirection:"column", gap:4 }}>
                        {matchDates.map(d =>
                          slotsByDate[d]
                            .sort((a,b) => a.heure.localeCompare(b.heure))
                            .map(({ heure, key }) => {
                              const reserved  = isReserved(d, heure);
                              const dateLabel = d.slice(5).replace("-","/");
                              return (
                                <div key={key} style={{
                                  padding:"5px 4px", borderRadius:6, textAlign:"center",
                                  fontSize:12, fontWeight:500, border:"1.5px solid",
                                  background:  reserved ? "#fee2e2" : "#dcfce7",
                                  borderColor: reserved ? "#fca5a5" : "#86efac",
                                  color:       reserved ? "#991b1b" : "#166634",
                                }}>
                                  <span style={{ display:"block", fontSize:12, marginBottom:2, fontWeight:600 }}>
                                    {dateLabel} - {heure}
                                  </span>
                                  <span style={{ display:"block", fontSize:11 }}>
                                    {reserved ? "Réservé" : "Disponible"}
                                  </span>
                                </div>
                              );
                            })
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            <button onClick={() => onNavigate("manage-slots")} style={{ ...btnBlue, marginTop:14 }}>
              Gérer mes créneaux
            </button>
          </div>

          {/* En attente */}
          {enAttente.length > 0 && (
            <div style={{ background:"#fff", borderRadius:10, border:"1px solid #fecaca", overflow:"hidden", marginBottom:16 }}>
              <div style={{ background:"linear-gradient(90deg,#dc2626,#ef4444)", padding:"10px 16px", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ color:"#fff", fontSize:15 }}>⏳</span>
                <span style={{ color:"#fff", fontSize:15, fontWeight:500 }}>En attente de confirmation ({enAttente.length})</span>
              </div>
              <div style={{ padding:10, display:"flex", flexDirection:"column", gap:8 }}>
                {enAttente.map((rdv) => (
                  <div key={rdv.id} style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"10px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <div>
                      <p style={{ margin:0, fontWeight:500, fontSize:15, color:"#111827" }}>
                        {rdv.patient?.utilisateur?.prenom} {rdv.patient?.utilisateur?.nom}
                      </p>
                      <p style={{ margin:0, fontSize:14, color:"#111827" }}>
                        📅 {new Date(rdv.date_heure).toLocaleString("fr-FR")}
                      </p>
                      {rdv.motif && (
                        <p style={{ margin:0, fontSize:14, color:"#111827" }}>Motif : {rdv.motif}</p>
                      )}
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => handleConfirmer(rdv.id)} style={btnConfirm}>✅ Confirmer</button>
                      <button onClick={() => handleRefuser(rdv.id)}   style={btnRefuse}>❌ Refuser</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RDV à venir */}
          <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", overflow:"hidden", marginBottom:16 }}>
            <div style={{ background:G, padding:"10px 16px", display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ color:"#fff", fontSize:15 }}>📅</span>
              <span style={{ color:"#fff", fontSize:15, fontWeight:500 }}>Rendez-vous à venir</span>
            </div>
            <div style={{ padding:10, display:"flex", flexDirection:"column", gap:8 }}>
              {loading ? (
                <p style={{ color:"#111827", fontSize:14 }}>Chargement...</p>
              ) : aVenir.length === 0 ? (
                <p style={{ color:"#111827", fontSize:14 }}>Aucun rendez-vous à venir.</p>
              ) : aVenir.map((rdv) => (
                <div key={rdv.id} style={{ background:"#f8fafd", border:"1px solid #dce8f5", borderRadius:8, padding:"10px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                  <div>
                    <p style={{ margin:0, fontWeight:500, fontSize:15, color:"#111827" }}>
                      {rdv.patient?.utilisateur?.prenom} {rdv.patient?.utilisateur?.nom}
                    </p>
                    <p style={{ margin:0, fontSize:14, color:"#111827" }}>
                      📅 {new Date(rdv.date_heure).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"4px 12px", borderRadius:20, fontSize:13, fontWeight:500, background:"#dcfce7", color:"#166534" }}>
                    ✅ Confirmé
                  </div>
                </div>
              ))}
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

const btnBlue    = { padding:"7px 18px", background:"linear-gradient(90deg,#1565c0,#1e88e5)", color:"#fff", border:"none", borderRadius:7, fontSize:13, cursor:"pointer", fontWeight:500 };
const btnConfirm = { padding:"6px 16px", background:"linear-gradient(90deg,#16a34a,#22c55e)", color:"#fff", border:"none", borderRadius:6, fontSize:13, cursor:"pointer", fontWeight:500 };
const btnRefuse  = { padding:"6px 16px", background:"linear-gradient(90deg,#dc2626,#ef4444)", color:"#fff", border:"none", borderRadius:6, fontSize:13, cursor:"pointer", fontWeight:500 };