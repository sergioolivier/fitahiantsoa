import api from './api';

export const categoryService = {
  async list() {
    const { data } = await api.get('/categories');
    return data.data;
  },
  async create(payload) {
    const { data } = await api.post('/categories', payload);
    return data.data;
  },
  async remove(id) {
    await api.delete(`/categories/${id}`);
  },
};
