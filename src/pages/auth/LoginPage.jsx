import { useState } from "react";
import { TopBar, Logo } from "../../components";
import { useAuth } from "../../context/AuthContext";
import s from "../../styles/styles";
import { BG, TEXT, SUCCESS, WARNING, DANGER } from "../../styles/tokens";

export default function LoginPage({ onNavigate }) {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try { await login(email, pass); }
    catch (_) {}
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column" }}>
      <TopBar onNavigate={onNavigate} page="login" />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ ...s.card, width: "100%", maxWidth: 400 }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <Logo size={30} />
            <h2 style={{ marginTop: 12, fontWeight: 800, color: TEXT }}>Connexion</h2>
          </div>

          {error && (
            <div style={{ background: DANGER + "18", color: DANGER, borderRadius: 8, padding: "0.6rem 1rem", marginBottom: 12, fontSize: 13 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label style={s.label}>Email</label>
              <input style={s.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" type="email" required />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={s.label}>Mot de passe</label>
              <input style={s.input} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" type="password" required />
            </div>
            <button style={{ ...s.btn, width: "100%", padding: "0.75rem", opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div style={{ marginTop: 12, borderTop: "1px solid #E2E8F0", paddingTop: 12 }}>
            <p style={{ fontSize: 12, color: "#6B7280", textAlign: "center", marginBottom: 8 }}>Comptes démo :</p>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
              <button style={{ ...s.btn, background: SUCCESS, fontSize: 11 }} onClick={() => { setEmail("dr.doe@medilink.bf"); setPass("password"); }}>Médecin</button>
              <button style={{ ...s.btn, background: WARNING, fontSize: 11 }} onClick={() => { setEmail("admin@medilink.bf"); setPass("password"); }}>Admin</button>
              <button style={{ ...s.btn, fontSize: 11 }} onClick={() => { setEmail("patient@medilink.bf"); setPass("password"); }}>Patient</button>
            </div>
          </div>

          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#6B7280" }}>
            Pas de compte ?{" "}
            <button style={{ background: "none", border: "none", color: "#1565C0", cursor: "pointer", fontWeight: 600 }} onClick={() => onNavigate("register-patient")}>S'inscrire</button>
          </p>
        </div>
      </div>
    </div>
  );
}
