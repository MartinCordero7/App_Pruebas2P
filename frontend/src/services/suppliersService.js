import api from './api';
import API_ROUTES from './apiRoutes';

const suppliersService = {
  createSupplier: async (data) => {
    const response = await api.post(API_ROUTES.tickets, { ...data, category: 'Proveedor' });
    return response.data;
  },

  getSuppliers: async (params) => {
    const response = await api.get(API_ROUTES.tickets, { params: { ...params, category: 'Proveedor' } });
    return response.data;
  },

  getSupplierById: async (id) => {
    const response = await api.get(`${API_ROUTES.tickets}/${id}`);
    return response.data;
  },

  updateSupplier: async (id, data) => {
    const response = await api.put(`${API_ROUTES.tickets}/${id}`, { ...data, category: 'Proveedor' });
    return response.data;
  },

  deleteSupplier: async (id) => {
    const response = await api.delete(`${API_ROUTES.tickets}/${id}`);
    return response.data;
  },

  createPurchaseOrder: async (data) => {
    const response = await api.post(API_ROUTES.tickets, { ...data, category: 'Compra' });
    return response.data;
  },

  getPurchaseOrders: async (params) => {
    const response = await api.get(API_ROUTES.tickets, { params: { ...params, category: 'Compra' } });
    return response.data;
  },

  updatePurchaseOrderStatus: async (id, status) => {
    const response = await api.patch(`${API_ROUTES.tickets}/${id}/status`, { status });
    return response.data;
  }
};

export default suppliersService;
