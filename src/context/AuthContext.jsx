import { createContext, useContext, useState, useEffect } from "react";
import AuthService from "../services/AuthService";

const AuthContext = createContext(null);

export function AuthProvider({ children, onNavigate, pendingPage, onClearPending }) {
  const [user,    setUser]    = useState(AuthService.getUser());
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (AuthService.isAuthenticated() && !user) {
      AuthService.me().then(setUser).catch(() => {
        AuthService.logout();
        setUser(null);
      });
    }
  }, []);

  function extraireErreurs(err) {
    if (err.errors && Object.keys(err.errors).length > 0) {
      return Object.entries(err.errors)
        .map(([champ, messages]) => `• ${champ} : ${messages.join(", ")}`)
        .join("\n");
    }
    return err.message;
  }

  async function login(email, motDePasse) {
    setLoading(true);
    setError(null);
    try {
      const data = await AuthService.loginPatient(email, motDePasse);
      setUser(data.utilisateur);
      const role = data.utilisateur.role;

      // ✅ Si une page était en attente avant le login → y aller directement
      if (pendingPage) {
        onClearPending();
        onNavigate(pendingPage);
      } else if (role === "medecin") onNavigate("dashboard-doctor");
      else if (role === "admin")     onNavigate("admin-dashboard");
      else                           onNavigate("dashboard-patient");

      return data;
    } catch (err) {
      setError(extraireErreurs(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await AuthService.logout();
    setUser(null);
    onNavigate("home");
  }

  async function registerPatient(payload) {
    setLoading(true);
    setError(null);
    try {
      const data = await AuthService.registerPatient(payload);
      setUser(data.utilisateur);
      onNavigate("dashboard-patient");
      return data;
    } catch (err) {
      setError(extraireErreurs(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function registerMedecin(formData) {
    setLoading(true);
    setError(null);
    try {
      const data = await AuthService.registerMedecin(formData);
      setUser(data.utilisateur);
      onNavigate("dashboard-doctor");
      return data;
    } catch (err) {
      setError(extraireErreurs(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, registerPatient, registerMedecin, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}