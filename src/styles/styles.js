import { PRIMARY, PRIMARY_LIGHT, PRIMARY_DARK, BG, WHITE, TEXT, TEXT_MUTED, BORDER, SUCCESS, DANGER } from "./tokens";

const s = {
  card: {
    background: WHITE,
    borderRadius: 12,
    border: `1px solid ${BORDER}`,
    padding: "1.25rem",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  btn: {
    background: PRIMARY,
    color: WHITE,
    border: "none",
    borderRadius: 8,
    padding: "0.5rem 1.25rem",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  btnOutline: {
    background: "transparent",
    color: PRIMARY,
    border: `1.5px solid ${PRIMARY}`,
    borderRadius: 8,
    padding: "0.5rem 1.25rem",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  btnDanger: {
    background: DANGER,
    color: WHITE,
    border: "none",
    borderRadius: 8,
    padding: "0.4rem 1rem",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },
  btnSuccess: {
    background: SUCCESS,
    color: WHITE,
    border: "none",
    borderRadius: 8,
    padding: "0.4rem 1rem",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },
  label: { fontSize: 13, color: TEXT_MUTED, marginBottom: 4 },
  input: {
    width: "100%",
    padding: "0.5rem 0.75rem",
    borderRadius: 8,
    border: `1px solid ${BORDER}`,
    fontSize: 14,
    color: TEXT,
    background: WHITE,
    boxSizing: "border-box",
    outline: "none",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: TEXT,
    marginBottom: "1rem",
  },
  badge: (color = PRIMARY) => ({
    display: "inline-block",
    background: color + "1A",
    color: color,
    borderRadius: 20,
    padding: "2px 10px",
    fontSize: 12,
    fontWeight: 600,
  }),

  
};

export default s;
