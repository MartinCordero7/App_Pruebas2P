import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Users, Vote } from 'lucide-react';
import { Card, Button, Input, Select, Table, Alert } from '../components/UI';
import api from '../services/api';
import { validateForm, validateRequired } from '../utils/validation';

export function Assemblies() {
  const [assemblies, setAssemblies] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('assemblies');
  const [selectedAssembly, setSelectedAssembly] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    agenda: '',
    expected_quorum: 50
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (activeTab === 'assemblies') {
      loadAssemblies();
    } else {
      loadVotes();
    }
  }, [activeTab]);

  const loadAssemblies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/assemblies');
      setAssemblies(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Error cargando asambleas');
    } finally {
      setLoading(false);
    }
  };

  const loadVotes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/assemblies/votes');
      setVotes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Error cargando votaciones');
    } finally {
      setLoading(false);
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
      title: { required: true, minLength: 5 },
      date: { required: true },
      agenda: { required: true, minLength: 10 }
    };

    const errors = validateForm(formData, rules);
    
    const quorum = parseFloat(formData.expected_quorum);
    if (isNaN(quorum) || quorum < 0 || quorum > 100) {
      errors.expected_quorum = 'El quórum debe estar entre 0 y 100%';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await api.post('/assemblies', formData);
      setFormData({
        title: '',
        date: '',
        agenda: '',
        expected_quorum: 50
      });
      setShowForm(false);
      loadAssemblies();
    } catch (err) {
      setError(err.response?.data?.error || 'Error creando asamblea');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro?')) {
      try {
        await api.delete(`/assemblies/${id}`);
        loadAssemblies();
      } catch (err) {
        setError('Error eliminando asamblea');
      }
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Asambleas y Decisiones</h1>
        {activeTab === 'assemblies' && (
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus size={20} className="mr-2" />
            Convocar Asamblea
          </Button>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {['assemblies', 'votes'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab === 'assemblies' && '📅 Asambleas'}
            {tab === 'votes' && '🗳️ Votaciones'}
          </button>
        ))}
      </div>

      {activeTab === 'assemblies' && (
        <>
          {showForm && (
            <Card className="mb-8">
              <h2 className="text-lg font-bold mb-4">Convocar Asamblea</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <Input
                    label="Título"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Asamblea General Ordinaria"
                    error={validationErrors.title}
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Fecha y Hora"
                      type="datetime-local"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      error={validationErrors.date}
                      required
                    />
                    <Input
                      label="Quórum Esperado (%)"
                      type="number"
                      name="expected_quorum"
                      value={formData.expected_quorum}
                      onChange={handleChange}
                      error={validationErrors.expected_quorum}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Orden del Día</label>
                    <textarea
                      name="agenda"
                      value={formData.agenda}
                      onChange={handleChange}
                      placeholder="1. Lectura del acta anterior
2. Aprobación de presupuesto..."
                      rows="6"
                      className="w-full border rounded px-3 py-2"
                    />
                    {validationErrors.agenda && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.agenda}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button type="submit">Convocar</Button>
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <p className="text-gray-600 text-sm">Total Asambleas</p>
              <p className="text-3xl font-bold">{assemblies.length}</p>
            </Card>
            <Card>
              <p className="text-gray-600 text-sm">Próximas</p>
              <p className="text-3xl font-bold text-blue-600">
                {assemblies.filter(a => new Date(a.date) > new Date()).length}
              </p>
            </Card>
            <Card>
              <p className="text-gray-600 text-sm">Realizadas</p>
              <p className="text-3xl font-bold text-green-600">
                {assemblies.filter(a => new Date(a.date) <= new Date()).length}
              </p>
            </Card>
          </div>

          <Card>
            <h2 className="text-lg font-bold mb-4">Asambleas Convocadas</h2>
            <Table
              columns={['Título', 'Fecha', 'Estado', 'Quórum', 'Acciones']}
              data={assemblies.map((a) => ({
                Título: a.title,
                Fecha: new Date(a.date).toLocaleDateString(),
                Estado: (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    new Date(a.date) > new Date()
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {new Date(a.date) > new Date() ? 'Próxima' : 'Realizada'}
                  </span>
                ),
                Quórum: `${a.expected_quorum}%`,
                Acciones: (
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleDelete(a.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                )
              }))}
              loading={loading}
            />
          </Card>
        </>
      )}

      {activeTab === 'votes' && (
        <Card>
          <h2 className="text-lg font-bold mb-4">Resultados de Votaciones</h2>
          <Table
            columns={['Propuesta', 'Asamblea', 'A Favor', 'En Contra', 'Abstenciones', 'Resultado']}
            data={votes.map((v) => ({
              Propuesta: v.proposal_title,
              Asamblea: v.assembly_title,
              'A Favor': v.votes_in_favor,
              'En Contra': v.votes_against,
              Abstenciones: v.abstentions,
              Resultado: (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  v.result === 'aprobado'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {v.result}
                </span>
              )
            }))}
            loading={loading}
          />
        </Card>
      )}
    </div>
  );
}
