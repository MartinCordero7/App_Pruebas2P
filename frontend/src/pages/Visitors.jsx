import React, { useState } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import { Card, Button, Input, Select, Table, Alert } from '../components/UI';
import { validateForm } from '../utils/validation';

export function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    visitor_name: '',
    visitor_phone: '',
    unit_number: '',
    visit_purpose: 'visita',
    entry_time: new Date().toISOString().slice(0, 16)
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
      visitor_name: { required: true, minLength: 2 },
      unit_number: { required: true },
      visit_purpose: { required: true }
    };

    const errors = validateForm(formData, rules);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setVisitors([...visitors, { ...formData, id: Date.now() }]);
    setFormData({
      visitor_name: '',
      visitor_phone: '',
      unit_number: '',
      visit_purpose: 'visita',
      entry_time: new Date().toISOString().slice(0, 16)
    });
    setShowForm(false);
  };

  const handleCheckOut = (id) => {
    setVisitors(visitors.map(v =>
      v.id === id ? { ...v, exit_time: new Date().toISOString() } : v
    ));
  };

  const handleDelete = (id) => {
    setVisitors(visitors.filter(v => v.id !== id));
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
          <p className="text-gray-600 text-sm">Visitantes Activos</p>
          <p className="text-3xl font-bold text-blue-600">{activeVisitors}</p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm">Total Registrados</p>
          <p className="text-3xl font-bold">{visitors.length}</p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm">Registrados Hoy</p>
          <p className="text-3xl font-bold text-green-600">
            {visitors.filter(v => {
              const today = new Date().toDateString();
              return new Date(v.entry_time).toDateString() === today;
            }).length}
          </p>
        </Card>
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-lg font-bold mb-4">Registrar Visitante</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre del Visitante"
                name="visitor_name"
                value={formData.visitor_name}
                onChange={handleChange}
                error={validationErrors.visitor_name}
                required
              />
              <Input
                label="Teléfono"
                name="visitor_phone"
                value={formData.visitor_phone}
                onChange={handleChange}
              />
              <Input
                label="Unidad/Departamento"
                name="unit_number"
                value={formData.unit_number}
                onChange={handleChange}
                error={validationErrors.unit_number}
                required
              />
              <Select
                label="Propósito de Visita"
                name="visit_purpose"
                value={formData.visit_purpose}
                onChange={handleChange}
              >
                <option value="visita">Visita</option>
                <option value="entrega">Entrega de Paquete</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="servicio">Servicio Técnico</option>
                <option value="otro">Otro</option>
              </Select>
              <Input
                label="Hora de Entrada"
                type="datetime-local"
                name="entry_time"
                value={formData.entry_time}
                onChange={handleChange}
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
          columns={['Nombre', 'Unidad', 'Teléfono', 'Entrada', 'Salida', 'Estado', 'Acciones']}
          data={visitors.map((v) => ({
            Nombre: v.visitor_name,
            Unidad: v.unit_number,
            Teléfono: v.visitor_phone || '-',
            Entrada: new Date(v.entry_time).toLocaleString(),
            Salida: v.exit_time ? new Date(v.exit_time).toLocaleString() : '-',
            Estado: (
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit ${
                v.exit_time
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {!v.exit_time && <Clock size={14} />}
                {v.exit_time ? 'Salida Registrada' : 'En Edificio'}
              </span>
            ),
            Acciones: (
              <div className="flex gap-2">
                {!v.exit_time && (
                  <button
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                    onClick={() => handleCheckOut(v.id)}
                  >
                    Registrar Salida
                  </button>
                )}
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
