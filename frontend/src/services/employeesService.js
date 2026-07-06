import api from './api';
import API_ROUTES from './apiRoutes';

const employeesService = {
  getEmployees: async (params) => {
    const response = await api.get(API_ROUTES.usuarios, { params });
    return response.data;
  },

  createEmployee: async (data) => {
    const response = await api.post(API_ROUTES.usuarios, data);
    return response.data;
  },

  updateEmployee: async (id, data) => {
    const response = await api.put(`${API_ROUTES.usuarios}/${id}`, data);
    return response.data;
  },

  deleteEmployee: async (id) => {
    const response = await api.delete(`${API_ROUTES.usuarios}/${id}`);
    return response.data;
  },

  getRoles: async () => {
    const response = await api.get(API_ROUTES.roles);
    return response.data;
  },

  getPeople: async (params) => {
    const response = await api.get(API_ROUTES.personas, { params });
    return response.data;
  }
};

export default employeesService;