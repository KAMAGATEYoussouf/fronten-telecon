import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import api from "../../services/api";
import { BG } from "../../styles/tokens";
import { Sidebar, VideoCall, Avatar } from "../../components";
import { DossierMedicalService } from "../../services";

const G = "linear-gradient(90deg,#1565c0,#1e88e5)";

export default function TeleconsultDoctor({ onNavigate, rdvId }) {
  const { user } = useAuth();

  const { data: rdv, loading } = useApi(
    () => api.get(`/rendez-vous/${rdvId}`),
    [rdvId]
  );

  // ✅ Charger le dossier médical du patient
  const { data: dossier } = useApi(
    () => rdv?.patient_id
      ? DossierMedicalService.dossierPatient(rdv.patient_id)
      : Promise.resolve(null),
    [rdv?.patient_id]
  );

  // ✅ Parser les données montre
  const donneesMon = dossier?.donnees_montre
    ? (() => {
        try { return JSON.parse(dossier.donnees_montre); }
        catch { return null; }
      })()
    : null;

  const [form, setForm] = useState({
    diagnostic: "",
    notes:      "",
    conseils:   "",
    ordonnance: "",
  });
  const [terminating, setTerminating] = useState(false);
  const [error,        setError]       = useState(null);
  const [done,         setDone]        = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleTerminer() {
    setTerminating(true);
    setError(null);
    try {
      let teleconsultId = rdv?.teleconsultation?.id;

      if (!teleconsultId) {
        const res = await api.post(`/rendez-vous/${rdvId}/teleconsultation`);
        teleconsultId = res.id;
      }

      const ordonnances = form.ordonnance
        ? [{
            liste_medicaments: form.ordonnance
              .split("\n")
              .filter(line => line.trim())
              .map(line => ({
                nom:          line.trim(),
                dosage:       null,
                duree:        null,
                instructions: null,
              }))
          }]
        : [];

      const payload = {
        diagnostic:  form.diagnostic || null,
        notes:       form.notes      || null,
        conseils:    form.conseils   || null,
        ordonnances: ordonnances.length > 0 ? ordonnances : [],
      };
      await api.put(`/teleconsultations/${teleconsultId}`, payload);
      await api.post(`/teleconsultations/${teleconsultId}/terminer`);

      setDone(true);
    } catch (e) {
      console.log("erreur:", e.status, e.message, JSON.stringify(e.errors));
      setError(e.message);
    } finally {
      setTerminating(false);
    }
  }

  const patient = rdv?.patient?.utilisateur;

  // ── Écran succès ──
  if (done) {
    return (
      <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", background:BG }}>
        <div style={{ background:G, height:46, flexShrink:0 }} />
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e5e7eb", padding:"3rem", textAlign:"center", maxWidth:420 }}>
            <div style={{ fontSize:52, marginBottom:12 }}>✅</div>
            <p style={{ fontSize:18, fontWeight:600, color:"#166534", marginBottom:6 }}>Consultation terminée !</p>
            <p style={{ fontSize:15, color:"#111827", marginBottom:20 }}>
              Le dossier médical et la facture ont été mis à jour automatiquement.
            </p>
            <button
              onClick={() => onNavigate("doctor-appointments")}
              style={{ ...btnBlue, padding:"10px 24px", fontSize:15 }}
            >
              Retour aux rendez-vous
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <Avatar user={user} size={30} fontSize={11} />
        </div>
      </div>

      <div style={{ display:"flex", flex:1 }}>
        <Sidebar role="doctor" page="doctor-appointments" onNavigate={onNavigate} />

        <main style={{ flex:1, overflowY:"auto", padding:16 }}>

          {/* Bandeau titre */}
          <div style={{ background:G, borderRadius:14, padding:"16px 24px", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <h2 style={{ fontSize:22, fontWeight:600, color:"#fff", margin:0 }}>📹 Appel vidéo</h2>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.85)", margin:"4px 0 0" }}>
                🔴 Dr. {user?.prenom} {user?.nom}
              </p>
            </div>
            <div style={{ background:"rgba(255,255,255,0.15)", padding:"4px 14px", borderRadius:20, fontSize:13, color:"#fff" }}>
              RDV #{rdvId}
            </div>
          </div>

          {error && (
            <div style={{ background:"#fee2e2", color:"#991b1b", borderRadius:8, padding:"10px 14px", marginBottom:12, fontSize:14 }}>
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <p style={{ color:"#111827", textAlign:"center", padding:"2rem", fontSize:15 }}>Chargement...</p>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16 }}>

              {/* ── Colonne gauche ── */}
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

                {/* Infos patient */}
                <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", overflow:"hidden" }}>
                  <div style={{ background:G, padding:"10px 14px" }}>
                    <span style={{ color:"#fff", fontSize:15, fontWeight:500 }}>👤 Informations patient</span>
                  </div>
                  <div style={{ padding:"14px", display:"flex", flexDirection:"column", gap:8 }}>
                    <p style={{ margin:0, fontSize:15, color:"#111827" }}>
                      <strong>Nom :</strong> {patient?.prenom ?? "—"} {patient?.nom ?? ""}
                    </p>
                    <p style={{ margin:0, fontSize:15, color:"#111827" }}>
                      <strong>Téléphone :</strong>{" "}
                      {rdv?.patient?.utilisateur?.telephone ?? patient?.telephone ?? "—"}
                    </p>
                    <p style={{ margin:0, fontSize:15, color:"#111827" }}>
                      <strong>Motif :</strong> {rdv?.motif ?? "—"}
                    </p>
                    <p style={{ margin:0, fontSize:15, color:"#111827" }}>
                      <strong>Statut RDV :</strong>{" "}
                      <span style={{
                        padding:"2px 10px", borderRadius:20, fontSize:13, fontWeight:500,
                        background: rdv?.statut === "en_cours" ? "#fef9c3" :
                                    rdv?.statut === "termine"  ? "#dcfce7" : "#EFF6FF",
                        color:      rdv?.statut === "en_cours" ? "#854d0e" :
                                    rdv?.statut === "termine"  ? "#166534" : "#1565c0",
                      }}>
                        {rdv?.statut === "en_cours" ? "🟡 En cours" :
                         rdv?.statut === "termine"  ? "✅ Terminé"  :
                         rdv?.statut === "confirme" ? "🔵 Confirmé" : rdv?.statut}
                      </span>
                    </p>
                  </div>
                </div>

                {/* ✅ Données montre du patient */}
                {donneesMon ? (
                  <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", overflow:"hidden" }}>
                    <div style={{ background:G, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ color:"#fff", fontSize:15, fontWeight:500 }}>⌚ Données montre du patient</span>
                      <span style={{ color:"rgba(255,255,255,0.8)", fontSize:12 }}>
                        {donneesMon.updated_at
                          ? new Date(donneesMon.updated_at).toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" })
                          : ""}
                      </span>
                    </div>
                    <div style={{ padding:14 }}>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:10 }}>
                        {[
                          { icon:"❤️",  label:"Fréquence cardiaque", value:`${donneesMon.heartrate} bpm`,                                    color: donneesMon.heartrate > 100 ? "#dc2626" : "#166534"  },
                          { icon:"💨",  label:"SpO2",                value:`${donneesMon.spo2} %`,                                           color: donneesMon.spo2 < 95 ? "#dc2626" : "#166534"         },
                          { icon:"🩺",  label:"Tension",             value:`${donneesMon.tension_systole}/${donneesMon.tension_diastole} mmHg`, color:"#1565c0"                                           },
                          { icon:"🚶",  label:"Pas",                 value:`${donneesMon.steps?.toLocaleString()} pas`,                       color:"#1565c0"                                            },
                          { icon:"😴",  label:"Sommeil",             value:`${donneesMon.sleep} h`,                                           color:"#7c3aed"                                            },
                          { icon:"🌡️", label:"Température",         value:`${donneesMon.temperature} °C`,                                    color: donneesMon.temperature > 37.5 ? "#dc2626" : "#166534"},
                          { icon:"🔥",  label:"Calories",            value:`${donneesMon.calories} kcal`,                                     color:"#d97706"                                            },
                        ].map(({ icon, label, value, color }) => (
                          <div key={label} style={{ background:"#f8fafd", borderRadius:8, padding:"10px", border:"1px solid #e0e7ef", textAlign:"center" }}>
                            <div style={{ fontSize:22, marginBottom:4 }}>{icon}</div>
                            <div style={{ fontSize:11, color:"#374151", marginBottom:3 }}>{label}</div>
                            <div style={{ fontSize:14, fontWeight:700, color }}>{value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Alertes anomalies */}
                      {(donneesMon.heartrate > 100 || donneesMon.spo2 < 95 || donneesMon.temperature > 37.5) && (
                        <div style={{ background:"#fee2e2", border:"1px solid #fca5a5", borderRadius:8, padding:"10px 14px", marginTop:10 }}>
                          <p style={{ margin:0, fontSize:14, fontWeight:600, color:"#991b1b", marginBottom:4 }}>⚠️ Anomalie détectée</p>
                          {donneesMon.heartrate > 100    && <p style={{ margin:0, fontSize:13, color:"#991b1b" }}>• FC élevée : {donneesMon.heartrate} bpm</p>}
                          {donneesMon.spo2 < 95          && <p style={{ margin:0, fontSize:13, color:"#991b1b" }}>• SpO2 bas : {donneesMon.spo2}%</p>}
                          {donneesMon.temperature > 37.5 && <p style={{ margin:0, fontSize:13, color:"#991b1b" }}>• Température élevée : {donneesMon.temperature}°C</p>}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", padding:"14px", textAlign:"center" }}>
                    <p style={{ color:"#374151", fontSize:14 }}>⌚ Aucune donnée montre disponible pour ce patient.</p>
                    <p style={{ color:"#6B7280", fontSize:13, marginTop:4 }}>Le patient doit connecter sa montre depuis son espace.</p>
                  </div>
                )}

                {/* Zone vidéo */}
                <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", overflow:"hidden" }}>
                  <div style={{ background:G, padding:"10px 14px" }}>
                    <span style={{ color:"#fff", fontSize:15, fontWeight:500 }}>📹 Vidéo</span>
                  </div>
                  <VideoCall
                    rdvId={rdvId}
                    displayName={`Dr. ${user?.prenom} ${user?.nom}`}
                    onHangup={() => {}}
                  />
                </div>

              </div>

              {/* ── Colonne droite — formulaire ── */}
              <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", overflow:"hidden", alignSelf:"start" }}>
                <div style={{ background:G, padding:"10px 14px" }}>
                  <span style={{ color:"#fff", fontSize:15, fontWeight:500 }}>📋 Consultation</span>
                </div>
                <div style={{ padding:14, display:"flex", flexDirection:"column", gap:12 }}>

                  {[
                    { key:"diagnostic", label:"Diagnostic",  ph:"Diagnostic du patient",     rows:3 },
                    { key:"notes",      label:"Notes",       ph:"Notes importantes",          rows:3 },
                    { key:"conseils",   label:"Conseils",    ph:"Conseils au patient",        rows:2 },
                    { key:"ordonnance", label:"Ordonnance",  ph:"Un médicament par ligne\nex: Paracétamol 500mg", rows:3 },
                  ].map(({ key, label, ph, rows }) => (
                    <div key={key}>
                      <label style={{ fontSize:14, fontWeight:500, color:"#111827", display:"block", marginBottom:5 }}>{label}</label>
                      <textarea
                        rows={rows}
                        placeholder={ph}
                        value={form[key]}
                        onChange={set(key)}
                        style={{ width:"100%", padding:"8px 10px", border:"1px solid #d1d5db", borderRadius:7, fontSize:14, resize:"vertical", fontFamily:"inherit", outline:"none", color:"#111827" }}
                      />
                    </div>
                  ))}

                  <div style={{ background:"#f0f4f8", borderRadius:7, padding:"10px 12px", fontSize:14, color:"#111827" }}>
                    {rdv?.teleconsultation?.id
                      ? `✅ Téléconsultation #${rdv.teleconsultation.id} — En cours`
                      : "ℹ️ La téléconsultation démarrera automatiquement"
                    }
                  </div>

                  <button
                    onClick={handleTerminer}
                    disabled={terminating}
                    style={{ ...btnBlue, width:"100%", padding:"12px", fontSize:15, opacity: terminating ? 0.7 : 1 }}
                  >
                    {terminating ? "Enregistrement en cours..." : "💾 Enregistrer et terminer"}
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

const btnBlue = { padding:"7px 16px", background:"linear-gradient(90deg,#1565c0,#1e88e5)", color:"#fff", border:"none", borderRadius:7, fontSize:13, cursor:"pointer", fontWeight:500 };