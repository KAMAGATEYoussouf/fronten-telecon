const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
import { TOKEN_KEY, USER_KEY } from "../constants";

function getToken() {
  return localStorage.getItem("kibarasante_token");
}

async function request(method, path, data = null, isFormData = false) {
  const headers = {};
  const token = getToken();

  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData) headers["Content-Type"] = "application/json";
  headers["Accept"] = "application/json";

  const config = {
    method,
    headers,
    body: data
      ? isFormData
        ? data
        : JSON.stringify(data)
      : undefined,
  };

  const response = await fetch(`${BASE_URL}${path}`, config);
  const json = await response.json().catch(() => ({}));

  // ✅ Token expiré → vider le localStorage et recharger
  if (response.status === 401) {
    localStorage.removeItem("kibarasante_token");
    localStorage.removeItem("kibarasante_user");
    window.location.reload();
    return;
  }

  if (!response.ok) {
    const error = new Error(json.message ?? "Erreur serveur");
    error.status = response.status;
    error.errors = json.errors ?? {};
    throw error;
  }

  return json;
}

const api = {
  get:    (path)             => request("GET",    path),
  post:   (path, data, form) => request("POST",   path, data, form),
  put:    (path, data, form) => request("PUT",    path, data, form),
  patch:  (path, data)       => request("PATCH",  path, data),
  delete: (path)             => request("DELETE", path),
};

export default api;