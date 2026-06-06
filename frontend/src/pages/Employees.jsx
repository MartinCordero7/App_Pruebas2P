import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Calendar } from 'lucide-react';
import { Card, Button, Input, Select, Table, Alert } from '../components/UI';
import api from '../services/api';
import { validateForm, validatePhone } from '../utils/validation';

export function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('employees');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: 'guardia',
    salary: '',
    hire_date: '',
    status: 'activo'
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employees');
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Error cargando empleados');
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
      first_name: { required: true, minLength: 2 },
      last_name: { required: true, minLength: 2 },
      email: { type: 'email' },
      phone: { type: 'phone' },
      position: { required: true },
      salary: { required: true, type: 'currency' },
      hire_date: { required: true }
    };

    const errors = validateForm(formData, rules);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await api.post('/employees', formData);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        position: 'guardia',
        salary: '',
        hire_date: '',
        status: 'activo'
      });
      setShowForm(false);
      loadEmployees();
    } catch (err) {
      setError(err.response?.data?.error || 'Error creando empleado');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro?')) {
      try {
        await api.delete(`/employees/${id}`);
        loadEmployees();
      } catch (err) {
        setError('Error eliminando empleado');
      }
    }
  };

  const activeCount = employees.filter(e => e.status === 'activo').length;
  const inactiveCount = employees.filter(e => e.status === 'inactivo').length;
  const totalSalaries = employees
    .filter(e => e.status === 'activo')
    .reduce((sum, e) => sum + (parseFloat(e.salary) || 0), 0);

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Personal</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="mr-2" />
          Contratar Empleado
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {['employees', 'payroll', 'shifts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab === 'employees' && '👤 Empleados'}
            {tab === 'payroll' && '💰 Nómina'}
            {tab === 'shifts' && '📅 Turnos'}
          </button>
        ))}
      </div>

      {activeTab === 'employees' && (
        <>
          {showForm && (
            <Card className="mb-8">
              <h2 className="text-lg font-bold mb-4">Contratar Empleado</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nombre"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    error={validationErrors.first_name}
                    required
                  />
                  <Input
                    label="Apellido"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    error={validationErrors.last_name}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={validationErrors.email}
                  />
                  <Input
                    label="Teléfono"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    error={validationErrors.phone}
                  />
                  <Select
                    label="Cargo"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                  >
                    <option value="guardia">Guardia</option>
                    <option value="conserje">Conserje</option>
                    <option value="limpieza">Limpieza</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="administrador">Administrador</option>
                  </Select>
                  <Input
                    label="Salario"
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    error={validationErrors.salary}
                    step="0.01"
                    required
                  />
                  <Input
                    label="Fecha de Contratación"
                    type="date"
                    name="hire_date"
                    value={formData.hire_date}
                    onChange={handleChange}
                    error={validationErrors.hire_date}
                    required
                  />
                  <Select
                    label="Estado"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="licencia">Licencia</option>
                  </Select>
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

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <p className="text-gray-600 text-sm">Empleados Activos</p>
              <p className="text-3xl font-bold text-green-600">{activeCount}</p>
            </Card>
            <Card>
              <p className="text-gray-600 text-sm">Total de Empleados</p>
              <p className="text-3xl font-bold">{employees.length}</p>
            </Card>
            <Card>
              <p className="text-gray-600 text-sm">Nómina Mensual</p>
              <p className="text-3xl font-bold text-blue-600">${totalSalaries.toFixed(2)}</p>
            </Card>
          </div>

          <Card>
            <h2 className="text-lg font-bold mb-4">Personal</h2>
            <Table
              columns={['Nombre', 'Cargo', 'Email', 'Teléfono', 'Salario', 'Estado', 'Acciones']}
              data={employees.map((e) => ({
                Nombre: `${e.first_name} ${e.last_name}`,
                Cargo: e.position,
                Email: e.email || '-',
                Teléfono: e.phone || '-',
                Salario: `$${parseFloat(e.salary).toFixed(2)}`,
                Estado: (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    e.status === 'activo'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {e.status}
                  </span>
                ),
                Acciones: (
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Edit2 size={18} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(e.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )
              }))}
              loading={loading}
            />
          </Card>
        </>
      )}

      {activeTab === 'payroll' && (
        <Card>
          <h2 className="text-lg font-bold mb-4">Nómina Mensual</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">Empleado</th>
                  <th className="border p-3 text-right">Salario Base</th>
                  <th className="border p-3 text-right">Descuentos</th>
                  <th className="border p-3 text-right">Neto</th>
                  <th className="border p-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="border p-3">{e.first_name} {e.last_name}</td>
                    <td className="border p-3 text-right">${parseFloat(e.salary).toFixed(2)}</td>
                    <td className="border p-3 text-right">$0.00</td>
                    <td className="border p-3 text-right font-bold">${parseFloat(e.salary).toFixed(2)}</td>
                    <td className="border p-3">
                      <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        Pagado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'shifts' && (
        <Card>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar size={24} />
            Asignación de Turnos
          </h2>
          <p className="text-gray-600 text-center py-8">
            Módulo de turnos en desarrollo. Permite asignar turnos diarios a los empleados.
          </p>
        </Card>
      )}
    </div>
  );
}
