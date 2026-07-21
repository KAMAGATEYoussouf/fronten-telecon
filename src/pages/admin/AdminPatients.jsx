import { Sidebar } from "../../components";
import { useApi, useAction } from "../../hooks/useApi";
import { AdminService } from "../../services";
import s from "../../styles/styles";
import { PRIMARY, BG, SUCCESS, DANGER, WARNING, TEXT_MUTED, WHITE, BORDER } from "../../styles/tokens";

export default function AdminPatients({ onNavigate }) {
  const { data, loading, refetch } = useApi(() => AdminService.patients());
  const { execute: suspendre } = useAction(AdminService.suspendrePatient);
  const { execute: supprimer } = useAction(AdminService.supprimerPatient);

  const patients = data?.data ?? [];

  async function handle(action, id, msg) {
    if (!confirm(msg)) return;
    try { await action(id); refetch(); }
    catch (e) { alert(e.message); }
  }

  return (
    <div style={{ display:"flex", minHeight:"100vh", background: BG }}>
      <Sidebar role="admin" page="admin-patients" onNavigate={onNavigate} />
      <main style={{ flex:1, padding:"2rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
          <h2 style={s.sectionTitle}>👥 Gestion des Patients</h2>
          <span style={s.badge(PRIMARY)}>{patients.length} patients</span>
        </div>

        {loading ? <p style={{ color: TEXT_MUTED }}>Chargement...</p> : (
          <div style={{ ...s.card, overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
              <thead>
                <tr style={{ background: PRIMARY, color: WHITE }}>
                  {["N°","Nom","Email","Téléphone","N° Dossier","Statut","Actions"].map(c => (
                    <th key={c} style={{ padding:"0.6rem 1rem", textAlign:"left", fontWeight:600 }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 && (
                  <tr><td colSpan={7} style={{ padding:"1.5rem", textAlign:"center", color: TEXT_MUTED }}>Aucun patient trouvé.</td></tr>
                )}
                {patients.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom:`1px solid ${BORDER}`, background: i%2===0 ? WHITE : BG }}>
                    <td style={{ padding:"0.6rem 1rem" }}>{p.id}</td>
                    <td style={{ padding:"0.6rem 1rem", fontWeight:600 }}>{p.utilisateur?.prenom} {p.utilisateur?.nom}</td>
                    <td style={{ padding:"0.6rem 1rem" }}>{p.utilisateur?.email}</td>
                    <td style={{ padding:"0.6rem 1rem" }}>{p.utilisateur?.telephone}</td>
                    <td style={{ padding:"0.6rem 1rem" }}>{p.numero_dossier_medical ?? "—"}</td>
                    <td style={{ padding:"0.6rem 1rem" }}>
                      <span style={s.badge(p.utilisateur?.statut === "actif" ? SUCCESS : DANGER)}>
                        {p.utilisateur?.statut}
                      </span>
                    </td>
                    <td style={{ padding:"0.6rem 1rem" }}>
                      <div style={{ display:"flex", gap:5 }}>
                        <button style={{ ...s.btn, background: WARNING, fontSize:11, padding:"0.2rem 0.6rem" }} onClick={() => handle(suspendre, p.id, "Suspendre ce patient ?")}>Suspendre</button>
                        <button style={{ ...s.btnDanger, fontSize:11, padding:"0.2rem 0.6rem" }} onClick={() => handle(supprimer, p.id, "Supprimer ce patient ?")}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
