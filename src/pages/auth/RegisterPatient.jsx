import { useState } from "react";
import { TopBar } from "../../components";
import { useAuth } from "../../context/AuthContext";
import s from "../../styles/styles";
import { BG, PRIMARY, TEXT_MUTED, DANGER } from "../../styles/tokens";

export default function RegisterPatient({ onNavigate }) {
  const { registerPatient, loading, error } = useAuth();
  const [form, setForm] = useState({ 
    nom:                       "", 
    prenom:                    "", 
    email:                     "", 
    mot_de_passe:              "", 
    mot_de_passe_confirmation: "", 
    telephone:                 "", 
    date_naissance:            "", 
    civilite:                  "M." 
  });

  // ✅ Fix stale closure
  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();

    // ✅ Vérification côté frontend
    if (form.mot_de_passe !== form.mot_de_passe_confirmation) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }

    try { await registerPatient(form); } catch (_) {}
  }

  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      <TopBar onNavigate={onNavigate} page="" />
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem 1rem" }}>
        <div style={{ ...s.card, width: "100%", maxWidth: 480 }}>

          <h2 style={{ textAlign: "center", fontWeight: 800, color: PRIMARY, marginBottom: 4 }}>
            Créer un Compte Patient
          </h2>
          <p style={{ textAlign: "center", color: TEXT_MUTED, fontSize: 13, marginBottom: "1.5rem" }}>
            Rejoignez Kibara-Santé pour gérer votre santé en ligne
          </p>

          {error && (
            <div style={{ background: DANGER+"18", color: DANGER, borderRadius: 8, padding: "0.6rem 1rem", marginBottom: 12, fontSize: 13, whiteSpace: "pre-line"  }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                ["nom",                      "Nom",                    "text"],
                ["prenom",                   "Prénom",                 "text"],
                ["email",                    "Email",                  "email"],
                ["telephone",               "Téléphone",              "tel"],
                ["date_naissance",           "Date de naissance",      "date"],
                ["mot_de_passe",             "Mot de passe",           "password"],
                ["mot_de_passe_confirmation","Confirmer mot de passe", "password"],
              ].map(([k, label, type]) => (
                <div 
                  key={k} 
                  style={
                    k === "email" || k === "mot_de_passe_confirmation" 
                      ? { gridColumn: "span 2" } 
                      : {}
                  }
                >
                  <label style={s.label}>{label}</label>
                  <input
                    style={s.input}
                    type={type}
                    value={form[k]}
                    onChange={set(k)}
                    required={["nom","prenom","email","mot_de_passe","mot_de_passe_confirmation"].includes(k)}
                  />
                </div>
              ))}
            </div>

            {/* Civilité */}
            <div style={{ marginTop: 12, marginBottom: 16 }}>
              <label style={s.label}>Civilité</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["M.", "Mme"].map((c) => (
                  <button
                    type="button"
                    key={c}
                    // ✅ Fix stale closure
                    onClick={() => setForm(prev => ({ ...prev, civilite: c }))}
                    style={{ 
                      ...form.civilite === c ? s.btn : s.btnOutline, 
                      padding: "0.4rem 1rem" 
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button 
              style={{ ...s.btn, width: "100%", padding: "0.75rem", opacity: loading ? 0.7 : 1 }} 
              disabled={loading}
            >
              {loading ? "Inscription..." : "S'inscrire"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: TEXT_MUTED }}>
            Déjà inscrit ?{" "}
            <button 
              style={{ background: "none", border: "none", color: PRIMARY, cursor: "pointer", fontWeight: 600 }} 
              onClick={() => onNavigate("login")}
            >
              Se connecter
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}