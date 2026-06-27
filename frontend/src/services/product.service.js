import api from './api';

export const productService = {
  async list(params = {}) {
    const { data } = await api.get('/products', { params });
    return data;
  },
  async getOne(id) {
    const { data } = await api.get(`/products/${id}`);
    return data.data;
  },
  async listMine() {
    const { data } = await api.get('/products/mine');
    return data.data;
  },
  async create(payload) {
    const { data } = await api.post('/products', payload);
    return data.data;
  },
  async update(id, payload) {
    const { data } = await api.patch(`/products/${id}`, payload);
    return data.data;
  },
  async remove(id) {
    await api.delete(`/products/${id}`);
  },
  async listPending() {
    const { data } = await api.get('/products/pending');
    return data.data;
  },
  async validate(id, prix_vente, est_sponsorise) {
    const { data } = await api.patch(`/products/${id}/validate`, { prix_vente, est_sponsorise });
    return data.data;
  },
  async refuse(id, motif_refus) {
    const { data } = await api.patch(`/products/${id}/refuse`, { motif_refus });
    return data.data;
  },
  async uploadMedia(id, file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post(`/products/${id}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },
};
