import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attache automatiquement le token d'acces a chaque requete sortante.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fitahiantsoa_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si le token a expire (401) et qu'un refresh token existe, tente un rafraichissement
// automatique puis rejoue la requete d'origine une seule fois.
let isRefreshing = false;
let refreshQueue = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('fitahiantsoa_refresh_token');
      if (!refreshToken) {
        clearSession();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject, originalRequest });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        const newAccessToken = data.data.accessToken;
        localStorage.setItem('fitahiantsoa_access_token', newAccessToken);

        refreshQueue.forEach(({ resolve, originalRequest: req }) => {
          req.headers.Authorization = `Bearer ${newAccessToken}`;
          resolve(api(req));
        });
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        refreshQueue.forEach(({ reject }) => reject(refreshError));
        refreshQueue = [];
        clearSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function clearSession() {
  localStorage.removeItem('fitahiantsoa_access_token');
  localStorage.removeItem('fitahiantsoa_refresh_token');
  localStorage.removeItem('fitahiantsoa_user');
  window.location.href = '/connexion';
}

export default api;
