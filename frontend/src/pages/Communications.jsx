import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Send } from 'lucide-react';
import { Card, Button, Input, Select, Table, Alert } from '../components/UI';
import communicationsService from '../services/communicationsService';
import visitorsService from '../services/visitorsService';
import { validateForm } from '../utils/validation';

// Según schema comunicado: titulo NOT NULL, mensaje NOT NULL, id_autor NOT NULL,
// destinatario_tipo ENUM(TODOS|TORRE|UNIDAD|ROL) NOT NULL
// API_CONTRACT.md: { titulo, mensaje, autorId, destinatarioTipo, destinatarioId }
const DEFAULT_FORM = {
  titulo: '',
  mensaje: '',
  autorId: 1,
  destinatarioTipo: 'TODOS',
  destinatarioId: null
};

export function Communications() {
  const [communications, setCommunications] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [securityLog, setSecurityLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('communications');
  const [formData, setFormData] = useState(DEFAULT_FORM);
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
      const response = await communicationsService.getCommunications();
      const list = response?.data?.content || response?.content || (Array.isArray(response) ? response : []);
      setCommunications(list);
    } catch (err) {
      setError('Error cargando comunicados');
    } finally {
      setLoading(false);
    }
  };

  const loadVisitors = async () => {
    try {
      setLoading(true);
      const response = await visitorsService.getVisitors();
      const list = response?.data?.content || response?.content || (Array.isArray(response) ? response : []);
      setVisitors(list);
    } catch (err) {
      setError('Error cargando visitantes');
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityLog = async () => {
    try {
      setLoading(true);
      const response = await communicationsService.getSecurityLog();
      // accesos: { data: { content: [...] } }
      const list = response?.data?.content || response?.content || (Array.isArray(response) ? response : []);
      setSecurityLog(list);
    } catch (err) {
      setError('Error cargando bitácora');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'destinatarioId' ? (value ? Number(value) : null) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    const rules = {
      titulo: { required: true, minLength: 5 },
      mensaje: { required: true, minLength: 10 }
    };

    const errors = validateForm(formData, rules);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Payload plano según API_CONTRACT.md
    const payload = {
      titulo: formData.titulo,
      mensaje: formData.mensaje,
      autorId: Number(formData.autorId),
      destinatarioTipo: formData.destinatarioTipo,  // ENUM: TODOS | TORRE | UNIDAD | ROL
      destinatarioId: formData.destinatarioId ? Number(formData.destinatarioId) : null
    };

    try {
      await communicationsService.createCommunication(payload);
      setFormData(DEFAULT_FORM);
      setShowForm(false);
      loadCommunications();
    } catch (err) {
      const errData = err.response?.data;
      const msg = errData?.errors?.map(e => `${e.campo}: ${e.message}`).join(' | ')
        || errData?.message
        || 'Error enviando comunicado';
      setError(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro?')) return;
    try {
      await communicationsService.deleteCommunication(id);
      loadCommunications();
    } catch (err) {
      setError('Error eliminando comunicado');
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
            {tab === 'security' && '🔒 Accesos'}
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
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    placeholder="Asunto del comunicado"
                    error={validationErrors.titulo}
                    required
                  />
                  <Select
                    label="Tipo de Destinatario"
                    name="destinatarioTipo"
                    value={formData.destinatarioTipo}
                    onChange={handleChange}
                  >
                    {/* ENUM exacto del schema: TODOS | TORRE | UNIDAD | ROL */}
                    <option value="TODOS">Todos</option>
                    <option value="TORRE">Torre específica</option>
                    <option value="UNIDAD">Unidad específica</option>
                    <option value="ROL">Por Rol</option>
                  </Select>
                  <div>
                    <label className="block text-sm font-medium mb-2">Mensaje *</label>
                    <textarea
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      placeholder="Contenido del comunicado..."
                      rows="6"
                      className="w-full border rounded px-3 py-2"
                    />
                    {validationErrors.mensaje && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.mensaje}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button type="submit">
                    <Send size={18} className="mr-2" />
                    Enviar
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
              columns={['Título', 'Destinatario', 'Fecha', 'Autor', 'Acciones']}
              data={communications.map((c) => ({
                Título: c.titulo,
                Destinatario: c.destinatarioTipo,
                Fecha: c.fecha ? new Date(c.fecha).toLocaleDateString() : '-',
                Autor: c.autorNombres ? `${c.autorNombres} ${c.autorApellidos || ''}`.trim() : '-',
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
          <h2 className="text-lg font-bold mb-4">Visitantes Registrados</h2>
          <Table
            columns={['Nombre', 'Cédula', 'Teléfono']}
            data={visitors.map((v) => ({
              Nombre: v.nombre,
              Cédula: v.cedula || '-',
              Teléfono: v.telefono || '-'
            }))}
            loading={loading}
          />
        </Card>
      )}

      {activeTab === 'security' && (
        <Card>
          <h2 className="text-lg font-bold mb-4">Bitácora de Accesos</h2>
          <Table
            columns={['Visitante', 'Unidad', 'Hora Ingreso', 'Hora Salida', 'Estado']}
            data={securityLog.map((s) => ({
              Visitante: s.visitanteNombre || s.nombre || '-',
              Unidad: s.unidadNombre || s.unidadNumero || '-',
              'Hora Ingreso': s.horaIngreso ? new Date(s.horaIngreso).toLocaleString() : '-',
              'Hora Salida': s.horaSalida ? new Date(s.horaSalida).toLocaleString() : 'Sin salida',
              Estado: s.estadoNombre || '-'
            }))}
            loading={loading}
          />
        </Card>
      )}
    </div>
  );
}
