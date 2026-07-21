import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "../../components";
import { useApi, useAction } from "../../hooks/useApi";
import { FactureService } from "../../services";
import { BG } from "../../styles/tokens";

const G = "linear-gradient(90deg,#1565c0,#1e88e5)";

const PROVIDERS = [
  { name:"orange", label:"Orange", color:"#FF6600", bg:"#FFF3E0" },
  { name:"moov",   label:"Moov",   color:"#00A651", bg:"#E8F5E9" },
  { name:"coris",  label:"Coris",  color:"#003087", bg:"#E3F2FD" },
  { name:"sank",   label:"Sank",   color:"#e11d48", bg:"#FFF1F2" },
];

export default function Payment({ onNavigate }) {
  const { user } = useAuth();
  const { data, loading } = useApi(() => FactureService.liste());
  const { execute: payer, loading: paying } = useAction(FactureService.payer);

  const [provider,  setProvider]  = useState(null);
  const [telephone, setTelephone] = useState("");
  const [formError, setFormError] = useState(null);
  const [success,   setSuccess]   = useState(null);

  const factures = (data ?? []).filter(f => f.statut_paiement !== "paye");
  const facture  = factures[0];

  async function handlePayer() {
    if (!telephone) { setFormError("Entrez votre numéro de téléphone."); return; }
    if (!provider)  { setFormError("Choisissez un fournisseur.");        return; }
    if (!facture)   { setFormError("Aucune facture en attente.");         return; }
    setFormError(null);
    try {
      const res = await payer(facture.id, { telephone, mode_paiement: provider });
      setSuccess(`Paiement confirmé ! Référence : ${res.reference ?? res.id}`);
    } catch (e) { setFormError(e.message); }
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", background:BG }}>

      {/* Topbar */}
      <div style={{ background:G, height:46, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:26, height:26, borderRadius:6, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>💙</div>
          <span style={{ fontSize:13, fontWeight:500, color:"#fff" }}>Kibara-<span style={{ color:"#f4a61d" }}>Santé</span></span>
          <span style={{ color:"rgba(255,255,255,0.5)", margin:"0 4px", fontSize:12 }}>›</span>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.8)" }}>Accueil</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color:"#fff", fontSize:18 }}>🔔</span>
          <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(255,255,255,0.25)", border:"1.5px solid rgba(255,255,255,0.5)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:10 }}>
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <Sidebar role="patient" page="payment" onNavigate={onNavigate} />

        <main style={{ flex:1, overflowY:"auto", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>

          {loading ? (
            <p style={{ color:"#6B7280" }}>Chargement...</p>

          ) : success ? (
            /* ── Succès ── */
            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e5e7eb", padding:"2.5rem", textAlign:"center", width:"100%", maxWidth:420 }}>
              <div style={{ fontSize:52, marginBottom:12 }}>🎉</div>
              <p style={{ fontSize:16, fontWeight:600, color:"#166534", marginBottom:6 }}>Paiement effectué !</p>
              <p style={{ fontSize:13, color:"#6B7280", marginBottom:20 }}>{success}</p>
              <button onClick={() => onNavigate("dashboard-patient")} style={{ ...btnBlue, width:"100%" }}>
                Retour au tableau de bord
              </button>
            </div>

          ) : factures.length === 0 ? (
            /* ── Aucune facture ── */
            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e5e7eb", padding:"2.5rem", textAlign:"center", width:"100%", maxWidth:420 }}>
              <div style={{ fontSize:52, marginBottom:12 }}>✅</div>
              <p style={{ fontSize:16, fontWeight:600, color:"#166534", marginBottom:6 }}>Aucune facture en attente</p>
              <p style={{ fontSize:13, color:"#6B7280", marginBottom:20 }}>Toutes vos consultations sont réglées.</p>
              <button onClick={() => onNavigate("dashboard-patient")} style={{ ...btnBlue, width:"100%" }}>
                Retour au tableau de bord
              </button>
            </div>

          ) : (
            /* ── Formulaire paiement ── */
            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e5e7eb", width:"100%", maxWidth:420, overflow:"hidden" }}>

              {/* En-tête carte */}
              <div style={{ background:G, padding:"18px 20px", textAlign:"center" }}>
                <span style={{ fontSize:16, fontWeight:600, color:"#fff" }}>💳 Paiement</span>
                {facture && (
                  <p style={{ margin:"6px 0 0", fontSize:13, color:"rgba(255,255,255,0.85)" }}>
                    Facture #{facture.id} — <strong>{facture.montant} FCFA</strong>
                  </p>
                )}
              </div>

              <div style={{ padding:"20px 20px" }}>

                <p style={{ fontSize:13, color:"#374151", textAlign:"center", marginBottom:16, lineHeight:1.5 }}>
                  Entrez votre numéro de téléphone <strong>sans l'indicatif +226</strong> pour payer la consultation (ex. 76123456).
                </p>

                {formError && (
                  <div style={{ background:"#fee2e2", color:"#991b1b", borderRadius:8, padding:"8px 12px", marginBottom:12, fontSize:13 }}>
                    ⚠️ {formError}
                  </div>
                )}

                {/* Téléphone */}
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:13, color:"#374151", display:"flex", alignItems:"center", gap:6, marginBottom:6, fontWeight:500 }}>
                    📞 Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    placeholder="76123456"
                    value={telephone}
                    onChange={e => setTelephone(e.target.value)}
                    style={{ width:"100%", padding:"10px 12px", border:"1px solid #d1d5db", borderRadius:8, fontSize:13, outline:"none" }}
                  />
                </div>

                {/* Fournisseur */}
                <div style={{ marginBottom:20 }}>
                  <label style={{ fontSize:13, color:"#374151", display:"flex", alignItems:"center", gap:6, marginBottom:10, fontWeight:500 }}>
                    🏦 Fournisseur
                  </label>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
                    {PROVIDERS.map(({ name, label, color, bg }) => (
                      <button
                        key={name}
                        onClick={() => setProvider(name)}
                        style={{
                          padding:"8px 16px", borderRadius:8, cursor:"pointer",
                          border: provider === name ? `2px solid ${color}` : "1.5px solid #e5e7eb",
                          background: provider === name ? bg : "#fff",
                          color, fontWeight:600, fontSize:13,
                          display:"flex", alignItems:"center", gap:6,
                          minWidth:80, justifyContent:"center",
                        }}
                      >
                        {provider === name && <span>✓</span>}
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bouton */}
                <button
                  onClick={handlePayer}
                  disabled={paying}
                  style={{ ...btnBlue, width:"100%", padding:"12px", fontSize:14, opacity: paying ? 0.7 : 1 }}
                >
                  {paying ? "Paiement en cours..." : "Continuer"}
                </button>

                <p style={{ fontSize:11, color:"#9CA3AF", textAlign:"center", marginTop:10 }}>
                  🔒 Paiement sécurisé via Mobile Money
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <div style={{ background:G, padding:10, textAlign:"center", fontSize:11, color:"rgba(255,255,255,0.85)" }}>
        © 2026 <span style={{ color:"#f4a61d" }}>Kibara-Santé</span>. Tous droits réservés.
      </div>
    </div>
  );
}

const btnBlue = { padding:"9px 20px", background:"linear-gradient(90deg,#1565c0,#1e88e5)", color:"#fff", border:"none", borderRadius:8, fontSize:13, cursor:"pointer", fontWeight:500 };