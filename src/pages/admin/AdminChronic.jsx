import { AdminList } from "../../components";

export default function AdminChronic({ onNavigate }) {
  return (
    <AdminList
      page="admin-chronic"
      title="❤️ Maladies Chroniques"
      columns={["N°", "Nom", "Description"]}
      rows={[
        ["1", "Diabète type 2", "Maladie métabolique chronique"],
        ["2", "Hypertension",   "Pression artérielle élevée persistante"],
        ["3", "Asthme",         "Maladie inflammatoire des voies respiratoires"],
      ]}
      onNavigate={onNavigate}
    />
  );
}
