import api from './api';

export const deliveryService = {
  async listAvailable() {
    const { data } = await api.get('/deliveries/available');
    return data.data;
  },
  async listMine() {
    const { data } = await api.get('/deliveries/mine');
    return data.data;
  },
  async accept(id) {
    const { data } = await api.patch(`/deliveries/${id}/accept`);
    return data.data;
  },
  async refuse(id) {
    const { data } = await api.patch(`/deliveries/${id}/refuse`);
    return data.data;
  },
  async updateStatus(id, statut, code_confirmation) {
    const { data } = await api.patch(`/deliveries/${id}/status`, { statut, code_confirmation });
    return data.data;
  },
  async generateCode(orderId) {
    const { data } = await api.post(`/deliveries/${orderId}/generate-code`);
    return data.data;
  },
};
