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
  const [activeTab, setActiveTab] = useState('list');
  const [residentDocuments, setResidentDocuments] = useState([]);
  const [residentBalance, setResidentBalance] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idNumber: '',
    relationship: 'residente'
  });

  useEffect(() => {
    loadResidents();
  }, []);

  const loadResidents = async () => {
    try {
      setLoading(true);
      const data = await residentsService.getResidents({ search: searchTerm });
      setResidents(Array.isArray(data) ? data : []);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    const rules = {
      firstName: { required: true, minLength: 2 },
      lastName: { required: true, minLength: 2 },
      email: { type: 'email' },
      phone: { type: 'phone' },
      idNumber: { required: true, minLength: 5 }
    };

    const errors = validateForm(formData, rules);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    try {
      await residentsService.createResident(formData);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        idNumber: '',
        relationship: 'residente'
      });
      setValidationErrors({});
      setShowForm(false);
      loadResidents();
    } catch (err) {
      setError(err.response?.data?.error || 'Error creando residente');
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
              {selectedResident.first_name} {selectedResident.last_name}
            </h2>
            <Button variant="secondary" onClick={() => setActiveTab('list')}>
              Volver
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Email</p>
              <p className="font-medium">{selectedResident.email || '-'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Teléfono</p>
              <p className="font-medium">{selectedResident.phone || '-'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Cédula</p>
              <p className="font-medium">{selectedResident.id_number}</p>
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
              <h2 className="text-lg font-bold mb-4">Crear Residente</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nombre"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={validationErrors.firstName}
                    required
                  />
                  <Input
                    label="Apellido"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={validationErrors.lastName}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={validationErrors.email}
                  />
                  <Input
                    label="Teléfono"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    error={validationErrors.phone}
                  />
                  <Input
                    label="Número de Identificación"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    error={validationErrors.idNumber}
                    required
                  />
                  <Select
                    label="Relación"
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleChange}
                  >
                    <option value="residente">Residente</option>
                    <option value="propietario">Propietario</option>
                    <option value="arrendatario">Arrendatario</option>
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

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Residentes</h1>
            <Button variant="primary" onClick={() => { setShowForm(!showForm); setValidationErrors({}); }}>
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
              columns={['Nombre', 'Email', 'Teléfono', 'Cédula', 'Tipo', 'Acciones']}
              data={residents.map((r) => ({
                Nombre: `${r.first_name} ${r.last_name}`,
                Email: r.email || '-',
                Teléfono: r.phone || '-',
                Cédula: r.id_number,
                Tipo: r.relationship,
                Acciones: (
                  <div className="flex gap-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleViewDetails(r)}
                      title="Ver detalles"
                    >
                      <Home size={18} />
                    </button>
                    <button className="text-green-600 hover:text-green-800">
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
