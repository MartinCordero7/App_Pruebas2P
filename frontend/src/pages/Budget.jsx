import React, { useEffect, useState } from 'react';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { Card, Button, Input, Select, Table, Alert } from '../components/UI';
import budgetService from '../services/budgetService';
import { validateForm } from '../utils/validation';

export function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'servicios',
    year: new Date().getFullYear(),
    monthly_amount: '',
    description: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadBudgetData();
  }, []);

  const loadBudgetData = async () => {
    try {
      setLoading(true);
      const [overview, cuotas, pagos, multas] = await Promise.all([
        budgetService.getBudgetOverview(),
        budgetService.getCuotas(),
        budgetService.getPagos(),
        budgetService.getMultas()
      ]);

      const mappedBudgets = Array.isArray(overview?.categories)
        ? overview.categories
        : [
            {
              id: 'cuotas',
              category: 'Cuotas',
              monthly_amount: overview?.monthlyIncome || cuotas?.reduce?.((sum, item) => sum + (parseFloat(item.amount) || 0), 0) || 0,
              description: 'Ingresos por cuotas'
            },
            {
              id: 'pagos',
              category: 'Pagos',
              monthly_amount: pagos?.reduce?.((sum, item) => sum + (parseFloat(item.amount) || 0), 0) || 0,
              description: 'Pagos recibidos'
            },
            {
              id: 'multas',
              category: 'Multas',
              monthly_amount: multas?.reduce?.((sum, item) => sum + (parseFloat(item.amount) || 0), 0) || 0,
              description: 'Ingresos por multas'
            }
          ];

      setBudgets(mappedBudgets);
    } catch (err) {
      setError('Error cargando presupuesto');
    } finally {
      setLoading(false);
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
      category: { required: true },
      monthly_amount: { required: true, type: 'currency' }
    };

    const errors = validateForm(formData, rules);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setBudgets([...budgets, { ...formData, id: Date.now() }]);
    setFormData({
      category: 'servicios',
      year: new Date().getFullYear(),
      monthly_amount: '',
      description: ''
    });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setBudgets(budgets.filter(b => b.id !== id));
  };

  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.monthly_amount || 0), 0);
  const annualBudget = totalBudget * 12;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Presupuesto Operativo</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="mr-2" />
          Nueva Proyección
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-gray-600 text-sm">Presupuesto Mensual</p>
          <p className="text-3xl font-bold text-blue-600">${totalBudget.toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm">Presupuesto Anual</p>
          <p className="text-3xl font-bold text-green-600">${annualBudget.toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm">Categorías</p>
          <p className="text-3xl font-bold">{budgets.length}</p>
        </Card>
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-lg font-bold mb-4">Nueva Proyección</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Categoría"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="servicios">Servicios</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="seguridad">Seguridad</option>
                <option value="limpieza">Limpieza</option>
                <option value="administracion">Administración</option>
              </Select>
              <Select
                label="Año"
                name="year"
                value={formData.year}
                onChange={handleChange}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </Select>
              <Input
                label="Monto Mensual"
                type="number"
                name="monthly_amount"
                value={formData.monthly_amount}
                onChange={handleChange}
                error={validationErrors.monthly_amount}
                step="0.01"
                required
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
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp size={24} />
          Presupuestos por Categoría
        </h2>
        <Table
          columns={['Categoría', 'Mensual', 'Anual', 'Descripción', 'Acciones']}
          data={budgets.map((b) => ({
            Categoría: b.category,
            Mensual: `$${parseFloat(b.monthly_amount).toFixed(2)}`,
            Anual: `$${(parseFloat(b.monthly_amount) * 12).toFixed(2)}`,
            Descripción: b.description || '-',
            Acciones: (
              <button
                className="text-red-600 hover:text-red-800"
                onClick={() => handleDelete(b.id)}
              >
                <Trash2 size={18} />
              </button>
            )
          }))}
          loading={loading}
        />
      </Card>
    </div>
  );
}
