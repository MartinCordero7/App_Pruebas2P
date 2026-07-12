import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, Button, Input, Select, Table, Alert } from '../components/UI';
import assembliesService from '../services/assembliesService';
import { validateForm } from '../utils/validation';

// Schema tabla asamblea:
//   id_condominio (NOT NULL FK), fecha (timestamp NOT NULL),
//   tipo ENUM(ORDINARIA|EXTRAORDINARIA) NOT NULL,
//   quorum_requerido numeric(5,2) nullable,
//   estado ENUM(PROGRAMADA|EN_CURSO|FINALIZADA|CANCELADA) DEFAULT PROGRAMADA
const DEFAULT_FORM = {
  condominioId: 1,
  fecha: '',
  tipo: 'ORDINARIA',
  quorumRequerido: '',
  estado: 'PROGRAMADA'
};

export function Assemblies() {
  const [assemblies, setAssemblies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadAssemblies();

    const interval = setInterval(() => loadAssemblies(), 15000);
    return () => clearInterval(interval);
  }, []);

  const loadAssemblies = async () => {
    try {
      setLoading(true);
      const response = await assembliesService.getAssemblies();
      const list = response?.data?.content || response?.content || (Array.isArray(response) ? response : []);
      setAssemblies(list);
    } catch (err) {
      setError('Error cargando asambleas');
    } finally {
      setLoading(false);
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
      fecha: { required: true },
      tipo: { required: true }
    };

    const errors = validateForm(formData, rules);

    if (formData.quorumRequerido !== '') {
      const q = parseFloat(formData.quorumRequerido);
      if (isNaN(q) || q < 0 || q > 100) {
        errors.quorumRequerido = 'El quórum debe estar entre 0 y 100';
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Payload plano según schema asamblea — camelCase para la API
    const payload = {
      condominioId: Number(formData.condominioId),
      fecha: formData.fecha,                          // ISO timestamp: YYYY-MM-DDTHH:mm
      tipo: formData.tipo,                            // ENUM: ORDINARIA | EXTRAORDINARIA
      quorumRequerido: formData.quorumRequerido !== '' ? parseFloat(formData.quorumRequerido) : null,
      estado: formData.estado                         // ENUM: PROGRAMADA | EN_CURSO | FINALIZADA | CANCELADA
    };

    try {
      await assembliesService.createAssembly(payload);
      setFormData(DEFAULT_FORM);
      setShowForm(false);
      setValidationErrors({});
      loadAssemblies();
    } catch (err) {
      const errData = err.response?.data;
      const msg = errData?.errors?.map(e => `${e.campo}: ${e.message}`).join(' | ')
        || errData?.message
        || 'Error creando asamblea';
      setError(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro?')) return;
    try {
      await assembliesService.deleteAssembly(id);
      loadAssemblies();
    } catch (err) {
      setError('Error eliminando asamblea');
    }
  };

  const getEstadoColor = (estado) => {
    const colors = {
      PROGRAMADA: 'bg-blue-100 text-blue-800',
      EN_CURSO: 'bg-yellow-100 text-yellow-800',
      FINALIZADA: 'bg-green-100 text-green-800',
      CANCELADA: 'bg-red-100 text-red-800'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  const programadas = assemblies.filter(a => a.estado === 'PROGRAMADA').length;
  const finalizadas = assemblies.filter(a => a.estado === 'FINALIZADA').length;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Asambleas</h1>
        <Button onClick={() => { setShowForm(!showForm); setFormData(DEFAULT_FORM); setValidationErrors({}); }}>
          <Plus size={20} className="mr-2" />
          Convocar Asamblea
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Estadísticas basadas en el campo estado del schema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-gray-600 text-sm">Total Asambleas</p>
          <p className="text-3xl font-bold">{assemblies.length}</p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm">Programadas</p>
          <p className="text-3xl font-bold text-blue-600">{programadas}</p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm">Finalizadas</p>
          <p className="text-3xl font-bold text-green-600">{finalizadas}</p>
        </Card>
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-lg font-bold mb-4">Convocar Asamblea</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Fecha y Hora"
                type="datetime-local"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                error={validationErrors.fecha}
                required
              />
              <Select
                label="Tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                error={validationErrors.tipo}
              >
                {/* ENUM exacto del schema */}
                <option value="ORDINARIA">Ordinaria</option>
                <option value="EXTRAORDINARIA">Extraordinaria</option>
              </Select>
              <Select
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
              >
                {/* ENUM exacto del schema */}
                <option value="PROGRAMADA">Programada</option>
                <option value="EN_CURSO">En Curso</option>
                <option value="FINALIZADA">Finalizada</option>
                <option value="CANCELADA">Cancelada</option>
              </Select>
              <Input
                label="Quórum Requerido (%) — opcional"
                type="number"
                name="quorumRequerido"
                value={formData.quorumRequerido}
                onChange={handleChange}
                error={validationErrors.quorumRequerido}
                min="0"
                max="100"
                step="0.01"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit">Convocar</Button>
              <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setValidationErrors({}); }}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-bold mb-4">Asambleas Convocadas</h2>
        <Table
          columns={['Tipo', 'Fecha', 'Estado', 'Quórum Req.', 'Acciones']}
          data={assemblies.map((a) => ({
            // Campos exactos de la respuesta API (camelCase del schema)
            Tipo: a.tipo || '-',
            Fecha: a.fecha ? new Date(a.fecha).toLocaleString() : '-',
            Estado: (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(a.estado)}`}>
                {a.estado || '-'}
              </span>
            ),
            'Quórum Req.': a.quorumRequerido != null ? `${a.quorumRequerido}%` : '-',
            Acciones: (
              <button
                className="text-red-600 hover:text-red-800"
                onClick={() => handleDelete(a.id)}
                title="Eliminar"
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
