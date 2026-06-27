import api from './api';

export const authService = {
  async register(payload) {
    const { data } = await api.post('/auth/register', payload);
    return data.data;
  },
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data;
  },
  async me() {
    const { data } = await api.get('/auth/me');
    return data.data;
  },
  saveSession({ user, accessToken, refreshToken }) {
    localStorage.setItem('fitahiantsoa_access_token', accessToken);
    localStorage.setItem('fitahiantsoa_refresh_token', refreshToken);
    localStorage.setItem('fitahiantsoa_user', JSON.stringify(user));
  },
  clearSession() {
    localStorage.removeItem('fitahiantsoa_access_token');
    localStorage.removeItem('fitahiantsoa_refresh_token');
    localStorage.removeItem('fitahiantsoa_user');
  },
  getStoredUser() {
    const raw = localStorage.getItem('fitahiantsoa_user');
    return raw ? JSON.parse(raw) : null;
  },
};
