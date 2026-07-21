import { useState, useEffect } from "react";
import TopBar from "../../components/TopBar";
import { s } from "../../styles/shared";
import { BG, PRIMARY, PRIMARY_LIGHT, ACCENT, WHITE, TEXT_MUTED, BORDER } from "../../styles/tokens";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const inputStyle = {
  ...s.input,
  width: "100%",
  boxSizing: "border-box",
  padding: "0.75rem 1rem",
  fontSize: 15,
  transition: "all 0.2s",
};

export default function RegisterDoctor({ onNavigate }) {
  const { registerMedecin, loading, error } = useAuth();

  const [specialites, setSpecialites] = useState([]);
  const [regions, setRegions]         = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // ✅ CORRECTION 1 — ajout de mot_de_passe_confirmation
  const [form, setForm] = useState({
    email:                     "",
    numero_ordre:              "",
    prenom:                    "",
    nom:                       "",
    date_naissance:            "",
    mot_de_passe:              "",
    mot_de_passe_confirmation: "", // ✅ ajouté
    telephone:                 "",
    civilite:                  "",
    specialite_id:             "",
    region_id:                 "",
    photo_profil:              null,
    cgu:                       false,
  });

  useEffect(() => {
    Promise.all([
      api.get("/specialites"),
      api.get("/regions"),
    ])
      .then(([dataSpecialites, dataRegions]) => {
        setSpecialites(dataSpecialites);
        setRegions(dataRegions);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked
            : type === "file"     ? files[0]
            : value,
    }));
  };

  const handleSubmit = async () => {
    // ✅ CORRECTION 2 — validations avant envoi
    if (!form.cgu) {
      alert("Veuillez accepter les conditions d'utilisation.");
      return;
    }
    if (!form.specialite_id) {
      alert("Veuillez choisir une spécialité.");
      return;
    }
    if (!form.region_id) {
      alert("Veuillez choisir une région.");
      return;
    }
    if (form.mot_de_passe !== form.mot_de_passe_confirmation) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    // ✅ CORRECTION 3 — filtrer les valeurs vides et cgu
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== "" && key !== "cgu") {
        formData.append(key, value);
      }
    });

    try {
      await registerMedecin(formData);
    } catch (_) {}
  };

  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      <TopBar onNavigate={onNavigate} page="" />

      <div style={{
        display: "flex",
        justifyContent: "center",
        padding: "3rem 1rem",
        background: `linear-gradient(to bottom, #f8fafc 0%, ${BG} 30%)`
      }}>
        <div style={{
          ...s.card,
          width: "100%",
          maxWidth: 560,
          padding: "2.5rem 2rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: `1px solid ${BORDER}`
        }}>

          <h2 style={{ textAlign: "center", fontWeight: 800, color: PRIMARY, marginBottom: 6, fontSize: 26 }}>
            Créer un Compte Docteur
          </h2>
          <p style={{ textAlign: "center", color: TEXT_MUTED, fontSize: 14.5, marginBottom: "2rem" }}>
            Rejoignez Kibara-Santé pour optimiser votre pratique médicale
          </p>

          {error && (
            <div style={{ background: "#fee2e2", color: "#dc2626", padding: "0.75rem 1rem", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
              {error}
            </div>
          )}

          {/* ✅ CORRECTION 4 — ajout de mot_de_passe_confirmation dans la grille */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              ["Email",                      "email",    "email",                     "exemple@medecin.com"],
              ["N° d'inscription à l'Ordre", "text",     "numero_ordre",              "12345-ORDRE"],
              ["Prénom",                      "text",     "prenom",                    "Prénom"],
              ["Nom",                         "text",     "nom",                       "Nom de famille"],
              ["Date de naissance",           "date",     "date_naissance",            ""],
              ["Mot de passe",                "password", "mot_de_passe",              "••••••••"],
              ["Confirmer mot de passe",      "password", "mot_de_passe_confirmation", "••••••••"], // ✅
              ["Téléphone",                   "tel",      "telephone",                 "+226 XX XX XX XX"],
            ].map(([label, type, name, ph]) => (
              <div key={name} style={{ minWidth: 0 }}>
                <label style={s.label}>{label}</label>
                <input
                  style={inputStyle}
                  type={type}
                  name={name}
                  placeholder={ph}
                  value={form[name]}
                  onChange={handleChange}
                />
              </div>
            ))}

            {/* Genre */}
            <div style={{ minWidth: 0 }}>
              <label style={s.label}>Genre</label>
              <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                {[["Homme", "M."], ["Femme", "Mme"]].map(([label, val]) => (
                  <button
                    key={val}
                    onClick={() => setForm((p) => ({ ...p, civilite: val }))}
                    style={{
                      ...s.btnOutline,
                      flex: 1,
                      padding: "13px 20px",
                      fontSize: 15,
                      minHeight: 48,
                      borderRadius: 8,
                      boxSizing: "border-box",
                      background: form.civilite === val ? PRIMARY : "white",
                      color:      form.civilite === val ? "white"  : PRIMARY,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Spécialité et Région dynamiques */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
            <div style={{ minWidth: 0 }}>
              <label style={s.label}>Spécialité médicale</label>
              <select
                name="specialite_id"
                style={inputStyle}
                value={form.specialite_id}
                onChange={handleChange}
                disabled={loadingData}
              >
                <option value="">
                  {loadingData ? "Chargement..." : "Choisissez une spécialité"}
                </option>
                {specialites.map((sp) => (
                  <option key={sp.id} value={sp.id}>{sp.nom}</option>
                ))}
              </select>
            </div>

            <div style={{ minWidth: 0 }}>
              <label style={s.label}>Région d'exercice</label>
              <select
                name="region_id"
                style={inputStyle}
                value={form.region_id}
                onChange={handleChange}
                disabled={loadingData}
              >
                <option value="">
                  {loadingData ? "Chargement..." : "Choisissez une région"}
                </option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>{r.nom}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Photo de profil */}
          <div style={{ marginTop: 20 }}>
            <label style={s.label}>Photo de profil (optionnel)</label>
            <input
              style={{ ...s.input, width: "100%", boxSizing: "border-box", padding: "0.6rem 1rem", background: WHITE }}
              type="file"
              name="photo_profil"
              accept="image/*"
              onChange={handleChange}
            />
          </div>

          {/* CGU */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: TEXT_MUTED, margin: "20px 0 24px", cursor: "pointer" }}>
            <input
              type="checkbox"
              name="cgu"
              checked={form.cgu}
              onChange={handleChange}
              style={{ width: 18, height: 18, accentColor: PRIMARY }}
            />
            J'accepte les conditions d'utilisation et la politique de confidentialité
          </label>

          {/* Bouton submit */}
          <button
            style={{
              ...s.btn,
              width: "100%",
              padding: "0.9rem",
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 10,
              background: loading ? "#ccc" : `linear-gradient(90deg, ${PRIMARY}, ${ACCENT})`,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Création en cours..." : "Créer mon compte médecin"}
          </button>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13.5, color: TEXT_MUTED }}>
            Vous avez déjà un compte ?{" "}
            <span style={{ color: PRIMARY, fontWeight: 600, cursor: "pointer" }} onClick={() => onNavigate("login")}>
              Se connecter
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}