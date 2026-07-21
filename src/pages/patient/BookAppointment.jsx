import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "../../components";
import { useApi, useAction } from "../../hooks/useApi";
import MedecinService from "../../services/MedecinService";
import RendezVousService from "../../services/RendezVousService";
import { BG } from "../../styles/tokens";

const G = "linear-gradient(90deg,#1565c0,#1e88e5)";

export default function BookAppointment({ onNavigate, rdvId }) {
  const { user } = useAuth();
  const [step,      setStep]      = useState(1);
  const [selected,  setSelected]  = useState(null);
  const [slotKey,   setSlotKey]   = useState(null);
  const [motif,     setMotif]     = useState("");
  const [formError, setFormError] = useState(null);

  const { data, loading }                     = useApi(() => MedecinService.rechercher());
  const { execute: creer, loading: creating } = useAction(RendezVousService.creer);

  const { data: dispData } = useApi(
    () => selected ? MedecinService.detail(selected.id) : Promise.resolve(null),
    [selected?.id]
  );

  const { data: rdvData } = useApi(
    () => selected ? RendezVousService.liste({ medecin_id: selected.id }) : Promise.resolve(null),
    [selected?.id]
  );

  const medecins = data?.data ?? [];
  const rdvs     = rdvData?.data ?? [];

  let slots = {};
  const rawDisp = dispData?.disponibilites ?? dispData?.medecin?.disponibilites;
  if (rawDisp) {
    try {
      const parsed      = JSON.parse(rawDisp);
      const s           = parsed.slots || {};
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

  const now = new Date();
  const availableSlots = Object.keys(slots)
    .filter(key => {
      if (!slots[key]) return false;
      const parts = key.split("-");
      const heure = parts.pop();
      const date  = parts.join("-");
      const slotDate = new Date(`${date}T${heure}:00`);
      if (slotDate <= now) return false;
      if (isReserved(date, heure)) return false;
      return true;
    })
    .sort();

  const slotsByDate = {};
  availableSlots.forEach(key => {
    const parts = key.split("-");
    const heure = parts.pop();
    const date  = parts.join("-");
    if (!slotsByDate[date]) slotsByDate[date] = [];
    slotsByDate[date].push({ heure, key });
  });
  const availableDates = Object.keys(slotsByDate).sort();

  async function handleSubmit() {
    if (!selected || !slotKey) {
      setFormError("Veuillez sélectionner un médecin et un créneau.");
      return;
    }
    setFormError(null);
    try {
      const parts     = slotKey.split("-");
      const heure     = parts.pop();
      const date      = parts.join("-");
      const dateHeure = `${date}T${heure}:00`;
      await creer({ medecin_id: selected.id, date_heure: dateHeure, motif });
      onNavigate("appointments");
    } catch (e) { setFormError(e.message); }
  }

  // ── Composant photo médecin ──
  function MedecinAvatar({ m, size = 44 }) {
    if (m.utilisateur?.photo_profil) {
      return (
        <img
          src={m.utilisateur.photo_profil}
          alt="photo"
          style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", flexShrink:0, border:"2px solid #e5e7eb" }}
        />
      );
    }
    return (
      <div style={{ width:size, height:size, borderRadius:"50%", background:G, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size/2, flexShrink:0 }}>
        👨‍⚕️
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
          <span style={{ fontSize:13, color:"rgba(255,255,255,0.8)" }}>Prendre un rendez-vous</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color:"#fff", fontSize:18 }}>🔔</span>
          <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(255,255,255,0.25)", border:"1.5px solid rgba(255,255,255,0.5)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11 }}>
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <Sidebar role="patient" page="book-appointment" onNavigate={onNavigate} />

        <main style={{ flex:1, overflowY:"auto", padding:16 }}>

          {/* Bandeau titre */}
          <div style={{ background:G, borderRadius:14, padding:"20px 24px", marginBottom:16, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", right:-20, top:-20, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
            <h1 style={{ fontSize:22, fontWeight:600, color:"#fff", position:"relative", zIndex:1 }}>
              {step === 1 ? "Choisir un médecin" : step === 2 ? "Choisir un créneau" : "Confirmer le rendez-vous"}
            </h1>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.85)", marginTop:4, position:"relative", zIndex:1 }}>
              Étape {step} sur 3
            </p>
          </div>

          {formError && (
            <div style={{ background:"#fee2e2", color:"#991b1b", borderRadius:8, padding:"10px 14px", marginBottom:12, fontSize:14 }}>
              ⚠️ {formError}
            </div>
          )}

          {/* ── Étape 1 ── */}
          {step === 1 && (
            <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", padding:16 }}>
              <h3 style={{ fontSize:16, fontWeight:500, color:"#1a3a5c", marginBottom:14 }}>Médecins disponibles</h3>
              {loading ? (
                <p style={{ color:"#111827", fontSize:14, textAlign:"center" }}>Chargement...</p>
              ) : medecins.length === 0 ? (
                <p style={{ color:"#111827", fontSize:14, textAlign:"center" }}>Aucun médecin disponible.</p>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:10, maxHeight:420, overflowY:"auto" }}>
                  {medecins.map(m => (
                    <div
                      key={m.id}
                      onClick={() => { setSelected(m); setSlotKey(null); }}
                      style={{
                        display:"flex", gap:12, alignItems:"center",
                        padding:"12px 14px", borderRadius:10, cursor:"pointer",
                        border: selected?.id === m.id ? "2px solid #1565c0" : "1px solid #e5e7eb",
                        background: selected?.id === m.id ? "#EFF6FF" : "#fff",
                      }}
                    >
                      {/* ✅ Photo du médecin */}
                      <MedecinAvatar m={m} size={48} />
                      <div>
                        <p style={{ margin:0, fontWeight:500, fontSize:15, color:"#111827" }}>
                          Dr. {m.utilisateur?.prenom} {m.utilisateur?.nom}
                        </p>
                        <p style={{ margin:0, fontSize:13, color:"#111827" }}>
                          {m.specialite?.nom} — {m.region?.nom}
                        </p>
                      </div>
                      {selected?.id === m.id && (
                        <div style={{ marginLeft:"auto", width:22, height:22, borderRadius:"50%", background:"#1565c0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#fff" }}>✓</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <button
                disabled={!selected}
                onClick={() => setStep(2)}
                style={{ ...btnBlue, width:"100%", marginTop:14, padding:"11px", fontSize:15, opacity: selected ? 1 : 0.5 }}
              >
                Continuer →
              </button>
            </div>
          )}

          {/* ── Étape 2 ── */}
          {step === 2 && (
            <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", padding:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"#EFF6FF", borderRadius:8, marginBottom:16 }}>
                <MedecinAvatar m={selected} size={44} />
                <div>
                  <p style={{ margin:0, fontWeight:500, fontSize:15, color:"#1a3a5c" }}>
                    Dr. {selected?.utilisateur?.prenom} {selected?.utilisateur?.nom}
                  </p>
                  <p style={{ margin:0, fontSize:13, color:"#111827" }}>{selected?.specialite?.nom}</p>
                </div>
              </div>

              <h3 style={{ fontSize:15, fontWeight:500, color:"#1a3a5c", marginBottom:12 }}>Créneaux disponibles</h3>

              {availableDates.length === 0 ? (
                <div style={{ textAlign:"center", padding:"2rem 0" }}>
                  <p style={{ color:"#111827", fontSize:14, marginBottom:8 }}>Aucun créneau disponible pour ce médecin.</p>
                  <p style={{ color:"#374151", fontSize:13 }}>Le médecin n'a pas encore défini ses disponibilités.</p>
                </div>
              ) : availableDates.map(date => (
                <div key={date} style={{ marginBottom:14 }}>
                  <div style={{ padding:"6px 0", borderBottom:"1px solid #e5e7eb", marginBottom:8 }}>
                    <span style={{ fontSize:14, fontWeight:600, color:"#111827" }}>
                      📅 {new Date(date).toLocaleDateString("fr-FR", { weekday:"long", day:"2-digit", month:"long", year:"numeric" })}
                    </span>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {slotsByDate[date].map(({ heure, key }) => (
                      <div
                        key={key}
                        onClick={() => setSlotKey(key)}
                        style={{
                          padding:"9px 18px", borderRadius:8, cursor:"pointer",
                          fontSize:14, fontWeight:500,
                          border: slotKey === key ? "2px solid #1565c0" : "1.5px solid #86efac",
                          background: slotKey === key ? "#1565c0" : "#dcfce7",
                          color:      slotKey === key ? "#fff"    : "#166534",
                        }}
                      >
                        {heure}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ display:"flex", gap:8, marginTop:16 }}>
                <button onClick={() => setStep(1)} style={btnOutline}>← Retour</button>
                <button
                  disabled={!slotKey}
                  onClick={() => setStep(3)}
                  style={{ ...btnBlue, flex:1, padding:"11px", fontSize:15, opacity: slotKey ? 1 : 0.5 }}
                >
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* ── Étape 3 ── */}
          {step === 3 && (
            <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", padding:16 }}>
              <h3 style={{ fontSize:16, fontWeight:500, color:"#1a3a5c", marginBottom:16 }}>Récapitulatif</h3>

              <div style={{ background:"#f8fafd", borderRadius:8, border:"1px solid #e0e7ef", padding:"14px", marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                  <MedecinAvatar m={selected} size={48} />
                  <div>
                    <p style={{ margin:0, fontWeight:600, fontSize:15, color:"#111827" }}>
                      Dr. {selected?.utilisateur?.prenom} {selected?.utilisateur?.nom}
                    </p>
                    <p style={{ margin:0, fontSize:13, color:"#111827" }}>{selected?.specialite?.nom}</p>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:15, color:"#111827" }}>
                  <span style={{ color:"#1565c0" }}>📅</span>
                  <span>
                    <strong>Créneau :</strong>{" "}
                    {(() => {
                      const parts = slotKey.split("-");
                      const heure = parts.pop();
                      const date  = parts.join("-");
                      return `${new Date(date).toLocaleDateString("fr-FR", { weekday:"long", day:"2-digit", month:"long" })} à ${heure}`;
                    })()}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:14, color:"#111827", display:"block", marginBottom:6 }}>
                  Motif de consultation (facultatif)
                </label>
                <input
                  value={motif}
                  onChange={e => setMotif(e.target.value)}
                  placeholder="Décrivez votre motif..."
                  style={{ width:"100%", padding:"9px 10px", border:"1px solid #d1d5db", borderRadius:7, fontSize:14, outline:"none", color:"#111827" }}
                />
              </div>

              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => setStep(2)} style={btnOutline}>← Retour</button>
                <button
                  onClick={handleSubmit}
                  disabled={creating}
                  style={{ ...btnBlue, flex:1, padding:"11px", fontSize:15, opacity: creating ? 0.7 : 1 }}
                >
                  {creating ? "Création en cours..." : "✅ Confirmer le rendez-vous"}
                </button>
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

const btnBlue    = { padding:"8px 18px", background:"linear-gradient(90deg,#1565c0,#1e88e5)", color:"#fff", border:"none", borderRadius:7, fontSize:14, cursor:"pointer", fontWeight:500 };
const btnOutline = { padding:"8px 18px", background:"transparent", color:"#1565c0", border:"1.5px solid #1565c0", borderRadius:7, fontSize:14, cursor:"pointer", fontWeight:500 };