import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FileText, Home } from 'lucide-react';
import { Card, Button, Input, Select, Table, Alert } from '../components/UI';
import residentsService from '../services/residentsService';
import documentsService from '../services/documentsService';
import unitsService from '../services/unitsService';
import { validateForm } from '../utils/validation';

export function Residents() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const [residentDocuments, setResidentDocuments] = useState([]);
  const [residentBalance, setResidentBalance] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const defaultFormData = {
    tipoIdentificacion: 'CEDULA',
    numeroIdentificacion: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    correo: '',
    fechaNacimiento: '1990-01-01',
    direccion: '',
    fotoPerfil: '',
    estado: 'ACTIVO'
  };
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    loadResidents();

    const interval = setInterval(() => {
      loadResidents();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const loadResidents = async () => {
    try {
      setLoading(true);
      const responseData = await residentsService.getResidents({ search: searchTerm });
      const items = responseData?.data?.content || responseData?.content || (Array.isArray(responseData) ? responseData : []);
      setResidents(items);
      setError('');
    } catch (err) {
      setError('Error cargando residentes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadResidentDetails = async (residentId) => {
    try {
      setLoading(true);
      const [docs, balance] = await Promise.all([
        documentsService.getDocuments({ relatedEntityType: 'resident', relatedEntityId: residentId }),
        residentsService.getResidentBalance(residentId)
      ]);
      setResidentDocuments(Array.isArray(docs) ? docs : []);
      setResidentBalance(balance);
    } catch (err) {
      console.error('Error cargando detalles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEdit = (resident) => {
    setFormData({
      tipoIdentificacion: resident.tipoIdentificacion || 'CEDULA',
      numeroIdentificacion: resident.numeroIdentificacion || '',
      nombres: resident.nombres || '',
      apellidos: resident.apellidos || '',
      telefono: resident.telefono || '',
      correo: resident.correo || '',
      fechaNacimiento: resident.fechaNacimiento || '1990-01-01',
      direccion: resident.direccion || '',
      fotoPerfil: resident.fotoPerfil || '',
      estado: resident.estado || 'ACTIVO'
    });
    setValidationErrors({});
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    const rules = {
      nombres: { required: true, minLength: 2 },
      apellidos: { required: true, minLength: 2 },
      correo: { type: 'email' },
      telefono: { type: 'phone' },
      numeroIdentificacion: { required: true, minLength: 5 }
    };

    const errors = validateForm(formData, rules);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    try {
      if (editingId) {
        await residentsService.updateResident(editingId, formData);
      } else {
        await residentsService.createResident(formData);
      }
      setFormData(defaultFormData);
      setValidationErrors({});
      setEditingId(null);
      setShowForm(false);
      loadResidents();
    } catch (err) {
      if (err.response?.status === 400) {
        const errorData = err.response?.data;
        let errorMsg = 'Error de validación';
        if (errorData?.errors) {
          errorMsg = Object.values(errorData.errors).join(', ');
        } else if (errorData?.message) {
          errorMsg = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMsg = errorData;
        } else {
          errorMsg = JSON.stringify(errorData);
        }
        setError(errorMsg);
      } else {
        setError(err.response?.data?.error || 'Error guardando residente');
      }
    }
  };

  const handleViewDetails = (resident) => {
    setSelectedResident(resident);
    setActiveTab('details');
    loadResidentDetails(resident.id);
  };

  const handleDelete = async (residentId) => {
    if (window.confirm('¿Estás seguro de eliminar este residente?')) {
      try {
        await residentsService.deleteResident(residentId);
        loadResidents();
      } catch (err) {
        setError('Error eliminando residente');
      }
    }
  };

  return (
    <div className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}

      {/* Vista de Detalles del Residente */}
      {selectedResident && activeTab === 'details' && (
        <Card className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {selectedResident.nombres} {selectedResident.apellidos}
            </h2>
            <Button variant="secondary" onClick={() => setActiveTab('list')}>
              Volver
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Email</p>
              <p className="font-medium">{selectedResident.correo || '-'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Teléfono</p>
              <p className="font-medium">{selectedResident.telefono || '-'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Cédula</p>
              <p className="font-medium">{selectedResident.numeroIdentificacion}</p>
            </div>
            {residentBalance && (
              <div className="bg-red-50 p-4 rounded border-l-4 border-red-500">
                <p className="text-gray-600 text-sm">Deuda Total</p>
                <p className="font-bold text-lg text-red-600">
                  ${residentBalance.totalDebt?.toFixed(2) || '0.00'}
                </p>
              </div>
            )}
          </div>

          {/* Documentos del Residente */}
          {residentDocuments.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileText size={20} />
                Documentos
              </h3>
              <Table
                columns={['Título', 'Tipo', 'Archivo', 'Vencimiento']}
                data={residentDocuments.map((d) => ({
                  Título: d.title,
                  Tipo: d.document_type,
                  Archivo: d.file_name || '-',
                  Vencimiento: d.expiration_date ? new Date(d.expiration_date).toLocaleDateString() : 'Sin vencimiento'
                }))}
                loading={loading}
              />
            </div>
          )}
        </Card>
      )}

      {/* Vista de Lista */}
      {activeTab === 'list' && (
        <>
          {showForm && (
            <Card className="mb-8">
              <h2 className="text-lg font-bold mb-4">{editingId ? 'Editar Residente' : 'Crear Residente'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nombres"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleChange}
                    error={validationErrors.nombres}
                    required
                  />
                  <Input
                    label="Apellidos"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    error={validationErrors.apellidos}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    error={validationErrors.correo}
                  />
                  <Input
                    label="Teléfono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    error={validationErrors.telefono}
                  />
                  <Input
                    label="Número de Identificación"
                    name="numeroIdentificacion"
                    value={formData.numeroIdentificacion}
                    onChange={handleChange}
                    error={validationErrors.numeroIdentificacion}
                    required
                  />
                  <Select
                    label="Tipo Identificación"
                    name="tipoIdentificacion"
                    value={formData.tipoIdentificacion}
                    onChange={handleChange}
                  >
                    <option value="CEDULA">Cédula</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="RUC">RUC</option>
                  </Select>
                  <Input
                    label="Fecha de Nacimiento"
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    error={validationErrors.fechaNacimiento}
                    required
                  />
                  <Input
                    label="Dirección"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    error={validationErrors.direccion}
                  />
                  <Select
                    label="Estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </Select>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button type="submit">{editingId ? 'Actualizar' : 'Guardar'}</Button>
                  <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditingId(null); setFormData(defaultFormData); setValidationErrors({}); }}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Residentes</h1>
            <Button variant="primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData(defaultFormData); setValidationErrors({}); }}>
              <Plus size={20} className="mr-2" />
              Nuevo Residente
            </Button>
          </div>

          <Card>
            <div className="mb-4">
              <Input
                placeholder="Buscar residentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={loadResidents}
              />
            </div>

            <Table
              columns={['Nombre', 'Email', 'Teléfono', 'Cédula', 'Estado', 'Acciones']}
              data={residents.map((r) => ({
                Nombre: `${r.nombres} ${r.apellidos}`,
                Email: r.correo || '-',
                Teléfono: r.telefono || '-',
                Cédula: r.numeroIdentificacion,
                Estado: r.estado,
                Acciones: (
                  <div className="flex gap-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleViewDetails(r)}
                      title="Ver detalles"
                    >
                      <Home size={18} />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-800"
                      onClick={() => handleEdit(r)}
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(r.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )
              }))}
              loading={loading}
            />
          </Card>
        </>
      )}
    </div>
  );
}
