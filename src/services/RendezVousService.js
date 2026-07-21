import api from "./api";

const RendezVousService = {
  liste(params = {}) {
    const query = new URLSearchParams(params).toString();
    return api.get(`/rendez-vous${query ? "?" + query : ""}`);
  },

  creer(payload) {
    return api.post("/rendez-vous", payload);
  },

  detail(id) {
    return api.get(`/rendez-vous/${id}`);
  },

  confirmer(id) {
    return api.patch(`/rendez-vous/${id}/confirmer`);
  },

  refuser(id) {
    return api.patch(`/rendez-vous/${id}/refuser`);
  },

  annuler(id) {
    return api.patch(`/rendez-vous/${id}/annuler`);
  },
};

export default RendezVousService;
