import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import { Card, Button, Input, Select, Table, Alert } from '../components/UI';
import visitorsService from '../services/visitorsService';
import { validateForm } from '../utils/validation';

export function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    cedula: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadVisitors();
  }, []);

  const loadVisitors = async () => {
    try {
      setLoading(true);
      const data = await visitorsService.getVisitors();
      setVisitors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error cargando visitantes');
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
      nombre: { required: true, minLength: 2 },
      cedula: { required: true },
      telefono: { required: true }
    };

    const errors = validateForm(formData, rules);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await visitorsService.createVisitor(formData);
      loadVisitors();
    } catch (err) {
      setError(err.response?.data?.error || 'Error registrando visitante');
      return;
    }
    setFormData({
      nombre: '',
      telefono: '',
      cedula: ''
    });
    setShowForm(false);
  };

  const handleCheckOut = (id) => {
    visitorsService.checkOutVisitor(id).then(loadVisitors).catch(() => setError('Error registrando salida'));
  };

  const handleDelete = async (id) => {
    try {
      await visitorsService.deleteVisitor(id);
      loadVisitors();
    } catch (err) {
      setError('Error eliminando visitante');
    }
  };

  const activeVisitors = visitors.filter(v => !v.exit_time).length;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Registro de Visitantes</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="mr-2" />
          Registrar Visitante
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-gray-600 text-sm">Total Registrados</p>
          <p className="text-3xl font-bold">{visitors.length}</p>
        </Card>
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-lg font-bold mb-4">Registrar Visitante</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre del Visitante"
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
                required
              />
              <Input
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                error={validationErrors.telefono}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit">Registrar Entrada</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
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
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleDelete(v.id)}
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
