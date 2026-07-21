import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import api from "../../services/api";
import { BG } from "../../styles/tokens";
import { Sidebar, VideoCall } from "../../components";

const G = "linear-gradient(90deg,#1565c0,#1e88e5)";

export default function TeleconsultPatient({ onNavigate, rdvId }) {
  const { user } = useAuth();

  const { data: rdv, loading } = useApi(
    () => api.get(`/rendez-vous/${rdvId}`),
    [rdvId]
  );

  const [vitals] = useState([
    { icon:"❤️",  label:"Heartrate",         value:"75 bpm"     },
    { icon:"🚶",  label:"Steps",             value:"10 000 pas"  },
    { icon:"😴",  label:"Sleep",             value:"7h00"        },
    { icon:"💨",  label:"Oxygen saturation", value:"98 %"        },
    { icon:"🌬️", label:"Respiratory rate",  value:"16 /min"     },
    { icon:"🌡️", label:"Temperature",       value:"36.6 °C"     },
  ]);

  const medecin = rdv?.medecin;

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", background:BG }}>

      {/* Topbar */}
      <div style={{ background:G, height:46, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:26, height:26, borderRadius:6, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>💙</div>
          <span style={{ fontSize:14, fontWeight:500, color:"#fff" }}>Kibara-<span style={{ color:"#f4a61d" }}>Santé</span></span>
          <span style={{ color:"rgba(255,255,255,0.5)", margin:"0 4px", fontSize:13 }}>›</span>
          <span style={{ fontSize:13, color:"rgba(255,255,255,0.8)" }}>Téléconsultation</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color:"#fff", fontSize:18 }}>🔔</span>
          <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(255,255,255,0.25)", border:"1.5px solid rgba(255,255,255,0.5)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11 }}>
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
        </div>
      </div>

      <div style={{ display:"flex", flex:1 }}>
        <Sidebar role="patient" page="appointments" onNavigate={onNavigate} />

        <main style={{ flex:1, overflowY:"auto", padding:16 }}>

          {/* Bandeau titre */}
          <div style={{ background:G, borderRadius:14, padding:"16px 24px", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <h2 style={{ fontSize:22, fontWeight:600, color:"#fff", margin:0 }}>📹 Appel vidéo</h2>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.85)", margin:"4px 0 0" }}>
                🔴 Connecté en tant que {user?.prenom} {user?.nom}
              </p>
            </div>
            <div style={{ background:"rgba(255,255,255,0.15)", padding:"4px 14px", borderRadius:20, fontSize:13, color:"#fff" }}>
              RDV #{rdvId}
            </div>
          </div>

          {loading ? (
            <p style={{ color:"#111827", textAlign:"center", padding:"2rem", fontSize:15 }}>Chargement...</p>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 260px", gap:16 }}>

              {/* ── Colonne gauche ── */}
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

                {/* Infos médecin */}
                <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", overflow:"hidden" }}>
                  <div style={{ background:G, padding:"10px 14px" }}>
                    <span style={{ color:"#fff", fontSize:15, fontWeight:500 }}>👨‍⚕️ Informations du médecin</span>
                  </div>
                  <div style={{ padding:"14px", display:"flex", flexDirection:"column", gap:8 }}>
                    <p style={{ margin:0, fontSize:15, color:"#111827" }}>
                      <strong>Nom :</strong> Dr. {medecin?.utilisateur?.prenom ?? "—"} {medecin?.utilisateur?.nom ?? ""}
                    </p>
                    <p style={{ margin:0, fontSize:15, color:"#111827" }}>
                      <strong>Spécialité :</strong> {medecin?.specialite?.nom ?? "—"}
                    </p>
                    <p style={{ margin:0, fontSize:15, color:"#111827" }}>
                      <strong>N° agrément :</strong> {medecin?.numero_ordre ?? "—"}
                    </p>
                    <p style={{ margin:0, fontSize:15, color:"#111827" }}>
                      <strong>Motif :</strong> {rdv?.motif ?? "—"}
                    </p>
                    <p style={{ margin:0, fontSize:15, color:"#111827" }}>
                      <strong>Paiement :</strong>{" "}
                      <span
                        onClick={() => onNavigate("payment")}
                        style={{ color:"#1565c0", cursor:"pointer", fontWeight:500 }}
                      >
                        Effectuer le paiement
                      </span>
                    </p>
                  </div>
                </div>

                {/* Zone vidéo */}
                <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", overflow:"hidden" }}>
                  <div style={{ background:G, padding:"10px 14px" }}>
                    <span style={{ color:"#fff", fontSize:15, fontWeight:500 }}>📹 Vidéo</span>
                  </div>
                  <VideoCall
                    rdvId={rdvId}
                    displayName={`${user?.prenom} ${user?.nom}`}
                    onHangup={() => onNavigate("appointments")}
                  />
                </div>

              </div>

              {/* ── Colonne droite — vitals ── */}
              <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", overflow:"hidden", alignSelf:"start" }}>
                <div style={{ background:G, padding:"10px 14px" }}>
                  <span style={{ color:"#fff", fontSize:15, fontWeight:500 }}>📍 Mes données de santé</span>
                </div>
                <div style={{ padding:14, display:"flex", flexDirection:"column", gap:8 }}>
                  {vitals.map(({ icon, label, value }) => (
                    <div key={label} style={{ background:"#f8fafd", borderRadius:8, padding:"10px 12px", border:"1px solid #e0e7ef", display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:22 }}>{icon}</span>
                      <div>
                        <p style={{ margin:0, fontSize:13, color:"#111827" }}>{label}</p>
                        <p style={{ margin:0, fontSize:15, fontWeight:500, color:"#1565c0" }}>{value}</p>
                      </div>
                    </div>
                  ))}
                  <button style={{ padding:"9px", background:G, color:"#fff", border:"none", borderRadius:7, fontSize:14, cursor:"pointer", marginTop:4 }}>
                    🔄 Rafraîchir
                  </button>
                </div>
              </div>

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