import api from "./api";

const MedecinService = {
  rechercher(params = {}) {
    const query = new URLSearchParams(params).toString();
    return api.get(`/medecins${query ? "?" + query : ""}`);
  },

  detail(id) {
    return api.get(`/medecins/${id}`);
  },

  dashboard() {
    return api.get("/medecin/dashboard");
  },

  getDisponibilites() {
    return api.get("/medecin/disponibilites");
  },

  updateDisponibilites(disponibilites) {
    return api.put("/medecin/disponibilites", { disponibilites });
  },
  // Déjà disponible via RendezVousService
getRendezVous() {
  return api.get("/rendez-vous");
}
};

export default MedecinService;
