import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, Button, Input, Select, Table, Alert } from '../components/UI';
import storageService from '../services/storageService';
import unitsService from '../services/unitsService';
import residentsService from '../services/residentsService';

export function Storage() {
  const [storageRooms, setStorageRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [units, setUnits] = useState([]);
  const [residents, setResidents] = useState([]);
  const [formData, setFormData] = useState({
    roomNumber: '',
    unitId: '',
    residentId: ''
  });

  useEffect(() => {
    loadStorageRooms();
    loadUnits();
    loadResidents();
  }, []);

  const loadStorageRooms = async () => {
    try {
      setLoading(true);
      const data = await storageService.getStorageRooms();
      setStorageRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error cargando bodegas');
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

    if (!formData.roomNumber) {
      setError('Número de bodega requerido');
      return;
    }

    try {
      await storageService.assignStorageRoom(formData);
      setFormData({
        roomNumber: '',
        unitId: '',
        residentId: ''
      });
      setShowForm(false);
      loadStorageRooms();
    } catch (err) {
      setError(err.response?.data?.error || 'Error asignando bodega');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de desasignar esta bodega?')) {
      try {
        // Aquí iría el DELETE cuando se implemente en el backend
        loadStorageRooms();
      } catch (err) {
        setError('Error eliminando asignación');
      }
    }
  };

  const availableRooms = storageRooms.filter(r => r.status === 'disponible').length;
  const assignedRooms = storageRooms.filter(r => r.status === 'asignado').length;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Bodegas</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="mr-2" />
          Asignar Bodega
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-gray-600 text-sm">Total Bodegas</p>
          <p className="text-3xl font-bold">{storageRooms.length}</p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm">Asignadas</p>
          <p className="text-3xl font-bold text-green-600">{assignedRooms}</p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm">Disponibles</p>
          <p className="text-3xl font-bold text-blue-600">{availableRooms}</p>
        </Card>
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-lg font-bold mb-4">Asignar Bodega</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Número de Bodega"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                placeholder="B-001"
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
        <h2 className="text-lg font-bold mb-4">Bodegas</h2>
        <Table
          columns={['Bodega', 'Unidad', 'Residente', 'Estado', 'Acciones']}
          data={storageRooms.map((r) => ({
            Bodega: r.room_number,
            Unidad: r.unit_number || '-',
            Residente: r.first_name ? `${r.first_name} ${r.last_name}` : '-',
            Estado: (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                r.status === 'asignado' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {r.status === 'asignado' ? 'Asignada' : 'Disponible'}
              </span>
            ),
            Acciones: r.status === 'asignado' ? (
              <button
                className="text-red-600 hover:text-red-800"
                onClick={() => handleDelete(r.id)}
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
