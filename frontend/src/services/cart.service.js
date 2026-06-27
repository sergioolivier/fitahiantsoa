import api from './api';

export const cartService = {
  async get() {
    const { data } = await api.get('/cart');
    return data.data;
  },
  async add(product_id, quantite = 1) {
    const { data } = await api.post('/cart', { product_id, quantite });
    return data.data;
  },
  async updateQuantity(id, quantite) {
    const { data } = await api.patch(`/cart/${id}`, { quantite });
    return data.data;
  },
  async remove(id) {
    await api.delete(`/cart/${id}`);
  },
};
