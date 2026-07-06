import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Send, Users } from 'lucide-react';
import { Card, Button, Input, Select, Table, Alert } from '../components/UI';
import communicationsService from '../services/communicationsService';
import { validateForm, validateRequired } from '../utils/validation';

export function Communications() {
  const [communications, setCommunications] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [securityLog, setSecurityLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('communications');
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    status: 'borrador'
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (activeTab === 'communications') {
      loadCommunications();
    } else if (activeTab === 'visitors') {
      loadVisitors();
    } else {
      loadSecurityLog();
    }
  }, [activeTab]);

  const loadCommunications = async () => {
    try {
      setLoading(true);
      const data = await communicationsService.getCommunications();
      setCommunications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error cargando comunicados');
    } finally {
      setLoading(false);
    }
  };

  const loadVisitors = async () => {
    try {
      setLoading(true);
      const data = await communicationsService.getVisitors();
      setVisitors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error cargando visitantes');
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityLog = async () => {
    try {
      setLoading(true);
      const data = await communicationsService.getSecurityLog();
      setSecurityLog(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error cargando bitácora');
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
      message: { required: true, minLength: 10 }
    };

    const errors = validateForm(formData, rules);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      if (formData.status === 'publicado') {
        await communicationsService.publishCommunication(formData);
      } else {
        await communicationsService.createCommunication(formData);
      }
      setFormData({
        title: '',
        message: '',
        type: 'general',
        status: 'borrador'
      });
      setShowForm(false);
      loadCommunications();
    } catch (err) {
      setError(err.response?.data?.error || 'Error enviando comunicado');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro?')) {
      try {
        await communicationsService.deleteCommunication(id);
        loadCommunications();
      } catch (err) {
        setError('Error eliminando comunicado');
      }
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Comunicación Interna</h1>
        {activeTab === 'communications' && (
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus size={20} className="mr-2" />
            Nuevo Comunicado
          </Button>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {['communications', 'visitors', 'security'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab === 'communications' && '📢 Comunicados'}
            {tab === 'visitors' && '👥 Visitantes'}
            {tab === 'security' && '🔒 Seguridad'}
          </button>
        ))}
      </div>

      {activeTab === 'communications' && (
        <>
          {showForm && (
            <Card className="mb-8">
              <h2 className="text-lg font-bold mb-4">Nuevo Comunicado</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <Input
                    label="Título"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Asunto del comunicado"
                    error={validationErrors.title}
                    required
                  />
                  <Select
                    label="Tipo"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="general">General</option>
                    <option value="deuda">Notificación de Deuda</option>
                    <option value="asamblea">Convocatoria a Asamblea</option>
                    <option value="circula">Circular</option>
                    <option value="urgente">Urgente</option>
                  </Select>
                  <div>
                    <label className="block text-sm font-medium mb-2">Mensaje</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Contenido del comunicado..."
                      rows="6"
                      className="w-full border rounded px-3 py-2"
                    />
                    {validationErrors.message && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.message}</p>
                    )}
                  </div>
                  <Select
                    label="Enviar como"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="borrador">Borrador</option>
                    <option value="publicado">Publicar Ahora</option>
                  </Select>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button type="submit">
                    <Send size={18} className="mr-2" />
                    {formData.status === 'publicado' ? 'Publicar' : 'Guardar'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <Card>
            <h2 className="text-lg font-bold mb-4">Comunicados</h2>
            <Table
              columns={['Título', 'Tipo', 'Fecha', 'Estado', 'Acciones']}
              data={communications.map((c) => ({
                Título: c.title,
                Tipo: c.type,
                Fecha: new Date(c.created_at).toLocaleDateString(),
                Estado: (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    c.status === 'publicado'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {c.status}
                  </span>
                ),
                Acciones: (
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleDelete(c.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                )
              }))}
              loading={loading}
            />
          </Card>
        </>
      )}

      {activeTab === 'visitors' && (
        <Card>
          <h2 className="text-lg font-bold mb-4">Registro de Visitantes</h2>
          <Table
            columns={['Nombre', 'Email', 'Teléfono', 'Unidad', 'Fecha Entrada', 'Hora Salida']}
            data={visitors.map((v) => ({
              Nombre: v.visitor_name,
              Email: v.visitor_email || '-',
              Teléfono: v.visitor_phone || '-',
              Unidad: v.unit_number || '-',
              'Fecha Entrada': new Date(v.entry_time).toLocaleDateString(),
              'Hora Salida': v.exit_time ? new Date(v.exit_time).toLocaleTimeString() : 'Sin salida'
            }))}
            loading={loading}
          />
        </Card>
      )}

      {activeTab === 'security' && (
        <Card>
          <h2 className="text-lg font-bold mb-4">Bitácora de Seguridad</h2>
          <Table
            columns={['Tipo', 'Descripción', 'Fecha y Hora', 'Guardia']}
            data={securityLog.map((s) => ({
              Tipo: s.event_type,
              Descripción: s.description,
              'Fecha y Hora': new Date(s.event_date).toLocaleString(),
              Guardia: s.guard_name || '-'
            }))}
            loading={loading}
          />
        </Card>
      )}
    </div>
  );
}
