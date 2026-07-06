export const API_ROUTES = {
  auth: {
    login: '/auth/login'
  },
  dashboard: {
    summary: '/dashboard',
    stats: '/dashboard/stats',
    budget: '/dashboard/budget',
    financial: '/dashboard/financial',
    cashFlow: '/dashboard/cash-flow',
    balanceSheet: '/dashboard/balance-sheet'
  },
  condominios: '/condominios',
  torres: (condominioId) => `/condominios/${condominioId}/torres`,
  unidades: '/unidades',
  personas: '/personas',
  residentes: '/residentes',
  cuotas: '/cuotas',
  pagos: '/pagos',
  multas: '/multas',
  tickets: '/tickets',
  categorias: '/categorias',
  comunicados: '/comunicados',
  visitantes: '/visitantes',
  visitantesPreautorizados: '/visitantes-preautorizados',
  accesos: '/accesos',
  actas: '/actas',
  recibos: '/recibos',
  parqueaderos: '/parqueaderos',
  vehiculos: '/vehiculos',
  areasComunes: '/areas-comunes',
  usuarios: '/usuarios',
  roles: '/roles',
  proveedores: '/proveedores',
  compras: '/compras',
  documentos: '/documentos',
  adjuntosTickets: '/tickets/adjuntos'
};

export default API_ROUTES;