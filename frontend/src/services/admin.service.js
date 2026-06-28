import api from './api';

export const adminService = {
  async listUsers(role) {
    const { data } = await api.get('/admin/users', { params: role ? { role } : {} });
    return data.data;
  },
  async createInternalUser(payload) {
    const { data } = await api.post('/admin/users', payload);
    return data.data;
  },
  async toggleUserActive(id) {
    const { data } = await api.patch(`/admin/users/${id}/toggle-active`);
    return data.data;
  },
  async changeUserRole(id, role) {
    const { data } = await api.patch(`/admin/users/${id}/role`, { role });
    return data.data;
  },
  async changeStaffType(id, type_personnel, date_fin_mission) {
    const { data } = await api.patch(`/admin/users/${id}/staff-type`, { type_personnel, date_fin_mission });
    return data.data;
  },
  async getDashboard() {
    const { data } = await api.get('/admin/dashboard');
    return data.data;
  },
};
