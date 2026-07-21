import api from "./api";

export const FactureService = {
  liste()         { return api.get("/factures"); },
  detail(id)      { return api.get(`/factures/${id}`); },
  payer(id, payload) { return api.post(`/factures/${id}/payer`, payload); },
};

export const DossierMedicalService = {
  monDossier()               { return api.get("/dossier-medical"); },
  mettreAJour(payload)       { return api.put("/dossier-medical", payload); },
  dossierPatient(patientId)  { return api.get(`/medecin/patients/${patientId}/dossier`); },
  mettreAJourPatient(patientId, payload) {
    return api.put(`/medecin/patients/${patientId}/dossier`, payload);
  },
};

export const MessageService = {
  conversations()            { return api.get("/messages"); },
  nonLus()                   { return api.get("/messages/non-lus"); },
  thread(utilisateurId)      { return api.get(`/messages/${utilisateurId}`); },
  envoyer(destinataireId, contenu) {
    return api.post("/messages", { destinataire_id: destinataireId, contenu });
  },
};

export const AdminService = {
  stats()                    { return api.get("/admin/stats"); },

  // Médecins
  medecins(params = {})      {
    const q = new URLSearchParams(params).toString();
    return api.get(`/admin/medecins${q ? "?" + q : ""}`);
  },
  validerMedecin(id)         { return api.patch(`/admin/medecins/${id}/valider`); },
  suspendreMedecin(id)       { return api.patch(`/admin/medecins/${id}/suspendre`); },
  supprimerMedecin(id)       { return api.delete(`/admin/medecins/${id}`); },

  // Patients
  patients()                 { return api.get("/admin/patients"); },
  suspendrePatient(id)       { return api.patch(`/admin/patients/${id}/suspendre`); },
  supprimerPatient(id)       { return api.delete(`/admin/patients/${id}`); },

  // Spécialités
  specialites()              { return api.get("/admin/specialites"); },
  creerSpecialite(nom)       { return api.post("/admin/specialites", { nom }); },
  updateSpecialite(id, nom)  { return api.put(`/admin/specialites/${id}`, { nom }); },
  supprimerSpecialite(id)    { return api.delete(`/admin/specialites/${id}`); },

  // Régions
  regions()                  { return api.get("/admin/regions"); },
  creerRegion(nom)           { return api.post("/admin/regions", { nom }); },
  updateRegion(id, nom)      { return api.put(`/admin/regions/${id}`, { nom }); },
  supprimerRegion(id)        { return api.delete(`/admin/regions/${id}`); },
};
