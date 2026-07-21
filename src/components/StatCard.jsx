import s from "../styles/styles";
import { PRIMARY, TEXT_MUTED } from "../styles/tokens";

export default function StatCard({ label, value, icon }) {
  return (
    <div
      style={{
        ...s.card,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        padding: "1rem",
        flex: 1,
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 28, fontWeight: 800, color: PRIMARY }}>{value}</span>
      <span style={{ fontSize: 12, color: TEXT_MUTED }}>{label}</span>
    </div>
  );
}
