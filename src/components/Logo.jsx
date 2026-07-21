import { PRIMARY, WHITE } from "../styles/tokens";

export default function Logo({ size = 22 }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill={PRIMARY} />
        <path d="M12 6v12M6 12h12" stroke={WHITE} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <h1 style={{ fontSize: 20, fontWeight: 300, margin: "0 0 0.6rem" }}>
          <span style={{ color: "#1565c0" }}>Kibara-</span><span style={{ color: "#f4a61d" }}>Santé</span> 
        </h1>
    </span>
  );
}
