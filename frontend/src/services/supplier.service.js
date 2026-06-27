import api from './api';

export const supplierService = {
  async getDashboard() {
    const { data } = await api.get('/suppliers/dashboard');
    return data.data;
  },
  async updateProfile(payload) {
    const { data } = await api.patch('/suppliers/profile', payload);
    return data.data;
  },
};
