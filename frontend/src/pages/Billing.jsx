import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, DollarSign } from 'lucide-react';
import { Card, Button, Input, Select, Table, Alert } from '../components/UI';
import billingService from '../services/billingService';
import unitsService from '../services/unitsService';
import { validateForm } from '../utils/validation';

export function Billing() {
  const [billing, setBilling] = useState([]);
  const [delinquent, setDelinquent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('billing');
  const [showForm, setShowForm] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    unitId: '',
    amount: '',
    type: 'ordinaria',
    description: '',
    dueDate: ''
  });
  const [units, setUnits] = useState([]);

  useEffect(() => {
    loadBillingData();
    loadUnits();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const [billingData, delinquentData] = await Promise.all([
        billingService.getBilling({ paid: 'false' }),
        billingService.getDelinquentReport()
      ]);
      setBilling(Array.isArray(billingData) ? billingData : []);
      setDelinquent(delinquentData.delinquent || []);
    } catch (err) {
      setError('Error cargando datos de cobranza');
    } finally {
      setLoading(false);
    }
  };

  const loadUnits = async () => {
    try {
      const data = await unitsService.getUnits({});
      setUnits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando unidades');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    const rules = {
      unitId: { required: true },
      amount: { required: true, type: 'currency' }
    };

    const errors = validateForm(formData, rules);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await billingService.createBilling(formData);
      setFormData({
        unitId: '',
        amount: '',
        type: 'ordinaria',
        description: '',
        dueDate: ''
      });
      setValidationErrors({});
      setShowForm(false);
      loadBillingData();
    } catch (err) {
      setError(err.response?.data?.error || 'Error creando facturación');
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
            activeTab === 'billing'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          Facturación
        </button>
        <button
          onClick={() => setActiveTab('delinquent')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'delinquent'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800'
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
                name="unitId"
                value={formData.unitId}
                onChange={handleChange}
                error={validationErrors.unitId}
                required
              >
                <option value="">Seleccionar unidad...</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.unit_number} {u.first_name ? `- (Propietario: ${u.first_name} ${u.last_name})` : ''}
                  </option>
                ))}
              </Select>
              <Input
                label="Monto"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                error={validationErrors.amount}
                step="0.01"
                required
              />
              <Select
                label="Tipo"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="ordinaria">Ordinaria</option>
                <option value="extraordinaria">Extraordinaria</option>
              </Select>
              <Input
                label="Fecha de Vencimiento"
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
              <Input
                label="Descripción"
                name="description"
                value={formData.description}
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
          <h2 className="text-lg font-bold mb-4">Facturas Pendientes</h2>
          <Table
            columns={['Unidad', 'Monto', 'Vencimiento', 'Interés', 'Acciones']}
            data={billing.map((b) => ({
              Unidad: b.unit_number,
              Monto: `$${parseFloat(b.amount).toFixed(2)}`,
              Vencimiento: new Date(b.due_date).toLocaleDateString(),
              Interés: `$${(b.interest_amount || 0).toFixed(2)}`,
              Acciones: (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <DollarSign size={18} /> Pagar
                  </Button>
                </div>
              )
            }))}
            loading={loading}
          />
        </Card>
      )}

      {activeTab === 'delinquent' && (
        <Card>
          <h2 className="text-lg font-bold mb-4">Residentes Morosos</h2>
          <Table
            columns={['Unidad', 'Residente', 'Deuda Total', 'Facturas Vencidas', 'Email']}
            data={delinquent.map((d) => ({
              Unidad: d.unit_number,
              Residente: `${d.first_name} ${d.last_name}`,
              'Deuda Total': `$${parseFloat(d.total_debt).toFixed(2)}`,
              'Facturas Vencidas': d.pending_bills,
              Email: d.email || '-'
            }))}
            loading={loading}
          />
        </Card>
      )}
    </div>
  );
}
