import api from "./api";

const FactureService = {
  liste() {
    return api.get("/factures");
  },

  detail(id) {
    return api.get(`/factures/${id}`);
  },

  payer(id, payload) {
    return api.post(`/factures/${id}/payer`, payload);
  },
};

export default FactureService;