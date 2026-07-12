import React, { useState, useEffect } from 'react';
import { Plus, DollarSign } from 'lucide-react';
import { Card, Button, Input, Select, Table, Alert } from '../components/UI';
import billingService from '../services/billingService';
import unitsService from '../services/unitsService';
import { validateForm } from '../utils/validation';

// Campos según API_CONTRACT.md y tabla cuota del schema
const DEFAULT_FORM = {
  unidadId: '',
  mes: new Date().getMonth() + 1,
  anio: new Date().getFullYear(),
  valor: '',
  tipo: 'ORDINARIA',
  descripcion: '',
  fechaVencimiento: ''
};

export function Billing() {
  const [billing, setBilling] = useState([]);
  const [delinquent, setDelinquent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('billing');
  const [showForm, setShowForm] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    loadBillingData();
    loadUnits();

    const interval = setInterval(() => loadBillingData(), 15000);
    return () => clearInterval(interval);
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        billingService.getBilling({}),
        billingService.getDelinquentReport()
      ]);

      const billingResp = results[0].status === 'fulfilled' ? results[0].value : null;
      const delinquentResp = results[1].status === 'fulfilled' ? results[1].value : null;

      // Desempaquetar wrapper: { data: { content: [...] } }
      const billingList = billingResp?.data?.content || billingResp?.content || (Array.isArray(billingResp) ? billingResp : []);
      const delinquentList = delinquentResp?.data?.content || delinquentResp?.delinquent || (Array.isArray(delinquentResp) ? delinquentResp : []);

      setBilling(billingList);
      setDelinquent(delinquentList);
    } catch (err) {
      setError('Error cargando datos de cobranza');
    } finally {
      setLoading(false);
    }
  };

  const loadUnits = async () => {
    try {
      const response = await unitsService.getUnits({});
      const list = response?.data?.content || response?.content || (Array.isArray(response) ? response : []);
      setUnits(list);
    } catch (err) {
      console.error('Error cargando unidades');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    const rules = {
      unidadId: { required: true },
      valor: { required: true, type: 'currency' },
      fechaVencimiento: { required: true },
      mes: { required: true },
      anio: { required: true }
    };

    const errors = validateForm(formData, rules);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Payload plano según API_CONTRACT.md y schema (NOT NULL: unidadId, mes, anio, valor, tipo, fechaVencimiento)
    const payload = {
      unidadId: Number(formData.unidadId),
      mes: Number(formData.mes),
      anio: Number(formData.anio),
      valor: parseFloat(formData.valor),
      tipo: formData.tipo,                        // ENUM: ORDINARIA | EXTRAORDINARIA | MULTA | FONDO_RESERVA
      descripcion: formData.descripcion || null,
      fechaVencimiento: formData.fechaVencimiento // ISO date: YYYY-MM-DD
    };

    try {
      await billingService.createBilling(payload);
      setFormData(DEFAULT_FORM);
      setValidationErrors({});
      setShowForm(false);
      loadBillingData();
    } catch (err) {
      const errData = err.response?.data;
      const msg = errData?.errors?.map(e => `${e.campo}: ${e.message}`).join(' | ')
        || errData?.message
        || 'Error creando cuota';
      setError(msg);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Cobranza</h1>
        <Button onClick={() => { setShowForm(!showForm); setValidationErrors({}); }}>
          <Plus size={20} className="mr-2" />
          Nueva Cuota
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'billing' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          Cuotas Pendientes
        </button>
        <button
          onClick={() => setActiveTab('delinquent')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'delinquent' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          Morosos ({delinquent.length})
        </button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-lg font-bold mb-4">Crear Cuota</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Unidad"
                name="unidadId"
                value={formData.unidadId}
                onChange={handleChange}
                error={validationErrors.unidadId}
                required
              >
                <option value="">Seleccionar unidad...</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.numero} {u.condominioNombre ? `— ${u.condominioNombre}` : ''}
                  </option>
                ))}
              </Select>
              <Input
                label="Valor ($)"
                type="number"
                name="valor"
                value={formData.valor}
                onChange={handleChange}
                error={validationErrors.valor}
                step="0.01"
                min="0.01"
                required
              />
              <Select
                label="Tipo de Cuota"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
              >
                <option value="ORDINARIA">Ordinaria</option>
                <option value="EXTRAORDINARIA">Extraordinaria</option>
                <option value="MULTA">Multa</option>
                <option value="FONDO_RESERVA">Fondo de Reserva</option>
              </Select>
              <Input
                label="Fecha de Vencimiento"
                type="date"
                name="fechaVencimiento"
                value={formData.fechaVencimiento}
                onChange={handleChange}
                error={validationErrors.fechaVencimiento}
                required
              />
              <Input
                label="Mes (1-12)"
                type="number"
                name="mes"
                value={formData.mes}
                onChange={handleChange}
                error={validationErrors.mes}
                min="1"
                max="12"
                required
              />
              <Input
                label="Año"
                type="number"
                name="anio"
                value={formData.anio}
                onChange={handleChange}
                error={validationErrors.anio}
                min="2020"
                max="2100"
                required
              />
              <Input
                label="Descripción (opcional)"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit">Guardar</Button>
              <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setValidationErrors({}); }}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'billing' && (
        <Card>
          <h2 className="text-lg font-bold mb-4">Cuotas Pendientes</h2>
          <Table
            columns={['Unidad', 'Tipo', 'Valor', 'Mes/Año', 'Vencimiento', 'Estado']}
            data={billing.map((b) => ({
              Unidad: b.unidadNumero || b.numero || '-',
              Tipo: b.tipo || '-',
              Valor: `$${parseFloat(b.valor || 0).toFixed(2)}`,
              'Mes/Año': b.mes && b.anio ? `${b.mes}/${b.anio}` : '-',
              Vencimiento: b.fechaVencimiento ? new Date(b.fechaVencimiento).toLocaleDateString() : '-',
              Estado: b.estado || '-'
            }))}
            loading={loading}
          />
        </Card>
      )}

      {activeTab === 'delinquent' && (
        <Card>
          <h2 className="text-lg font-bold mb-4">Residentes Morosos</h2>
          <Table
            columns={['Unidad', 'Monto Vencido', 'Cuotas Vencidas', 'Saldo Pendiente']}
            data={delinquent.map((d) => ({
              Unidad: d.unidadNumero || d.numero || '-',
              'Monto Vencido': `$${parseFloat(d.montoCuotasVencidas || d.totalDebt || 0).toFixed(2)}`,
              'Cuotas Vencidas': d.cuotasVencidas ?? d.pending_bills ?? '-',
              'Saldo Pendiente': d.saldoPendienteTotal != null ? `$${parseFloat(d.saldoPendienteTotal).toFixed(2)}` : '-'
            }))}
            loading={loading}
          />
        </Card>
      )}
    </div>
  );
}
