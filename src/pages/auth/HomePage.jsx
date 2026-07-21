import { useState, useEffect } from "react";
import { TopBar } from "../../components";
import s from "../../styles/styles";
import { PRIMARY, PRIMARY_LIGHT, PRIMARY_DARK, ACCENT, BG, WHITE, TEXT_MUTED } from "../../styles/tokens";
import api from "../../services/api";

export default function HomePage({ onNavigate }) {
  const [specialites, setSpecialites] = useState([]);
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    api.get("/specialites").then(setSpecialites).catch(() => {});
    api.get("/regions").then(setRegions).catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      <TopBar onNavigate={onNavigate} page="home" />

      {/* HERO - Matching the screenshot */}
      <section
        style={{
          background: `linear-gradient(135deg, ${PRIMARY_DARK} 0%, ${PRIMARY_LIGHT} 60%, ${ACCENT} 100%)`,
          color: WHITE,
          padding: "4rem 1.5rem 3rem",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Search Bar */}
          <div style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "2.5rem",
            background: "rgba(255,255,255,0.15)",
            padding: "12px 20px",
            borderRadius: "50px",
            backdropFilter: "blur(10px)"
          }}>
            <select style={{ ...s.input, width: 160, background: WHITE, color: "#333" }}>
              <option value="">Spécialité</option>
              {specialites.map((sp) => (
                <option key={sp.id} value={sp.id}>{sp.nom}</option>
              ))}
            </select>

            <select style={{ ...s.input, width: 140, background: WHITE, color: "#333" }}>
              <option value="">Région</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.nom}</option>
              ))}
            </select>

            <input
              style={{ ...s.input, width: 220, background: WHITE, color: "#333" }}
              placeholder="Nom du docteur"
            />
            <button style={{ ...s.btn, background: ACCENT, padding: "12px 24px" }}>🔍</button>
          </div>

          <h1 style={{ fontSize: "2.6rem", fontWeight: 800, margin: "0 0 1rem", lineHeight: 1.1 }}>
            Kibara-<span style={{ color: "#f4a61d" }}>Santé</span> : Votre santé, notre priorité
          </h1>
          <p style={{ fontSize: 17, opacity: 0.9, maxWidth: 700, margin: "0 auto 2rem" }}>
            Gérez vos maladies chroniques avec des téléconsultations et un suivi connecté.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ ...s.btnOutline, color: WHITE, borderColor: WHITE }} onClick={() => onNavigate("login")}>
              Se connecter
            </button>
            <button style={{ ...s.btn, background: WHITE, color: PRIMARY }} onClick={() => onNavigate("register-patient")}>
              S’inscrire comme Patient
            </button>
            <button
              style={{ ...s.btn, background: "rgba(255,255,255,0.2)", border: `1px solid ${WHITE}` }}
              onClick={() => onNavigate("register-doctor")}
            >
              S’inscrire comme Médecin
            </button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "4rem 1.5rem" }}>
        <h2 style={{ ...s.sectionTitle, textAlign: "center", marginBottom: "2.5rem" }}>Nos services pour votre santé</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          {[
            { icon: "📋", title: "Consultations faciles", desc: "Planifiez des téléconsultations pour gérer diabète, hypertension, et plus.", cta: "Prendre un rendez-vous", nav: "book-appointment" },
            { icon: "📁", title: "Dossier médical", desc: "Accédez à vos données médicales en toute sécurité.", cta: "Se connecter", nav: "login" },
            { icon: "⌚", title: "Suivi Fitbit", desc: "Connectez votre Fitbit pour un suivi en temps réel.", cta: "Connecter", nav: "dashboard-patient" },
          ].map(({ icon, title, desc, cta, nav }) => (
            <div key={title} style={s.card}>
              <div style={{ fontSize: 42, marginBottom: 16 }}>{icon}</div>
              <h3 style={{ color: PRIMARY, fontWeight: 700, margin: "0 0 10px", fontSize: 18 }}>{title}</h3>
              <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.5 }}>{desc}</p>
              <button style={s.btn} onClick={() => onNavigate(nav)}>{cta}</button>
            </div>
          ))}
        </div>
      </section>

      {/* Chronic Diseases Specialties */}
      <section style={{ background: WHITE, padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ ...s.sectionTitle, textAlign: "center" }}>Spécialisés dans les maladies chroniques</h2>
          <p style={{ textAlign: "center", color: TEXT_MUTED, marginBottom: "2.5rem", maxWidth: 700, marginLeft: "auto", marginRight: "auto" }}>
            Kibara-Santé vous aide à gérer vos maladies chroniques grâce à des téléconsultations personnalisées et un suivi connecté.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              { icon: "❤️", title: "Cardiologie", desc: "Suivi de l’hypertension et maladies cardiaques avec des spécialistes." },
              { icon: "💉", title: "Diabétologie", desc: "Gestion du diabète avec plans personnalisés et suivi Fitbit." },
              { icon: "🫁", title: "Pneumologie", desc: "Prise en charge de l’asthme et maladies respiratoires." },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ ...s.card, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
                <h3 style={{ color: PRIMARY, fontWeight: 700, margin: "0 0 12px" }}>{title}</h3>
                <p style={{ fontSize: 14, color: TEXT_MUTED }}>{desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <p style={{ fontWeight: 700, fontSize: 19, marginBottom: 8 }}>+80% des patients améliorent leur gestion des maladies chroniques</p>
            <button style={{ ...s.btn, background: PRIMARY, color: WHITE, padding: "14px 32px" }} onClick={() => onNavigate("register-patient")}>
              Commencer maintenant
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "4rem 1.5rem" }}>
        <h2 style={{ ...s.sectionTitle, textAlign: "center" }}>Pourquoi choisir Kibara-Santé ?</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginTop: "2.5rem" }}>
          {[
            { icon: "🔒", title: "Sécurité des données", desc: "Vos informations médicales sont protégées avec un chiffrement de pointe." },
            { icon: "🕐", title: "Accès 24/7", desc: "Consultez vos données et prenez rendez-vous à tout moment." },
            { icon: "📊", title: "Suivi connecté", desc: "Intégrez vos données Fitbit pour un suivi précis de vos maladies chroniques." },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <span style={{ fontSize: 32, flexShrink: 0 }}>{icon}</span>
              <div>
                <h4 style={{ margin: "0 0 6px", fontWeight: 700 }}>{title}</h4>
                <p style={{ color: TEXT_MUTED, fontSize: 14, lineHeight: 1.5 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ background: PRIMARY, color: WHITE, textAlign: "center", padding: "1.5rem", fontSize: 14 }}>
        © 2026 <span style={{ color: "#f4a61d" }}>Kibara-Santé</span>. Tous droits réservés.
      </footer>
    </div>
  );
}