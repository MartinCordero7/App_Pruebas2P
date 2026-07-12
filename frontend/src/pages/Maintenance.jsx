import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, Button, Input, Select, Table, Alert } from '../components/UI';
import maintenanceService from '../services/maintenanceService';
import unitsService from '../services/unitsService';
import residentsService from '../services/residentsService';
import { validateForm } from '../utils/validation';

// Según schema: ticket NOT NULL: id_persona, id_unidad, titulo, descripcion, prioridad (enum: BAJA|MEDIA|ALTA|URGENTE)
// categoriaId y estadoActualId son opcionales (nullable en schema)
const DEFAULT_FORM = {
  personaId: '',
  unidadId: '',
  categoriaId: '',
  titulo: '',
  descripcion: '',
  prioridad: 'MEDIA',
  estadoActualId: 1
};

export function Maintenance() {
  const [requests, setRequests] = useState([]);
  const [units, setUnits] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadRequests();
    loadUnits();
    loadResidents();

    const interval = setInterval(() => loadRequests(), 15000);
    return () => clearInterval(interval);
  }, [filterStatus]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const response = await maintenanceService.getRequests(params);
      const list = response?.data?.content || response?.content || (Array.isArray(response) ? response : []);
      setRequests(list);
    } catch (err) {
      setError('Error cargando solicitudes de mantenimiento');
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

  const loadResidents = async () => {
    try {
      const response = await residentsService.getResidents({});
      const list = response?.data?.content || response?.content || (Array.isArray(response) ? response : []);
      setResidents(list);
    } catch (err) {
      console.error('Error cargando residentes');
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
      personaId: { required: true },
      unidadId: { required: true },
      titulo: { required: true, minLength: 5 },
      descripcion: { required: true, minLength: 10 },
      prioridad: { required: true }
    };

    const errors = validateForm(formData, rules);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Payload plano según API_CONTRACT.md y schema
    const payload = {
      personaId: Number(formData.personaId),
      unidadId: Number(formData.unidadId),
      categoriaId: formData.categoriaId ? Number(formData.categoriaId) : null,
      estadoActualId: Number(formData.estadoActualId),
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      prioridad: formData.prioridad  // ENUM: BAJA | MEDIA | ALTA | URGENTE
    };

    try {
      await maintenanceService.createRequest(payload);
      setFormData(DEFAULT_FORM);
      setShowForm(false);
      loadRequests();
    } catch (err) {
      const errData = err.response?.data;
      const msg = errData?.errors?.map(e => `${e.campo}: ${e.message}`).join(' | ')
        || errData?.message
        || 'Error creando solicitud';
      setError(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este ticket?')) return;
    try {
      await maintenanceService.updateRequest(id, { estadoActualId: 3 }); // marcar como cancelado
      loadRequests();
    } catch (err) {
      setError('Error actualizando ticket');
    }
  };

  const getStatusColor = (estado) => {
    const colors = {
      ABIERTO: 'bg-blue-100 text-blue-800',
      EN_PROGRESO: 'bg-yellow-100 text-yellow-800',
      RESUELTO: 'bg-green-100 text-green-800',
      CERRADO: 'bg-gray-100 text-gray-800',
      CANCELADO: 'bg-red-100 text-red-800'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      URGENTE: 'text-red-600 font-bold',
      ALTA: 'text-orange-600 font-bold',
      MEDIA: 'text-blue-600',
      BAJA: 'text-green-600'
    };
    return colors[priority] || '';
  };

  const openCount = requests.filter(r => r.estado === 'ABIERTO').length;
  const inProgressCount = requests.filter(r => r.estado === 'EN_PROGRESO').length;

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
              <Select
                label="Residente solicitante"
                name="personaId"
                value={formData.personaId}
                onChange={handleChange}
                error={validationErrors.personaId}
                required
              >
                <option value="">Seleccionar residente...</option>
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombres} {r.apellidos}
                  </option>
                ))}
              </Select>
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
                  <option key={u.id} value={u.id}>{u.numero}</option>
                ))}
              </Select>
              <Input
                label="Título"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Ej: Reparar grieta en pared"
                error={validationErrors.titulo}
                required
              />
              <Select
                label="Categoría"
                name="categoriaId"
                value={formData.categoriaId}
                onChange={handleChange}
              >
                <option value="">Sin categoría</option>
                <option value="1">Reparación</option>
                <option value="2">Preventivo</option>
                <option value="3">Urgencia</option>
                <option value="4">Limpieza</option>
              </Select>
              <Select
                label="Prioridad"
                name="prioridad"
                value={formData.prioridad}
                onChange={handleChange}
              >
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente</option>
              </Select>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Descripción *</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Detalles del problema..."
                rows="4"
                className="w-full border rounded px-3 py-2"
              />
              {validationErrors.descripcion && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.descripcion}</p>
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
          {['all', 'ABIERTO', 'EN_PROGRESO', 'RESUELTO', 'CERRADO'].map((status) => (
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
          columns={['Título', 'Residente', 'Unidad', 'Prioridad', 'Estado', 'Acciones']}
          data={requests.map((r) => ({
            Título: r.titulo,
            Residente: r.creadoPor || '-',
            Unidad: r.unidadNombre || '-',
            Prioridad: <span className={getPriorityColor(r.prioridad)}>{r.prioridad}</span>,
            Estado: (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(r.estado)}`}>
                {r.estado ? r.estado.replace('_', ' ') : '-'}
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
