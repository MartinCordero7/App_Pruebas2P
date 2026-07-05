import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card, Button, Input, Select, Table, Alert } from '../components/UI';
import unitsService from '../services/unitsService';
import residentsService from '../services/residentsService';
import { validateForm } from '../utils/validation';

export function Units() {
  const [units, setUnits] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    unitNumber: '',
    unitType: 'departamento',
    floor: '',
    area: '',
    aliquot: '',
    status: 'ocupado',
    ownerId: ''
  });

  useEffect(() => {
    loadUnits();
    loadResidents();
  }, []);

  const loadUnits = async () => {
    try {
      setLoading(true);
      const data = await unitsService.getUnits({});
      setUnits(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error cargando unidades');
    } finally {
      setLoading(false);
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
    setValidationErrors({});

    const rules = {
      unitNumber: { required: true },
      aliquot: { required: true, type: 'currency' },
      area: { type: 'currency' }
    };

    const errors = validateForm(formData, rules);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await unitsService.createUnit(formData);
      setFormData({
        unitNumber: '',
        unitType: 'departamento',
        floor: '',
        area: '',
        aliquot: '',
        status: 'ocupado',
        ownerId: ''
      });
      setValidationErrors({});
      setShowForm(false);
      loadUnits();
    } catch (err) {
      setError(err.response?.data?.error || 'Error creando unidad');
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Unidades</h1>
        <Button onClick={() => { setShowForm(!showForm); setValidationErrors({}); }}>
          <Plus size={20} className="mr-2" />
          Nueva Unidad
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-lg font-bold mb-4">Crear Unidad</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Número de Unidad"
                name="unitNumber"
                value={formData.unitNumber}
                onChange={handleChange}
                error={validationErrors.unitNumber}
                required
              />
              <Select
                label="Tipo"
                name="unitType"
                value={formData.unitType}
                onChange={handleChange}
              >
                <option value="departamento">Departamento</option>
                <option value="casa">Casa</option>
                <option value="local">Local</option>
                <option value="oficina">Oficina</option>
              </Select>
              <Input
                label="Piso"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
              />
              <Input
                label="Área (m²)"
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                error={validationErrors.area}
                step="0.01"
              />
              <Input
                label="Alícuota"
                type="number"
                name="aliquot"
                value={formData.aliquot}
                onChange={handleChange}
                error={validationErrors.aliquot}
                step="0.0001"
                required
              />
              <Select
                label="Propietario"
                name="ownerId"
                value={formData.ownerId}
                onChange={handleChange}
              >
                <option value="">Seleccionar...</option>
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.first_name} {r.last_name}
                  </option>
                ))}
              </Select>
              <Select
                label="Estado"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="ocupado">Ocupado</option>
                <option value="vacio">Vacío</option>
                <option value="alquilado">Alquilado</option>
              </Select>
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit">Guardar</Button>
              <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setValidationErrors({}); }}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <Table
          columns={['Unidad', 'Tipo', 'Piso', 'Área', 'Alícuota', 'Estado', 'Propietario', 'Acciones']}
          data={units.map((u) => ({
            Unidad: u.unit_number,
            Tipo: u.unit_type,
            Piso: u.floor || '-',
            Área: u.area ? `${u.area} m²` : '-',
            Alícuota: (u.aliquot * 100).toFixed(2) + '%',
            Estado: u.status,
            Propietario: u.first_name ? `${u.first_name} ${u.last_name}` : '-',
            Acciones: (
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-800">
                  <Edit2 size={18} />
                </button>
                <button className="text-red-600 hover:text-red-800">
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
