import api from './api';

const billingService = {
  createBilling: async (data) => {
    const response = await api.post('/cuotas', data);
    return response.data;
  },

  generateMonthlyBilling: async (data) => {
    const response = await api.post('/cuotas/generate-monthly', data);
    return response.data;
  },

  getBilling: async (params) => {
    const response = await api.get('/cuotas', { params });
    return response.data;
  },

  recordPayment: async (data) => {
    const response = await api.post('/pagos', data);
    return response.data;
  },

  getDelinquentReport: async () => {
    const response = await api.get('/cuotas/delinquent-report');
    return response.data;
  },

  createPaymentAgreement: async (data) => {
    const response = await api.post('/cuotas/agreement', data);
    return response.data;
  },

  getPaymentAgreements: async (params) => {
    const response = await api.get('/cuotas/agreement/list', { params });
    return response.data;
  },

  calculateInterest: async (data) => {
    const response = await api.post('/cuotas/calculate-interest', data);
    return response.data;
  }
};

export default billingService;
