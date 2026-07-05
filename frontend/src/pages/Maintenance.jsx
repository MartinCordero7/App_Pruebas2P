import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, Button, Input, Select, Table, Alert } from '../components/UI';
import maintenanceService from '../services/maintenanceService';
import { validateForm } from '../utils/validation';

export function Maintenance() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'reparacion',
    priority: 'normal',
    unitId: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadRequests();
  }, [filterStatus]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const data = await maintenanceService.getRequests(params);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error cargando solicitudes de mantenimiento');
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
      title: { required: true, minLength: 5 },
      description: { required: true, minLength: 10 },
      type: { required: true },
      priority: { required: true }
    };

    const errors = validateForm(formData, rules);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await maintenanceService.createRequest(formData);
      setFormData({
        title: '',
        description: '',
        type: 'reparacion',
        priority: 'normal',
        unitId: ''
      });
      setShowForm(false);
      loadRequests();
    } catch (err) {
      setError(err.response?.data?.error || 'Error creando solicitud');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro?')) {
      try {
        await maintenanceService.updateStatus(id, 'cancelado');
        loadRequests();
      } catch (err) {
        setError('Error eliminando solicitud');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      abierto: 'bg-blue-100 text-blue-800',
      en_progreso: 'bg-yellow-100 text-yellow-800',
      completado: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgente: 'text-red-600 font-bold',
      alto: 'text-orange-600 font-bold',
      normal: 'text-blue-600',
      bajo: 'text-green-600'
    };
    return colors[priority] || '';
  };

  const openCount = requests.filter(r => r.status === 'abierto').length;
  const inProgressCount = requests.filter(r => r.status === 'en_progreso').length;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mantenimiento e Incidencias</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="mr-2" />
          Nuevo Ticket
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Abiertos</p>
              <p className="text-3xl font-bold text-blue-600">{openCount}</p>
            </div>
            <AlertCircle size={32} className="text-blue-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">En Progreso</p>
              <p className="text-3xl font-bold text-yellow-600">{inProgressCount}</p>
            </div>
            <Clock size={32} className="text-yellow-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Tickets</p>
              <p className="text-3xl font-bold">{requests.length}</p>
            </div>
            <CheckCircle size={32} className="text-green-600" />
          </div>
        </Card>
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-lg font-bold mb-4">Nueva Solicitud de Mantenimiento</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Título"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ej: Reparar grieta en pared"
                  error={validationErrors.title}
                  required
                />
              </div>
              <Select
                label="Tipo"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="reparacion">Reparación</option>
                <option value="preventivo">Preventivo</option>
                <option value="urgencia">Urgencia</option>
                <option value="limpieza">Limpieza</option>
              </Select>
              <Select
                label="Prioridad"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="bajo">Bajo</option>
                <option value="normal">Normal</option>
                <option value="alto">Alto</option>
                <option value="urgente">Urgente</option>
              </Select>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detalles del problema..."
                rows="4"
                className="w-full border rounded px-3 py-2"
              />
              {validationErrors.description && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.description}</p>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit">Crear</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filtros */}
      <Card className="mb-8">
        <div className="flex gap-2">
          {['all', 'abierto', 'en_progreso', 'completado'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded transition ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {status === 'all' ? 'Todos' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold mb-4">Tickets de Mantenimiento</h2>
        <Table
          columns={['Título', 'Tipo', 'Prioridad', 'Estado', 'Acciones']}
          data={requests.map((r) => ({
            Título: r.title,
            Tipo: r.type,
            Prioridad: <span className={getPriorityColor(r.priority)}>{r.priority}</span>,
            Estado: (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(r.status)}`}>
                {r.status.replace('_', ' ')}
              </span>
            ),
            Acciones: (
              <button
                className="text-red-600 hover:text-red-800"
                onClick={() => handleDelete(r.id)}
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
