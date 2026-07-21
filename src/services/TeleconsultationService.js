import api from "./api";

const TeleconsultationService = {
  demarrer(rendezVousId) {
    return api.post(`/rendez-vous/${rendezVousId}/teleconsultation`);
  },

  detail(id) {
    return api.get(`/teleconsultations/${id}`);
  },

  update(id, payload) {
    return api.put(`/teleconsultations/${id}`, payload);
  },

  terminer(id) {
    return api.post(`/teleconsultations/${id}/terminer`);
  },
};

export default TeleconsultationService;
