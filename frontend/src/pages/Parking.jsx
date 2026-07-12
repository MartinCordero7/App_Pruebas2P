import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, Button, Input, Select, Table, Alert } from '../components/UI';
import parkingService from '../services/parkingService';
import unitsService from '../services/unitsService';

// Schema: parqueadero(id_unidad NOT NULL, numero NOT NULL, estado ENUM DISPONIBLE|OCUPADO)
const DEFAULT_FORM = {
  unidadId: '',
  numero: '',
  estado: 'DISPONIBLE'
};

export function Parking() {
  const [parkingSpaces, setParkingSpaces] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  useEffect(() => {
    loadParkingSpaces();
    loadUnits();

    const interval = setInterval(() => loadParkingSpaces(), 15000);
    return () => clearInterval(interval);
  }, []);

  const loadParkingSpaces = async () => {
    try {
      setLoading(true);
      const response = await parkingService.getParkingSpaces();
      const list = response?.data?.content || response?.content || (Array.isArray(response) ? response : []);
      setParkingSpaces(list);
    } catch (err) {
      setError('Error cargando parqueaderos');
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.numero || !formData.unidadId) {
      setError('Número de parqueadero y unidad son requeridos');
      return;
    }

    // Payload según schema: parqueadero(id_unidad, numero, estado)
    const payload = {
      unidadId: Number(formData.unidadId),
      numero: formData.numero,
      estado: formData.estado   // ENUM: DISPONIBLE | OCUPADO
    };

    try {
      await parkingService.assignParkingSpace(payload);
      setFormData(DEFAULT_FORM);
      setShowForm(false);
      loadParkingSpaces();
    } catch (err) {
      const errData = err.response?.data;
      const msg = errData?.errors?.map(e => `${e.campo}: ${e.message}`).join(' | ')
        || errData?.message
        || 'Error registrando parqueadero';
      setError(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este parqueadero?')) return;
    try {
      await parkingService.deleteParkingSpace(id);
      loadParkingSpaces();
    } catch (err) {
      setError('Error eliminando parqueadero');
    }
  };

  const disponibles = parkingSpaces.filter(p => p.estado === 'DISPONIBLE').length;
  const ocupados = parkingSpaces.filter(p => p.estado === 'OCUPADO').length;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Parqueaderos</h1>
        <Button onClick={() => { setShowForm(!showForm); setFormData(DEFAULT_FORM); }}>
          <Plus size={20} className="mr-2" />
          Nuevo Parqueadero
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-gray-600 text-sm">Total</p>
          <p className="text-3xl font-bold">{parkingSpaces.length}</p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm">Ocupados</p>
          <p className="text-3xl font-bold text-red-600">{ocupados}</p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm">Disponibles</p>
          <p className="text-3xl font-bold text-green-600">{disponibles}</p>
        </Card>
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-lg font-bold mb-4">Registrar Parqueadero</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Número de Parqueadero"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                placeholder="P-001"
                required
              />
              <Select
                label="Unidad asignada"
                name="unidadId"
                value={formData.unidadId}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar unidad...</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.numero}</option>
                ))}
              </Select>
              <Select
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
              >
                {/* ENUM exacto del schema */}
                <option value="DISPONIBLE">Disponible</option>
                <option value="OCUPADO">Ocupado</option>
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

      <Card>
        <h2 className="text-lg font-bold mb-4">Parqueaderos</h2>
        <Table
          columns={['Número', 'Unidad', 'Estado', 'Acciones']}
          data={parkingSpaces.map((p) => ({
            Número: p.numero,
            Unidad: p.unidadNumero || p.numero || '-',
            Estado: (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                p.estado === 'OCUPADO' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {p.estado}
              </span>
            ),
            Acciones: (
              <button
                className="text-red-600 hover:text-red-800"
                onClick={() => handleDelete(p.id)}
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
