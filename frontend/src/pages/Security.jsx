import React, { useState } from 'react';
import { Plus, AlertTriangle, Trash2 } from 'lucide-react';
import { Card, Button, Input, Select, Table, Alert } from '../components/UI';
import { validateForm } from '../utils/validation';

export function Security() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    event_type: 'incidente',
    description: '',
    severity: 'bajo',
    location: '',
    guard_name: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

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
      event_type: { required: true },
      description: { required: true, minLength: 10 },
      severity: { required: true }
    };

    const errors = validateForm(formData, rules);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIncidents([...incidents, {
      ...formData,
      id: Date.now(),
      event_date: new Date().toISOString()
    }]);
    setFormData({
      event_type: 'incidente',
      description: '',
      severity: 'bajo',
      location: '',
      guard_name: ''
    });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setIncidents(incidents.filter(i => i.id !== id));
  };

  const criticalIncidents = incidents.filter(i => i.severity === 'critico').length;
  const highSeverity = incidents.filter(i => i.severity === 'alto').length;

  const getSeverityColor = (severity) => {
    const colors = {
      critico: 'bg-red-100 text-red-800',
      alto: 'bg-orange-100 text-orange-800',
      medio: 'bg-yellow-100 text-yellow-800',
      bajo: 'bg-blue-100 text-blue-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Seguridad y Control</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="mr-2" />
          Nuevo Incidente
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {criticalIncidents > 0 && (
        <Alert
          type="error"
          message={`⚠️ ${criticalIncidents} incidente(s) crítico(s) requiere(n) atención inmediata`}
        />
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <p className="text-gray-600 text-sm">Críticos</p>
          <p className="text-3xl font-bold text-red-600">{criticalIncidents}</p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm">Altos</p>
          <p className="text-3xl font-bold text-orange-600">{highSeverity}</p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm">Total Incidentes</p>
          <p className="text-3xl font-bold">{incidents.length}</p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm">Hoy</p>
          <p className="text-3xl font-bold text-blue-600">
            {incidents.filter(i => {
              const today = new Date().toDateString();
              return new Date(i.event_date).toDateString() === today;
            }).length}
          </p>
        </Card>
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-lg font-bold mb-4">Registrar Incidente</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tipo de Evento"
                name="event_type"
                value={formData.event_type}
                onChange={handleChange}
              >
                <option value="incidente">Incidente</option>
                <option value="alerta">Alerta</option>
                <option value="acceso_no_autorizado">Acceso No Autorizado</option>
                <option value="falsa_alarma">Falsa Alarma</option>
                <option value="otro">Otro</option>
              </Select>
              <Select
                label="Severidad"
                name="severity"
                value={formData.severity}
                onChange={handleChange}
              >
                <option value="bajo">Bajo</option>
                <option value="medio">Medio</option>
                <option value="alto">Alto</option>
                <option value="critico">Crítico</option>
              </Select>
              <Input
                label="Ubicación"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Piso, sección, etc."
              />
              <Input
                label="Guardia a Cargo"
                name="guard_name"
                value={formData.guard_name}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detalles del incidente..."
                rows="4"
                className="w-full border rounded px-3 py-2"
              />
              {validationErrors.description && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.description}</p>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit">Registrar</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-bold mb-4">Bitácora de Incidentes</h2>
        <Table
          columns={['Tipo', 'Severidad', 'Descripción', 'Ubicación', 'Guardia', 'Fecha/Hora', 'Acciones']}
          data={incidents.map((i) => ({
            Tipo: i.event_type.replace(/_/g, ' '),
            Severidad: (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(i.severity)}`}>
                {i.severity}
              </span>
            ),
            Descripción: i.description.substring(0, 40) + '...',
            Ubicación: i.location || '-',
            Guardia: i.guard_name || '-',
            'Fecha/Hora': new Date(i.event_date).toLocaleString(),
            Acciones: (
              <button
                className="text-red-600 hover:text-red-800"
                onClick={() => handleDelete(i.id)}
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
