import api from './api';

export const orderService = {
  async create(payload) {
    const { data } = await api.post('/orders', payload);
    return data.data;
  },
  async listMine() {
    const { data } = await api.get('/orders/mine');
    return data.data;
  },
  async listAll(statut) {
    const { data } = await api.get('/orders', { params: statut ? { statut } : {} });
    return data.data;
  },
  async getOne(id) {
    const { data } = await api.get(`/orders/${id}`);
    return data.data;
  },
  async updateStatus(id, statut) {
    const { data } = await api.patch(`/orders/${id}/status`, { statut });
    return data.data;
  },
};
