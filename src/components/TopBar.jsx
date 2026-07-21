import Logo from "./Logo";
import s from "../styles/styles";
import { WHITE, BORDER, PRIMARY, TEXT_MUTED } from "../styles/tokens";

export default function TopBar({ onNavigate, page }) {
  return (
    <header
      style={{
        background: WHITE,
        borderBottom: `1px solid ${BORDER}`,
        padding: "0 1.5rem",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <button onClick={() => onNavigate("home")} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <Logo />
        </button>
        <nav style={{ display: "flex", gap: 24 }}>
          <button
            onClick={() => onNavigate("home")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: page === "home" ? 700 : 500,
              color: page === "home" ? PRIMARY : TEXT_MUTED,
              paddingBottom: 2,
              borderBottom: page === "home" ? `2px solid ${PRIMARY}` : "2px solid transparent",
            }}
          >
            Accueil
          </button>
        </nav>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button style={s.btnOutline} onClick={() => onNavigate("login")}>Connexion</button>
        <button style={s.btn} onClick={() => onNavigate("register-patient")}>S'inscrire</button>
      </div>
    </header>
  );
}
