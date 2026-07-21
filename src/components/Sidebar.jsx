import { useState, useEffect } from "react";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import { WHITE, BORDER, PRIMARY, TEXT } from "../styles/tokens";

const PATIENT_LINKS = [
  { key: "dashboard-patient",  label: "Tableau de bord",       icon: "⊞" },
  { key: "appointments",       label: "Mes Rendez-vous",        icon: "📅" },
  { key: "book-appointment",   label: "Prendre un RDV",         icon: "➕" },
  { key: "medical-record",     label: "Dossier médical",        icon: "📁" },
  { key: "bluetooth-connect",  label: "Ma montre",          icon: "⌚" },
  { key: "messaging",          label: "Messagerie",             icon: "✉" },



  
  { key: "home",               label: "Déconnexion",            icon: "→" },
];

const DOCTOR_LINKS = [
  { key: "dashboard-doctor",    label: "Tableau de bord",   icon: "⊞" },
  { key: "doctor-appointments", label: "Mes Rendez-vous",   icon: "📅" },
  { key: "manage-slots",        label: "Mes créneaux",      icon: "🗓" },
  { key: "messaging",           label: "Messagerie",        icon: "✉" },
  { key: "home",                label: "Déconnexion",       icon: "→" },
];

const ADMIN_LINKS = [
  { key: "admin-dashboard",   label: "Dashboard",           icon: "⊞"  },
  { key: "admin-doctors",     label: "Médecins",            icon: "👨‍⚕️" },
  { key: "admin-patients",    label: "Patients",            icon: "👥"  },
  { key: "admin-chronic",     label: "Maladies",            icon: "❤"  },
  { key: "admin-specialties", label: "Spécialités",         icon: "⭐"  },
  { key: "admin-regions",     label: "Régions",             icon: "🏠"  },
  { key: "home",              label: "Accueil",             icon: "↩"  },
];

// ── Hook pour détecter la taille d'écran ──
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export default function Sidebar({ role, page, onNavigate }) {
  const { logout }  = useAuth();
  const isMobile    = useIsMobile();
  const [open, setOpen] = useState(false);

  const links =
    role === "doctor" ? DOCTOR_LINKS :
    role === "admin"  ? ADMIN_LINKS  :
    PATIENT_LINKS;

  function handleNav(key) {
    setOpen(false);
    if (key === "home") logout();
    else onNavigate(key);
  }

  // ── Navigation mobile en bas ──
  if (isMobile) {
    // Liens principaux (max 4 pour la barre du bas)
    const mainLinks = links.slice(0, 4);
    // Liens supplémentaires dans le menu hamburger
    const extraLinks = links.slice(4);

    return (
      <>
        {/* Menu hamburger overlay */}
        {open && (
          <div
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:200 }}
            onClick={() => setOpen(false)}
          >
            <div
              style={{ position:"absolute", bottom:60, left:0, right:0, background:"#fff", borderRadius:"20px 20px 0 0", padding:"16px 0 8px", boxShadow:"0 -4px 20px rgba(0,0,0,0.15)" }}
              onClick={e => e.stopPropagation()}
            >
              {/* Poignée */}
              <div style={{ width:40, height:4, background:"#d1d5db", borderRadius:2, margin:"0 auto 16px" }} />

              {/* Tous les liens */}
              {links.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => handleNav(key)}
                  style={{
                    display:"flex", alignItems:"center", gap:14,
                    padding:"14px 24px", width:"100%",
                    background: page === key ? PRIMARY + "12" : "none",
                    border:"none",
                    borderLeft: page === key ? `3px solid ${PRIMARY}` : "3px solid transparent",
                    cursor:"pointer", fontSize:15,
                    fontWeight: page === key ? 600 : 400,
                    color: page === key ? PRIMARY : "#111827",
                    textAlign:"left",
                  }}
                >
                  <span style={{ fontSize:20 }}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Barre navigation bas */}
        <nav style={{
          position:"fixed", bottom:0, left:0, right:0,
          height:60, background:"#fff",
          borderTop:"1px solid #e5e7eb",
          display:"flex", alignItems:"center",
          zIndex:100, boxShadow:"0 -2px 10px rgba(0,0,0,0.08)",
        }}>
          {mainLinks.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => handleNav(key)}
              style={{
                flex:1, display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center",
                gap:3, padding:"6px 0",
                background:"none", border:"none", cursor:"pointer",
                color: page === key ? PRIMARY : "#6B7280",
                fontSize:10, fontWeight: page === key ? 600 : 400,
              }}
            >
              <span style={{ fontSize:22 }}>{icon}</span>
              <span style={{ fontSize:10, lineHeight:1 }}>{label.length > 10 ? label.substring(0,10)+"…" : label}</span>
            </button>
          ))}

          {/* Bouton "Plus" pour les autres liens */}
          <button
            onClick={() => setOpen(o => !o)}
            style={{
              flex:1, display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center",
              gap:3, padding:"6px 0",
              background:"none", border:"none", cursor:"pointer",
              color: open ? PRIMARY : "#6B7280",
              fontSize:10,
            }}
          >
            <span style={{ fontSize:22 }}>☰</span>
            <span style={{ fontSize:10, lineHeight:1 }}>Plus</span>
          </button>
        </nav>

        {/* Espace en bas pour éviter que le contenu soit caché */}
        <div style={{ height:60, flexShrink:0 }} />
      </>
    );
  }

  // ── Sidebar desktop ──
  return (
    <aside style={{
      width:220, minHeight:"100vh",
      background:WHITE, borderRight:`1px solid ${BORDER}`,
      padding:"1.5rem 0", display:"flex",
      flexDirection:"column", gap:4, flexShrink:0,
    }}>
      <div style={{ padding:"0 1rem 1.25rem", borderBottom:`1px solid ${BORDER}`, marginBottom:8 }}>
        <Logo />
      </div>

      {links.map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => handleNav(key)}
          style={{
            display:"flex", alignItems:"center", gap:10,
            padding:"0.6rem 1.25rem",
            background: page === key ? PRIMARY + "12" : "none",
            border:"none",
            borderLeft: page === key ? `3px solid ${PRIMARY}` : "3px solid transparent",
            cursor:"pointer", fontSize:14,
            fontWeight: page === key ? 600 : 400,
            color: page === key ? PRIMARY : TEXT,
            textAlign:"left", width:"100%",
          }}
        >
          <span style={{ fontSize:16 }}>{icon}</span>
          {label}
        </button>
      ))}
    </aside>
  );
}