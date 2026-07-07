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
    condominioId: 1,
    torreId: 1,
    estadoId: 1,
    numero: '',
    piso: '',
    tipo: 'DEPARTAMENTO',
    alicuota: ''
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
      numero: { required: true },
      alicuota: { required: true, type: 'currency' }
    };

    const errors = validateForm(formData, rules);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await unitsService.createUnit(formData);
      setFormData({
        condominioId: 1,
        torreId: 1,
        estadoId: 1,
        numero: '',
        piso: '',
        tipo: 'DEPARTAMENTO',
        alicuota: ''
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
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                error={validationErrors.numero}
                required
              />
              <Select
                label="Tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
              >
                <option value="DEPARTAMENTO">Departamento</option>
                <option value="CASA">Casa</option>
                <option value="LOCAL">Local</option>
                <option value="OFICINA">Oficina</option>
              </Select>
              <Input
                label="Piso"
                name="piso"
                value={formData.piso}
                onChange={handleChange}
              />
              <Input
                label="Alícuota"
                type="number"
                name="alicuota"
                value={formData.alicuota}
                onChange={handleChange}
                error={validationErrors.alicuota}
                step="0.0001"
                required
              />
              <Select
                label="Estado"
                name="estadoId"
                value={formData.estadoId}
                onChange={handleChange}
              >
                <option value="1">Habitado</option>
                <option value="2">Deshabitado</option>
                <option value="3">Alquilado</option>
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
          columns={['Unidad', 'Tipo', 'Piso', 'Alícuota', 'Estado', 'Acciones']}
          data={units.map((u) => ({
            Unidad: u.numero,
            Tipo: u.tipo,
            Piso: u.piso || '-',
            Alícuota: u.alicuota ? (u.alicuota * 100).toFixed(2) + '%' : '-',
            Estado: u.estadoNombre,
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
