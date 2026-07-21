import api from "./api";
import { TOKEN_KEY, USER_KEY } from "../constants";
const AuthService = {
  async loginPatient(email, motDePasse) {
    const data = await api.post("/auth/login", { email, mot_de_passe: motDePasse });
    console.log("réponse login :", data);
    localStorage.setItem("kibarasante_token", data.token);
    localStorage.setItem("kibarasante_user", JSON.stringify(data.utilisateur));
    return data;
  },

  async registerPatient(payload) {
    const data = await api.post("/auth/register/patient", payload);
    localStorage.setItem("kibarasante_token", data.token);
    localStorage.setItem("kibarasante_user", JSON.stringify(data.utilisateur));
    return data;
  },

  async registerMedecin(formData) {
    const data = await api.post("/auth/register/medecin", formData, true);
    localStorage.setItem("kibarasante_token", data.token);
    localStorage.setItem("kibarasante_user", JSON.stringify(data.utilisateur));
    return data;
  },

  async logout() {
    try { await api.post("/auth/logout"); } catch (_) {}
    localStorage.removeItem("kibarasante_token");
    localStorage.removeItem("kibarasante_user");
  },

  async me() {
    const data = await api.get("/auth/me");
    localStorage.setItem("kibarasante_user", JSON.stringify(data));
    return data;
  },

  async updateProfile(payload) {
    const isForm = payload instanceof FormData;
    return api.put("/auth/profile", payload, isForm);
  },

  getUser() {
    try { return JSON.parse(localStorage.getItem("kibarasante_user")); }
    catch { return null; }
  },

  getToken() {
    return localStorage.getItem("kibarasante_token");
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};

export default AuthService;
