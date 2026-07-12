import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card, Button, Input, Table, Alert } from '../components/UI';
import visitorsService from '../services/visitorsService';
import { validateForm } from '../utils/validation';

// Según schema: visitante(nombre NOT NULL, cedula nullable, telefono nullable)
// API_CONTRACT.md: { nombre, cedula, telefono }
const DEFAULT_FORM = {
  nombre: '',
  cedula: '',
  telefono: ''
};

export function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadVisitors();

    const interval = setInterval(() => loadVisitors(), 15000);
    return () => clearInterval(interval);
  }, []);

  const loadVisitors = async () => {
    try {
      setLoading(true);
      const response = await visitorsService.getVisitors();
      // Desempaquetar wrapper: { data: { content: [...] } }
      const list = response?.data?.content || response?.content || (Array.isArray(response) ? response : []);
      setVisitors(list);
    } catch (err) {
      setError('Error cargando visitantes');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (visitor) => {
    setFormData({
      nombre: visitor.nombre || '',
      cedula: visitor.cedula || '',
      telefono: visitor.telefono || ''
    });
    setEditingId(visitor.id);
    setShowForm(true);
    setValidationErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    const rules = {
      nombre: { required: true, minLength: 2 }
    };

    const errors = validateForm(formData, rules);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Payload plano según API_CONTRACT.md
    const payload = {
      nombre: formData.nombre,
      cedula: formData.cedula || null,
      telefono: formData.telefono || null
    };

    try {
      if (editingId) {
        await visitorsService.updateVisitor(editingId, payload);
      } else {
        await visitorsService.createVisitor(payload);
      }
      setFormData(DEFAULT_FORM);
      setShowForm(false);
      setEditingId(null);
      setValidationErrors({});
      loadVisitors();
    } catch (err) {
      const errData = err.response?.data;
      const msg = errData?.errors?.map(e => `${e.campo}: ${e.message}`).join(' | ')
        || errData?.message
        || 'Error registrando visitante';
      setError(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este visitante?')) return;
    try {
      await visitorsService.deleteVisitor(id);
      loadVisitors();
    } catch (err) {
      setError('Error eliminando visitante');
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Registro de Visitantes</h1>
        <Button onClick={() => {
          setShowForm(!showForm);
          setEditingId(null);
          setFormData(DEFAULT_FORM);
          setValidationErrors({});
        }}>
          <Plus size={20} className="mr-2" />
          Registrar Visitante
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <p className="text-gray-600 text-sm">Total Registrados</p>
          <p className="text-3xl font-bold">{visitors.length}</p>
        </Card>
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-lg font-bold mb-4">{editingId ? 'Editar Visitante' : 'Registrar Visitante'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre completo"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={validationErrors.nombre}
                required
              />
              <Input
                label="Cédula"
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                error={validationErrors.cedula}
              />
              <Input
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit">{editingId ? 'Actualizar' : 'Registrar Entrada'}</Button>
              <Button type="button" variant="secondary" onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setValidationErrors({});
              }}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-bold mb-4">Visitantes</h2>
        <Table
          columns={['Nombre', 'Cédula', 'Teléfono', 'Acciones']}
          data={visitors.map((v) => ({
            Nombre: v.nombre,
            Cédula: v.cedula || '-',
            Teléfono: v.telefono || '-',
            Acciones: (
              <div className="flex gap-2">
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => handleEdit(v)}
                  title="Editar"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleDelete(v.id)}
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )
          }))}
          loading={loading}
        />
      </Card>
    </div>
  );
}
