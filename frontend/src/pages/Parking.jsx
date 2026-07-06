import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, Button, Input, Select, Table, Alert } from '../components/UI';
import parkingService from '../services/parkingService';
import unitsService from '../services/unitsService';
import residentsService from '../services/residentsService';

export function Parking() {
  const [parkingSpaces, setParkingSpaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [units, setUnits] = useState([]);
  const [residents, setResidents] = useState([]);
  const [formData, setFormData] = useState({
    spaceNumber: '',
    unitId: '',
    residentId: ''
  });

  useEffect(() => {
    loadParkingSpaces();
    loadUnits();
    loadResidents();
  }, []);

  const loadParkingSpaces = async () => {
    try {
      setLoading(true);
      const data = await parkingService.getParkingSpaces();
      setParkingSpaces(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error cargando parqueaderos');
    } finally {
      setLoading(false);
    }
  };

  const loadUnits = async () => {
    try {
      const data = await unitsService.getUnits({});
      setUnits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando unidades');
    }
  };

  const loadResidents = async () => {
    try {
      const data = await residentsService.getResidents({});
      setResidents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando residentes');
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

    if (!formData.spaceNumber) {
      setError('Número de espacio requerido');
      return;
    }

    try {
      await parkingService.assignParkingSpace(formData);
      setFormData({
        spaceNumber: '',
        unitId: '',
        residentId: ''
      });
      setShowForm(false);
      loadParkingSpaces();
    } catch (err) {
      setError(err.response?.data?.error || 'Error asignando parqueadero');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de desasignar este parqueadero?')) {
      try {
        await parkingService.deleteParkingSpace(id);
        loadParkingSpaces();
      } catch (err) {
        setError('Error eliminando asignación');
      }
    }
  };

  const availableSpaces = parkingSpaces.filter(p => p.status === 'disponible').length;
  const assignedSpaces = parkingSpaces.filter(p => p.status === 'asignado').length;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Parqueaderos</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="mr-2" />
          Asignar Parqueadero
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-gray-600 text-sm">Total Espacios</p>
          <p className="text-3xl font-bold">{parkingSpaces.length}</p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm">Asignados</p>
          <p className="text-3xl font-bold text-green-600">{assignedSpaces}</p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm">Disponibles</p>
          <p className="text-3xl font-bold text-blue-600">{availableSpaces}</p>
        </Card>
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-lg font-bold mb-4">Asignar Parqueadero</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Número de Espacio"
                name="spaceNumber"
                value={formData.spaceNumber}
                onChange={handleChange}
                placeholder="P-001"
                required
              />
              <Select
                label="Unidad (Opcional)"
                name="unitId"
                value={formData.unitId}
                onChange={handleChange}
              >
                <option value="">Seleccionar...</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.unit_number}
                  </option>
                ))}
              </Select>
              <Select
                label="Residente (Opcional)"
                name="residentId"
                value={formData.residentId}
                onChange={handleChange}
              >
                <option value="">Seleccionar...</option>
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.first_name} {r.last_name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit">Asignar</Button>
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
          columns={['Espacio', 'Unidad', 'Residente', 'Estado', 'Acciones']}
          data={parkingSpaces.map((p) => ({
            Espacio: p.space_number,
            Unidad: p.unit_number || '-',
            Residente: p.first_name ? `${p.first_name} ${p.last_name}` : '-',
            Estado: (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                p.status === 'asignado' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {p.status === 'asignado' ? 'Asignado' : 'Disponible'}
              </span>
            ),
            Acciones: p.status === 'asignado' ? (
              <button
                className="text-red-600 hover:text-red-800"
                onClick={() => handleDelete(p.id)}
              >
                Desasignar
              </button>
            ) : '-'
          }))}
          loading={loading}
        />
      </Card>
    </div>
  );
}
