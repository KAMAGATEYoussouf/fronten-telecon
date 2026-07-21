import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "../../components";
import { useApi, useAction } from "../../hooks/useApi";
import { DossierMedicalService } from "../../services";
import { BG } from "../../styles/tokens";

const G       = "linear-gradient(90deg,#1565c0,#1e88e5)";
const GROUPES = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

const VITALS = [
  { icon:"❤️",  label:"Heartrate",         value:"75 bpm"     },
  { icon:"🚶",  label:"Steps",             value:"10 000 pas"  },
  { icon:"🌙",  label:"Sleep",             value:"7h00"        },
  { icon:"💨",  label:"Oxygen saturation", value:"98 %"        },
  { icon:"🌬️", label:"Respiratory rate",  value:"16 /min"     },
  { icon:"🌡️", label:"Temperature",       value:"36.6 °C"     },
];

// ── Calcul âge depuis date_naissance ──
function calculerAge(dateNaissance) {
  if (!dateNaissance) return "—";
  const today = new Date();
  const birth = new Date(dateNaissance);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return `${age} ans`;
}

// ── Formater civilité ──
function formatCivilite(civilite) {
  if (!civilite) return "—";
  const map = { homme:"Homme", femme:"Femme", autre:"Autre", m:"Homme", f:"Femme", Mr:"Homme", Mme:"Femme" };
  return map[civilite] ?? civilite;
}

export default function MedicalRecord({ onNavigate }) {
  const { user } = useAuth();
  const { data, loading, refetch } = useApi(() => DossierMedicalService.monDossier());
  const { execute: mettreAJour, loading: saving } = useAction(DossierMedicalService.mettreAJour);

  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({});
  const [saveOk,  setSaveOk]  = useState(false);

  const dossier = data;
  const patient = data?.patient?.utilisateur;

  // ── Récupérer dernière téléconsultation ──
  const teleconsultations = dossier?.teleconsultations ?? [];
  const derniereTeleconsult = teleconsultations[teleconsultations.length - 1];

  function startEdit() {
    setForm({
      antecedents:           dossier?.antecedents           ?? "",
      allergies:             dossier?.allergies             ?? "",
      taille:                dossier?.taille                ?? "",
      poids:                 dossier?.poids                 ?? "",
      groupe_sanguin:        dossier?.groupe_sanguin        ?? "",
      maladies_chroniques:   dossier?.maladies_chroniques   ?? "",
      traitements_en_cours:  dossier?.traitements_en_cours  ?? "",
    });
    setEditing(true);
  }

  async function handleSave() {
    try {
      const payload = {
        taille:                form.taille !== ""              ? Number(form.taille) : null,
        poids:                 form.poids  !== ""              ? Number(form.poids)  : null,
        groupe_sanguin:        form.groupe_sanguin        || null,
        antecedents:           form.antecedents           || null,
        allergies:             form.allergies             || null,
        maladies_chroniques:   form.maladies_chroniques   || null,
        traitements_en_cours:  form.traitements_en_cours  || null,
      };
      await mettreAJour(payload);
      setSaveOk(true);
      setEditing(false);
      refetch();
      setTimeout(() => setSaveOk(false), 3000);
    } catch (e) { alert(e.message); }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

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
        <Sidebar role="patient" page="medical-record" onNavigate={onNavigate} />

        <main style={{ flex:1, overflowY:"auto", padding:16 }}>

          {/* Titre */}
          <div style={{ textAlign:"center", marginBottom:16 }}>
            <h1 style={{ fontSize:24, fontWeight:600, color:"#1a3a5c" }}>📁 Dossier médical</h1>
          </div>

          {saveOk && (
            <div style={{ background:"#dcfce7", color:"#166534", borderRadius:8, padding:"10px 14px", marginBottom:12, fontSize:15 }}>
              ✅ Dossier mis à jour avec succès.
            </div>
          )}

          {loading ? (
            <p style={{ color:"#111827", textAlign:"center", fontSize:15 }}>Chargement...</p>
          ) : (
            <>
              {/* ── Détails du dossier ── */}
              <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", overflow:"hidden", marginBottom:14 }}>
                <div style={{ background:G, padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ color:"#fff", fontSize:15, fontWeight:500 }}>📋 Détails du dossier médical</span>
                  {derniereTeleconsult?.medecin?.utilisateur && (
                    <span style={{ color:"#fff", fontSize:13 }}>
                      👨‍⚕️ Dr. {derniereTeleconsult.medecin.utilisateur.prenom} {derniereTeleconsult.medecin.utilisateur.nom}
                    </span>
                  )}
                </div>
                <div style={{ padding:16 }}>
                  {!editing ? (
                    <>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                        {[
                          { icon:"👤", label:"Patient",              value:`${patient?.prenom ?? ""} ${patient?.nom ?? ""}` },
                          { icon:"📝", label:"Antécédents",          value:dossier?.antecedents },
                          { icon:"🎂", label:"Âge",                  value:calculerAge(patient?.date_naissance) },
                          { icon:"💊", label:"Allergies",            value:dossier?.allergies },
                          { icon:"⚧",  label:"Sexe",                 value:formatCivilite(patient?.civilite) },
                          { icon:"💡", label:"Conseils",             value:derniereTeleconsult?.conseils },
                          { icon:"🏥", label:"Maladies chroniques",  value:dossier?.maladies_chroniques },
                          { icon:"📅", label:"Date de création",     value:dossier?.date_creation ? new Date(dossier.date_creation).toLocaleString("fr-FR") : "—" },
                          { icon:"🩺", label:"Diagnostic",           value:derniereTeleconsult?.diagnostic },
                          { icon:"🔄", label:"Dernière mise à jour", value:dossier?.derniere_mise_a_jour ? new Date(dossier.derniere_mise_a_jour).toLocaleString("fr-FR") : "Non mis à jour" },
                        ].map(({ icon, label, value }) => (
                          <div key={label} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:15 }}>
                            <span style={{ color:"#1565c0", flexShrink:0, fontSize:16 }}>{icon}</span>
                            <span>
                              <strong style={{ color:"#111827" }}>{label} :</strong>{" "}
                              <span style={{ color:"#111827" }}>{value || "Non renseigné"}</span>
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Taille / Poids / Groupe / Traitements */}
                      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:16 }}>
                        {[
                          { label:"Taille",         value: dossier?.taille         ? `${dossier.taille} cm` : "—" },
                          { label:"Poids",          value: dossier?.poids          ? `${dossier.poids} kg`  : "—" },
                          { label:"Groupe sanguin", value: dossier?.groupe_sanguin ?? "—" },
                          { label:"Traitements",    value: dossier?.traitements_en_cours ?? "—" },
                        ].map(({ label, value }) => (
                          <div key={label} style={{ background:"#EFF6FF", borderRadius:8, padding:"8px 14px", fontSize:14, border:"1px solid #bfdbfe" }}>
                            <span style={{ color:"#111827" }}>{label} : </span>
                            <span style={{ fontWeight:600, color:"#1a3a5c" }}>{value}</span>
                          </div>
                        ))}
                      </div>

                      <button onClick={startEdit} style={{ ...btnBlue, fontSize:14, padding:"8px 18px" }}>
                        ✏️ Modifier le dossier
                      </button>
                    </>
                  ) : (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                      {[
                        ["taille",               "Taille (cm)",          "number"],
                        ["poids",                "Poids (kg)",           "number"],
                        ["antecedents",          "Antécédents",          "text"  ],
                        ["allergies",            "Allergies",            "text"  ],
                        ["maladies_chroniques",  "Maladies chroniques",  "text"  ],
                        ["traitements_en_cours", "Traitements en cours", "text"  ],
                      ].map(([k, label, type]) => (
                        <div key={k} style={["antecedents","allergies","maladies_chroniques","traitements_en_cours"].includes(k) ? { gridColumn:"span 2" } : {}}>
                          <label style={{ fontSize:14, color:"#111827", display:"block", marginBottom:5 }}>{label}</label>
                          <input
                            type={type}
                            value={form[k] ?? ""}
                            onChange={set(k)}
                            style={{ width:"100%", padding:"8px 10px", border:"1px solid #d1d5db", borderRadius:7, fontSize:14, outline:"none", color:"#111827" }}
                          />
                        </div>
                      ))}
                      <div>
                        <label style={{ fontSize:14, color:"#111827", display:"block", marginBottom:5 }}>Groupe sanguin</label>
                        <select value={form.groupe_sanguin} onChange={set("groupe_sanguin")} style={{ width:"100%", padding:"8px 10px", border:"1px solid #d1d5db", borderRadius:7, fontSize:14, outline:"none", color:"#111827" }}>
                          <option value="">—</option>
                          {GROUPES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div style={{ gridColumn:"span 2", display:"flex", gap:8, marginTop:8 }}>
                        <button onClick={() => setEditing(false)} style={btnOutline}>Annuler</button>
                        <button onClick={handleSave} disabled={saving} style={{ ...btnBlue, opacity: saving ? 0.7 : 1 }}>
                          {saving ? "Enregistrement..." : "💾 Enregistrer"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Données de santé ── */}
              <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", overflow:"hidden", marginBottom:14 }}>
                <div style={{ background:G, padding:"10px 16px" }}>
                  <span style={{ color:"#fff", fontSize:15, fontWeight:500 }}>📊 Données de santé</span>
                </div>
                <div style={{ padding:16 }}>
                  <p style={{ fontSize:14, color:"#111827", textAlign:"center", marginBottom:12 }}>⌚ Mes données</p>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:10 }}>
                    {VITALS.map(({ icon, label, value }) => (
                      <div key={label} style={{ background:"#f8fafd", borderRadius:8, padding:"12px", border:"1px solid #e0e7ef", textAlign:"center" }}>
                        <div style={{ fontSize:24, marginBottom:6 }}>{icon}</div>
                        <div style={{ fontSize:13, color:"#111827", marginBottom:3 }}>{label}</div>
                        <div style={{ fontSize:15, fontWeight:600, color:"#1565c0" }}>{value}</div>
                        <div style={{ fontSize:12, color:"#374151", marginTop:3 }}>
                          {new Date().toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button style={{ ...btnOutline, width:"100%", marginTop:14, fontSize:14 }}>🔄 Rafraîchir</button>
                </div>
              </div>

              {/* ── Historique des consultations ── */}
              <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", overflow:"hidden", marginBottom:14 }}>
                <div style={{ background:G, padding:"10px 16px" }}>
                  <span style={{ color:"#fff", fontSize:15, fontWeight:500 }}>🕐 Historique des consultations</span>
                </div>
                <div style={{ padding:16 }}>
                  {teleconsultations.length === 0 ? (
                    <p style={{ color:"#111827", fontSize:15 }}>ℹ Aucune consultation disponible.</p>
                  ) : teleconsultations.map((c, i) => (
                    <div key={i} style={{ background:"#f8fafd", borderRadius:8, padding:"14px", marginBottom:10, border:"1px solid #e0e7ef" }}>
                      <p style={{ margin:0, fontWeight:600, fontSize:15, color:"#1a3a5c", marginBottom:8 }}>
                        Consultation du {new Date(c.created_at).toLocaleDateString("fr-FR")}
                      </p>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                        {c.diagnostic && (
                          <div style={{ fontSize:14, color:"#111827" }}>
                            <strong>🩺 Diagnostic :</strong> {c.diagnostic}
                          </div>
                        )}
                        {c.conseils && (
                          <div style={{ fontSize:14, color:"#111827" }}>
                            <strong>💡 Conseils :</strong> {c.conseils}
                          </div>
                        )}
                        {c.notes && (
                          <div style={{ fontSize:14, color:"#111827", gridColumn:"span 2" }}>
                            <strong>📝 Notes :</strong> {c.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Ordonnances ── */}
              <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", overflow:"hidden", marginBottom:14 }}>
                <div style={{ background:G, padding:"10px 16px" }}>
                  <span style={{ color:"#fff", fontSize:15, fontWeight:500 }}>💊 Ordonnances</span>
                </div>
                <div style={{ padding:16 }}>
                  {teleconsultations.filter(c => c.ordonnances?.length > 0).length === 0 ? (
                    <p style={{ color:"#111827", fontSize:15 }}>ℹ Aucune ordonnance disponible.</p>
                  ) : teleconsultations
                      .filter(c => c.ordonnances?.length > 0)
                      .map((c, i) => (
                        <div key={i} style={{ background:"#f8fafd", borderRadius:8, padding:"14px", marginBottom:10, border:"1px solid #e0e7ef" }}>
                          <p style={{ margin:0, fontWeight:600, fontSize:15, color:"#1a3a5c", marginBottom:10 }}>
                            Ordonnance du {new Date(c.created_at).toLocaleDateString("fr-FR")}
                          </p>
                          {c.ordonnances.map((ord, j) => (
                            <div key={j} style={{ marginBottom:8 }}>
                              {(ord.liste_medicaments ?? []).map((med, k) => (
                                <div key={k} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px", background:"#fff", borderRadius:6, border:"1px solid #e5e7eb", marginBottom:4, fontSize:14, color:"#111827" }}>
                                  <span style={{ color:"#1565c0" }}>💊</span>
                                  <span><strong>{med.nom}</strong>
                                    {med.dosage       && ` — ${med.dosage}`}
                                    {med.duree        && ` — ${med.duree}`}
                                    {med.instructions && ` (${med.instructions})`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ))
                  }
                </div>
              </div>

              {/* Fichiers médicaux */}
              <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", overflow:"hidden", marginBottom:14 }}>
                <div style={{ background:G, padding:"10px 16px" }}>
                  <span style={{ color:"#fff", fontSize:15, fontWeight:500 }}>📎 Fichiers médicaux</span>
                </div>
                <div style={{ padding:16 }}>
                  <p style={{ color:"#111827", fontSize:15, marginBottom:10 }}>ℹ Aucun fichier médical disponible.</p>
                  <button style={{ ...btnBlue, fontSize:14 }}>➕ Ajouter un fichier</button>
                </div>
              </div>

              <button onClick={() => onNavigate("dashboard-patient")} style={{ ...btnOutline, fontSize:14 }}>
                ← Retour
              </button>
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

const btnBlue    = { padding:"8px 18px", background:"linear-gradient(90deg,#1565c0,#1e88e5)", color:"#fff", border:"none", borderRadius:7, fontSize:13, cursor:"pointer", fontWeight:500 };
const btnOutline = { padding:"8px 18px", background:"transparent", color:"#1565c0", border:"1.5px solid #1565c0", borderRadius:7, fontSize:13, cursor:"pointer", fontWeight:500 };