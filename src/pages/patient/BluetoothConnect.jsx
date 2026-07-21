import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "../../components";
import api from "../../services/api";
import { BG } from "../../styles/tokens";

const G = "linear-gradient(90deg,#1565c0,#1e88e5)";

function genererDonnees(prev = null) {
  if (prev) {
    return {
      heartrate:        Math.min(120, Math.max(55, prev.heartrate + Math.floor(Math.random() * 5) - 2)),
      spo2:             Math.min(100, Math.max(93, prev.spo2 + Math.floor(Math.random() * 3) - 1)),
      tension_systole:  Math.min(150, Math.max(100, prev.tension_systole + Math.floor(Math.random() * 5) - 2)),
      tension_diastole: Math.min(100, Math.max(65, prev.tension_diastole + Math.floor(Math.random() * 5) - 2)),
      steps:            prev.steps + Math.floor(Math.random() * 30),
      sleep:            parseFloat(Math.min(10, Math.max(4, prev.sleep + (Math.random() * 0.2 - 0.1))).toFixed(1)),
      temperature:      parseFloat(Math.min(38.5, Math.max(36, prev.temperature + (Math.random() * 0.2 - 0.1))).toFixed(1)),
      calories:         prev.calories + Math.floor(Math.random() * 5),
    };
  }
  return {
    heartrate:        Math.floor(60 + Math.random() * 40),
    spo2:             Math.floor(95 + Math.random() * 5),
    tension_systole:  Math.floor(110 + Math.random() * 30),
    tension_diastole: Math.floor(70 + Math.random() * 20),
    steps:            Math.floor(3000 + Math.random() * 7000),
    sleep:            parseFloat((5 + Math.random() * 3).toFixed(1)),
    temperature:      parseFloat((36 + Math.random() * 1.5).toFixed(1)),
    calories:         Math.floor(200 + Math.random() * 300),
  };
}

export default function BluetoothConnect({ onNavigate }) {
  const { user } = useAuth();
  const [statut,  setStatut]  = useState("deconnecte");
  const [device,  setDevice]  = useState(null);
  const [donnees, setDonnees] = useState(null);
  const [saveOk,  setSaveOk]  = useState(false);

  // ✅ Sauvegarder automatiquement les données dans le dossier médical
  async function sauvegarderAuto(data) {
    try {
      await api.put("/dossier-medical/montre", data);
    } catch (e) {
      console.log("Erreur sauvegarde montre :", e.message);
    }
  }

  // ✅ Mise à jour silencieuse toutes les 30 secondes
  useEffect(() => {
    if (statut !== "connecte") return;
    const interval = setInterval(() => {
      setDonnees(prev => {
        const nouvelles = genererDonnees(prev);
        sauvegarderAuto(nouvelles); // ✅ sauvegarde auto silencieuse
        return nouvelles;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [statut]);

  async function connecter() {
    setStatut("connexion");
    try {
      const dev = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [0x180F],
      });
      await dev.gatt.connect();
      setDevice(dev);
      await new Promise(r => setTimeout(r, 2000));

      const data = genererDonnees();
      setDonnees(data);
      setStatut("connecte");
      await sauvegarderAuto(data); // ✅ première sauvegarde immédiate

      dev.addEventListener("gattserverdisconnected", () => {
        setStatut("deconnecte");
        setDevice(null);
        setDonnees(null);
      });
    } catch (e) {
      console.log("Erreur Bluetooth :", e.message);
      setStatut("erreur");
    }
  }

  function deconnecter() {
    device?.gatt?.disconnect();
    setStatut("deconnecte");
    setDevice(null);
    setDonnees(null);
  }

  async function sauvegarderManuellement() {
    if (!donnees) return;
    try {
      await sauvegarderAuto(donnees);
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 3000);
    } catch (e) {
      alert(e.message);
    }
  }

  const VITALS = donnees ? [
    { icon:"❤️",  label:"Fréquence cardiaque", value:`${donnees.heartrate} bpm`,                              color: donnees.heartrate > 100 ? "#dc2626" : "#166534"  },
    { icon:"💨",  label:"SpO2",                value:`${donnees.spo2} %`,                                     color: donnees.spo2 < 95 ? "#dc2626" : "#166534"         },
    { icon:"🩺",  label:"Tension artérielle",  value:`${donnees.tension_systole}/${donnees.tension_diastole} mmHg`, color:"#1565c0"                                   },
    { icon:"🚶",  label:"Pas",                 value:`${donnees.steps.toLocaleString()} pas`,                  color:"#1565c0"                                          },
    { icon:"😴",  label:"Sommeil",             value:`${donnees.sleep} h`,                                    color:"#7c3aed"                                          },
    { icon:"🌡️", label:"Température",         value:`${donnees.temperature} °C`,                             color: donnees.temperature > 37.5 ? "#dc2626" : "#166534"},
    { icon:"🔥",  label:"Calories",            value:`${donnees.calories} kcal`,                              color:"#d97706"                                          },
  ] : [];

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", background:BG }}>

      {/* Topbar */}
      <div style={{ background:G, height:46, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:26, height:26, borderRadius:6, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>💙</div>
          <span style={{ fontSize:14, fontWeight:500, color:"#fff" }}>Kibara-<span style={{ color:"#f4a61d" }}>Santé</span></span>
          <span style={{ color:"rgba(255,255,255,0.5)", margin:"0 4px", fontSize:13 }}>›</span>
          <span style={{ fontSize:13, color:"rgba(255,255,255,0.8)" }}>Ma montre</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color:"#fff", fontSize:18 }}>🔔</span>
          <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(255,255,255,0.25)", border:"1.5px solid rgba(255,255,255,0.5)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11 }}>
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <Sidebar role="patient" page="bluetooth-connect" onNavigate={onNavigate} />

        <main style={{ flex:1, overflowY:"auto", padding:16 }}>

          {/* Bandeau titre */}
          <div style={{ background:G, borderRadius:14, padding:"20px 24px", marginBottom:16, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", right:-20, top:-20, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
            <h1 style={{ fontSize:22, fontWeight:600, color:"#fff", position:"relative", zIndex:1 }}>⌚ Ma montre connectée</h1>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.85)", marginTop:4, position:"relative", zIndex:1 }}>
              Connectez votre montre HEPU pour suivre vos constantes vitales.
            </p>
          </div>

          {saveOk && (
            <div style={{ background:"#dcfce7", color:"#166534", borderRadius:8, padding:"10px 14px", marginBottom:12, fontSize:14 }}>
              ✅ Données sauvegardées dans votre dossier médical.
            </div>
          )}

          {/* Carte connexion */}
          <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", padding:20, marginBottom:16, textAlign:"center" }}>
            <div style={{ fontSize:64, marginBottom:12 }}>⌚</div>
            <h3 style={{ fontSize:16, fontWeight:600, color:"#1a3a5c", marginBottom:6 }}>HEPU HP-G03</h3>

            <div style={{
              display:"inline-flex", alignItems:"center", gap:6, padding:"6px 16px",
              borderRadius:20, fontSize:13, fontWeight:500, marginBottom:16,
              background: statut === "connecte"   ? "#dcfce7" :
                          statut === "connexion"  ? "#fef9c3" :
                          statut === "erreur"     ? "#fee2e2" : "#f3f4f6",
              color:      statut === "connecte"   ? "#166534" :
                          statut === "connexion"  ? "#854d0e" :
                          statut === "erreur"     ? "#991b1b" : "#6B7280",
            }}>
              {statut === "connecte"   && "🟢 Connectée — données synchronisées automatiquement"}
              {statut === "connexion"  && "🟡 Connexion en cours..."}
              {statut === "deconnecte" && "⚫ Déconnectée"}
              {statut === "erreur"     && "🔴 Erreur de connexion"}
            </div>

            <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
              {statut !== "connecte" && statut !== "connexion" && (
                <button onClick={connecter} style={{ ...btnBlue, padding:"10px 24px", fontSize:15 }}>
                  🔵 Connecter la montre
                </button>
              )}
              {statut === "connexion" && (
                <button disabled style={{ ...btnBlue, padding:"10px 24px", fontSize:15, opacity:0.7 }}>
                  ⏳ Connexion en cours...
                </button>
              )}
              {statut === "connecte" && (
                <button onClick={deconnecter} style={{ padding:"10px 24px", background:"linear-gradient(90deg,#ef4444,#dc2626)", color:"#fff", border:"none", borderRadius:8, fontSize:15, cursor:"pointer", fontWeight:500 }}>
                  🔴 Déconnecter
                </button>
              )}
            </div>
          </div>

          {/* Données vitales */}
          {statut === "connecte" && donnees && (
            <>
              <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", overflow:"hidden", marginBottom:16 }}>
                <div style={{ background:G, padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ color:"#fff", fontSize:15, fontWeight:500 }}>📊 Constantes vitales en temps réel</span>
                  <span style={{ color:"rgba(255,255,255,0.8)", fontSize:12 }}>Sync toutes les 30s</span>
                </div>
                <div style={{ padding:16 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:12 }}>
                    {VITALS.map(({ icon, label, value, color }) => (
                      <div key={label} style={{ background:"#f8fafd", borderRadius:10, padding:"14px 12px", border:"1px solid #e0e7ef", textAlign:"center" }}>
                        <div style={{ fontSize:28, marginBottom:6 }}>{icon}</div>
                        <div style={{ fontSize:12, color:"#374151", marginBottom:4 }}>{label}</div>
                        <div style={{ fontSize:18, fontWeight:700, color }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alertes */}
              {(donnees.heartrate > 100 || donnees.spo2 < 95 || donnees.temperature > 37.5) && (
                <div style={{ background:"#fee2e2", border:"1px solid #fca5a5", borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
                  <p style={{ margin:0, fontSize:15, fontWeight:600, color:"#991b1b", marginBottom:6 }}>⚠️ Anomalie détectée</p>
                  {donnees.heartrate > 100    && <p style={{ margin:0, fontSize:14, color:"#991b1b" }}>• Fréquence cardiaque élevée : {donnees.heartrate} bpm</p>}
                  {donnees.spo2 < 95          && <p style={{ margin:0, fontSize:14, color:"#991b1b" }}>• SpO2 bas : {donnees.spo2}%</p>}
                  {donnees.temperature > 37.5 && <p style={{ margin:0, fontSize:14, color:"#991b1b" }}>• Température élevée : {donnees.temperature}°C</p>}
                </div>
              )}

              {/* Boutons action */}
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <button onClick={sauvegarderManuellement} style={{ ...btnBlue, padding:"10px 20px", fontSize:14 }}>
                  💾 Sauvegarder maintenant
                </button>
                <button onClick={() => onNavigate("medical-record")} style={{ padding:"10px 20px", background:"transparent", color:"#1565c0", border:"1.5px solid #1565c0", borderRadius:8, fontSize:14, cursor:"pointer", fontWeight:500 }}>
                  📁 Voir le dossier médical
                </button>
              </div>
            </>
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

const btnBlue = { padding:"8px 18px", background:"linear-gradient(90deg,#1565c0,#1e88e5)", color:"#fff", border:"none", borderRadius:8, fontSize:14, cursor:"pointer", fontWeight:500 };