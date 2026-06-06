import api from './api';

const documentsService = {
  uploadDocument: async (data) => {
    const response = await api.post('/documents', data);
    return response.data;
  },

  getDocuments: async (params) => {
    const response = await api.get('/documents', { params });
    return response.data;
  },

  getDocumentById: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  updateDocument: async (id, data) => {
    const response = await api.put(`/documents/${id}`, data);
    return response.data;
  },

  deleteDocument: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  getExpiringDocuments: async () => {
    const response = await api.get('/documents/expiring');
    return response.data;
  }
};

export default documentsService;
