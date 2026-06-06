import React, { useState, useEffect } from 'react';
import { Plus, FileText, Trash2, AlertCircle } from 'lucide-react';
import { Card, Button, Input, Select, Table, Alert } from '../components/UI';
import documentsService from '../services/documentsService';
import residentsService from '../services/residentsService';

export function Documents() {
  const [documents, setDocuments] = useState([]);
  const [expiringDocs, setExpiringDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [residents, setResidents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    documentType: 'cedula',
    relatedEntityType: 'resident',
    relatedEntityId: '',
    fileName: '',
    expirationDate: ''
  });

  useEffect(() => {
    loadDocuments();
    loadResidents();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const [docs, expiring] = await Promise.all([
        documentsService.getDocuments({}),
        documentsService.getExpiringDocuments()
      ]);
      setDocuments(Array.isArray(docs) ? docs : []);
      setExpiringDocs(Array.isArray(expiring) ? expiring : []);
    } catch (err) {
      setError('Error cargando documentos');
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

    try {
      await documentsService.uploadDocument(formData);
      setFormData({
        title: '',
        documentType: 'cedula',
        relatedEntityType: 'resident',
        relatedEntityId: '',
        fileName: '',
        expirationDate: ''
      });
      setShowForm(false);
      loadDocuments();
    } catch (err) {
      setError(err.response?.data?.error || 'Error subiendo documento');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro?')) {
      try {
        await documentsService.deleteDocument(id);
        loadDocuments();
      } catch (err) {
        setError('Error eliminando documento');
      }
    }
  };

  const getDocTypeLabel = (type) => {
    const types = {
      cedula: 'Cédula',
      pasaporte: 'Pasaporte',
      escritura: 'Escritura',
      contrato: 'Contrato',
      autorizacion: 'Autorización',
      reglamento: 'Reglamento'
    };
    return types[type] || type;
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Documentos</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="mr-2" />
          Nuevo Documento
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Documentos próximos a vencer */}
      {expiringDocs.length > 0 && (
        <Card className="mb-8 border-l-4 border-yellow-500">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-yellow-600" size={24} />
            <h2 className="text-lg font-bold">Documentos Próximos a Vencer</h2>
          </div>
          <div className="space-y-2">
            {expiringDocs.map((doc) => (
              <div key={doc.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                <div>
                  <p className="font-medium">{doc.title}</p>
                  <p className="text-sm text-gray-600">Vence: {new Date(doc.expiration_date).toLocaleDateString()}</p>
                </div>
                <FileText className="text-yellow-600" size={20} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-lg font-bold mb-4">Nuevo Documento</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Título del Documento"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ej: Cédula de Juan Pérez"
                required
              />
              <Select
                label="Tipo de Documento"
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
              >
                <option value="cedula">Cédula</option>
                <option value="pasaporte">Pasaporte</option>
                <option value="escritura">Escritura</option>
                <option value="contrato">Contrato</option>
                <option value="autorizacion">Autorización</option>
                <option value="reglamento">Reglamento</option>
              </Select>
              <Input
                label="Nombre de Archivo"
                name="fileName"
                value={formData.fileName}
                onChange={handleChange}
                placeholder="documento.pdf"
              />
              <Input
                label="Fecha de Vencimiento"
                type="date"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={handleChange}
              />
              <Select
                label="Relacionado a"
                name="relatedEntityType"
                value={formData.relatedEntityType}
                onChange={handleChange}
              >
                <option value="resident">Residente</option>
                <option value="unit">Unidad</option>
                <option value="building">Edificio</option>
              </Select>
              {formData.relatedEntityType === 'resident' && (
                <Select
                  label="Seleccionar Residente"
                  name="relatedEntityId"
                  value={formData.relatedEntityId}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar...</option>
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.first_name} {r.last_name}
                    </option>
                  ))}
                </Select>
              )}
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
        <h2 className="text-lg font-bold mb-4">Documentos Archivados</h2>
        <Table
          columns={['Título', 'Tipo', 'Archivo', 'Vencimiento', 'Acciones']}
          data={documents.map((d) => ({
            Título: d.title,
            Tipo: getDocTypeLabel(d.document_type),
            Archivo: d.file_name || '-',
            Vencimiento: d.expiration_date ? new Date(d.expiration_date).toLocaleDateString() : 'Sin vencimiento',
            Acciones: (
              <button
                className="text-red-600 hover:text-red-800"
                onClick={() => handleDelete(d.id)}
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
