import api from './api';
import API_ROUTES from './apiRoutes';

const billingService = {
  createBilling: async (data) => {
    const response = await api.post(API_ROUTES.cuotas, data);
    return response.data;
  },

  generateMonthlyBilling: async (data) => {
    const response = await api.post(`${API_ROUTES.cuotas}/generate-monthly`, data);
    return response.data;
  },

  getBilling: async (params) => {
    const response = await api.get(API_ROUTES.cuotas, { params });
    return response.data;
  },

  recordPayment: async (data) => {
    const response = await api.post(API_ROUTES.pagos, data);
    return response.data;
  },

  getDelinquentReport: async () => {
    const response = await api.get(`${API_ROUTES.cuotas}/delinquent-report`);
    return response.data;
  },

  createPaymentAgreement: async (data) => {
    const response = await api.post(`${API_ROUTES.cuotas}/agreement`, data);
    return response.data;
  },

  getPaymentAgreements: async (params) => {
    const response = await api.get(`${API_ROUTES.cuotas}/agreement/list`, { params });
    return response.data;
  },

  calculateInterest: async (data) => {
    const response = await api.post(`${API_ROUTES.cuotas}/calculate-interest`, data);
    return response.data;
  }
};

export default billingService;
