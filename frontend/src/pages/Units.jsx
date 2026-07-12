import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card, Button, Input, Select, Table, Alert } from '../components/UI';
import unitsService from '../services/unitsService';
import residentsService from '../services/residentsService';
import { validateForm } from '../utils/validation';

const DEFAULT_FORM = {
  condominioId: 1,
  torreId: '',
  estadoId: 1,
  numero: '',
  piso: '',
  tipo: 'DEPARTAMENTO',
  alicuota: ''
};

export function Units() {
  const [units, setUnits] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState(DEFAULT_FORM);

  useEffect(() => {
    loadUnits();
    loadResidents();

    const interval = setInterval(() => loadUnits(), 15000);
    return () => clearInterval(interval);
  }, []);

  const loadUnits = async () => {
    try {
      setLoading(true);
      const response = await unitsService.getUnits({});
      // Desempaquetar wrapper estándar: { data: { content: [...] } }
      const list = response?.data?.content || response?.content || (Array.isArray(response) ? response : []);
      setUnits(list);
    } catch (err) {
      setError('Error cargando unidades');
    } finally {
      setLoading(false);
    }
  };

  const loadResidents = async () => {
    try {
      const response = await residentsService.getResidents({});
      const list = response?.data?.content || response?.content || (Array.isArray(response) ? response : []);
      setResidents(list);
    } catch (err) {
      console.error('Error cargando residentes');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (unit) => {
    setFormData({
      condominioId: unit.condominioId || 1,
      torreId: unit.torreId || '',
      estadoId: unit.estadoId || 1,
      numero: unit.numero || '',
      piso: unit.piso || '',
      tipo: unit.tipo || 'DEPARTAMENTO',
      alicuota: unit.alicuota || ''
    });
    setEditingId(unit.id);
    setShowForm(true);
    setValidationErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta unidad?')) return;
    try {
      await unitsService.deleteUnit(id);
      loadUnits();
    } catch (err) {
      setError(err.response?.data?.message || 'Error eliminando unidad');
    }
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

    // Garantizar tipos numéricos en el payload
    const payload = {
      condominioId: Number(formData.condominioId),
      torreId: formData.torreId ? Number(formData.torreId) : null,
      estadoId: Number(formData.estadoId),
      numero: formData.numero,
      piso: formData.piso || null,
      tipo: formData.tipo,
      alicuota: parseFloat(formData.alicuota)
    };

    try {
      if (editingId) {
        await unitsService.updateUnit(editingId, payload);
      } else {
        await unitsService.createUnit(payload);
      }
      setFormData(DEFAULT_FORM);
      setValidationErrors({});
      setShowForm(false);
      setEditingId(null);
      loadUnits();
    } catch (err) {
      const errData = err.response?.data;
      const msg = errData?.errors?.map(e => `${e.campo}: ${e.message}`).join(' | ')
        || errData?.message
        || 'Error guardando unidad';
      setError(msg);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Unidades</h1>
        <Button onClick={() => {
          setShowForm(!showForm);
          setEditingId(null);
          setFormData(DEFAULT_FORM);
          setValidationErrors({});
        }}>
          <Plus size={20} className="mr-2" />
          Nueva Unidad
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-lg font-bold mb-4">{editingId ? 'Editar Unidad' : 'Crear Unidad'}</h2>
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
                label="Alícuota (ej: 0.045)"
                type="number"
                name="alicuota"
                value={formData.alicuota}
                onChange={handleChange}
                error={validationErrors.alicuota}
                step="0.000001"
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
              <Button type="submit">{editingId ? 'Actualizar' : 'Guardar'}</Button>
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
        <Table
          columns={['Unidad', 'Tipo', 'Piso', 'Alícuota', 'Estado', 'Acciones']}
          data={units.map((u) => ({
            Unidad: u.numero,
            Tipo: u.tipo,
            Piso: u.piso || '-',
            Alícuota: u.alicuota != null ? (parseFloat(u.alicuota) * 100).toFixed(4) + '%' : '-',
            Estado: u.estadoNombre || '-',
            Acciones: (
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-800" onClick={() => handleEdit(u)} title="Editar">
                  <Edit2 size={18} />
                </button>
                <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(u.id)} title="Eliminar">
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
