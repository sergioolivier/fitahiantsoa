import api from './api';

export const notificationService = {
  async list() {
    const { data } = await api.get('/notifications');
    return data;
  },
  async markAsRead(id) {
    await api.patch(`/notifications/${id}/read`);
  },
  async markAllAsRead() {
    await api.patch('/notifications/read-all');
  },
};
