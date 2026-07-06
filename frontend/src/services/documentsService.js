import api from './api';
import API_ROUTES from './apiRoutes';

const documentsService = {
  uploadDocument: async (data) => {
    const targetRoute = data.relatedEntityType === 'ticket'
      ? API_ROUTES.adjuntosTickets
      : data.documentType === 'recibo'
        ? API_ROUTES.recibos
        : API_ROUTES.actas;
    const response = await api.post(targetRoute, data);
    return response.data;
  },

  getDocuments: async (params) => {
    const [acts, receipts, attachments] = await Promise.all([
      api.get(API_ROUTES.actas, { params }),
      api.get(API_ROUTES.recibos, { params }),
      api.get(API_ROUTES.adjuntosTickets, { params })
    ]);
    return [
      ...(Array.isArray(acts.data) ? acts.data : []),
      ...(Array.isArray(receipts.data) ? receipts.data : []),
      ...(Array.isArray(attachments.data) ? attachments.data : [])
    ];
  },

  getDocumentById: async (id) => {
    const response = await api.get(`${API_ROUTES.actas}/${id}`);
    return response.data;
  },

  updateDocument: async (id, data) => {
    const response = await api.put(`${API_ROUTES.actas}/${id}`, data);
    return response.data;
  },

  deleteDocument: async (id) => {
    const response = await api.delete(`${API_ROUTES.actas}/${id}`);
    return response.data;
  },

  getExpiringDocuments: async () => {
    const response = await api.get(`${API_ROUTES.actas}/expiring`);
    return response.data;
  }
};

export default documentsService;
