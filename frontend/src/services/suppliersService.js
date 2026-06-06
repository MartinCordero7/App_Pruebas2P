import api from './api';

const suppliersService = {
  createSupplier: async (data) => {
    const response = await api.post('/suppliers', data);
    return response.data;
  },

  getSuppliers: async (params) => {
    const response = await api.get('/suppliers', { params });
    return response.data;
  },

  getSupplierById: async (id) => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  updateSupplier: async (id, data) => {
    const response = await api.put(`/suppliers/${id}`, data);
    return response.data;
  },

  deleteSupplier: async (id) => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  },

  createPurchaseOrder: async (data) => {
    const response = await api.post('/suppliers/purchase-order', data);
    return response.data;
  },

  getPurchaseOrders: async (params) => {
    const response = await api.get('/suppliers/purchase-order', { params });
    return response.data;
  },

  updatePurchaseOrderStatus: async (id, status) => {
    const response = await api.patch(`/suppliers/purchase-order/${id}/status`, { status });
    return response.data;
  }
};

export default suppliersService;
