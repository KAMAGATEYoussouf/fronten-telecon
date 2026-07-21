import { Sidebar } from "../../components";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import { AdminService } from "../../services";
import { BG } from "../../styles/tokens";

const G = "linear-gradient(90deg,#1565c0,#1e88e5)";

export default function AdminDashboard({ onNavigate }) {
  const { user } = useAuth();
  const { data, loading } = useApi(() => AdminService.stats());

  const ITEMS = [
    {
      icon: "👨‍⚕️",
      title: "Médecins",
      desc: "Gérez les profils des médecins.",
      nav: "admin-doctors",
      stat: data?.total_medecins ?? "…",
      bg: "#EFF6FF",
      color: "#1565c0",
    },
    {
      icon: "👥",
      title: "Patients",
      desc: "Gérez les profils des patients.",
      nav: "admin-patients",
      stat: data?.total_patients ?? "…",
      bg: "#EFF6FF",
      color: "#1565c0",
    },
    {
      icon: "🩺",
      title: "Spécialités",
      desc: "Gérez les spécialités médicales.",
      nav: "admin-specialties",
      stat: data?.total_specialites ?? "…",
      bg: "#EFF6FF",
      color: "#1565c0",
    },
    {
      icon: "❤️",
      title: "Maladies Chroniques",
      desc: "Gérez les maladies prises en charge.",
      nav: "admin-chronic",
      stat: data?.total_maladies ?? "…",
      bg: "#EFF6FF",
      color: "#1565c0",
    },
    {
      icon: "🗺️",
      title: "Régions",
      desc: "Gérez les régions du Burkina Faso.",
      nav: "admin-regions",
      stat: data?.total_regions ?? "…",
      bg: "#EFF6FF",
      color: "#1565c0",
    },
  ];

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#f0f4f8" }}>

      {/* Sidebar */}
      <Sidebar role="admin" page="admin-dashboard" onNavigate={onNavigate} />

      <div style={{ flex:1, display:"flex", flexDirection:"column" }}>

        {/* Topbar */}
        <div style={{ background:"#fff", padding:"0 24px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #e5e7eb" }}>
          <span style={{ fontSize:15, fontWeight:600, color:"#1a3a5c" }}>Kibara-<span style={{ color:"#f4a61d" }}>Santé</span> — Administration</span>
          <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:14, color:"#374151" }}>
            <span>⚙️</span>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"#1565c0", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600 }}>
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </div>
            <span style={{ fontWeight:500 }}>{user?.prenom} {user?.nom}</span>
          </div>
        </div>

        <main style={{ flex:1, padding:"0 0 24px" }}>

          {/* Hero banner avec vague */}
          <div style={{ position:"relative", background:G, padding:"48px 40px 80px", marginBottom:40, overflow:"hidden" }}>
            {/* Cercles décoratifs */}
            <div style={{ position:"absolute", right:-40, top:-40, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
            <div style={{ position:"absolute", right:80, bottom:-60, width:150, height:150, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />

            <h1 style={{ fontSize:38, fontWeight:800, color:"#fff", margin:"0 0 12px", position:"relative", zIndex:1,textAlign: "center" }}>
              Tableau de bord Administrateur
            </h1>
            <p style={{ margin:0, color:"rgba(255,255,255,0.85)", fontSize:16, position:"relative", zIndex:1,textAlign: "center" }}>
              Gérez les médecins, patients, spécialités et maladies chroniques de Kibara-Santé.
            </p>

            {/* Vague en bas */}
            <div style={{ position:"absolute", bottom:-2, left:0, right:0, height:60, overflow:"hidden" }}>
              <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ width:"100%", height:"100%" }}>
                <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f0f4f8" />
              </svg>
            </div>
          </div>

          {/* Stats rapides */}
          {!loading && data && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, padding:"0 24px", marginBottom:28 }}>
              {[
                { label:"Médecins validés",   value: data.medecins_valides,       color:"#166534", bg:"#dcfce7" },
                { label:"En attente",          value: data.medecins_en_attente,    color:"#854d0e", bg:"#fef9c3" },
                { label:"Téléconsultations",   value: data.total_teleconsultations, color:"#1565c0", bg:"#EFF6FF" },
              ].map(({ label, value, color, bg }) => (
                <div key={label} style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", padding:"16px 18px", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
                  <p style={{ margin:0, fontSize:28, fontWeight:800, color }}>{value}</p>
                  <p style={{ margin:"4px 0 0", fontSize:13, color:"#6B7280" }}>{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Cartes principales */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:20, padding:"0 24px" }}>
            {ITEMS.map(({ icon, title, desc, nav, stat, bg, color }) => (
              <div key={title} style={{ background:"#fff", borderRadius:16, border:"1px solid #e5e7eb", padding:"28px 20px", textAlign:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", transition:"transform 0.15s", cursor:"pointer" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                {/* Icône */}
                <div style={{ width:60, height:60, borderRadius:"50%", background:bg, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:28, border:`2px solid ${color}22` }}>
                  {icon}
                </div>

                {/* Stat */}
                <p style={{ margin:"0 0 4px", fontSize:28, fontWeight:800, color }}>{stat}</p>

                {/* Titre */}
                <h3 style={{ color, fontWeight:700, margin:"0 0 8px", fontSize:17 }}>{title}</h3>

                {/* Description */}
                <p style={{ fontSize:13, color:"#6B7280", margin:"0 0 18px", lineHeight:1.5 }}>{desc}</p>

                {/* Bouton */}
                <button
                  onClick={() => onNavigate(nav)}
                  style={{
                    padding:"8px 22px",
                    background:"#fff",
                    color:"#1565c0",
                    border:"1.5px solid #1565c0",
                    borderRadius:20,
                    fontSize:13,
                    cursor:"pointer",
                    fontWeight:500,
                    transition:"all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#1565c0"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#1565c0"; }}
                >
                  Voir tous
                </button>
              </div>
            ))}
          </div>

        </main>

        {/* Footer */}
        <div style={{ background:G, padding:12, textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.85)" }}>
          © 2026 <span style={{ color:"#f4a61d" }}>Kibara-Santé</span>. Tous droits réservés.
        </div>
      </div>
    </div>
  );
}