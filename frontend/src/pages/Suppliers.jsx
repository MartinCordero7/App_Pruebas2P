import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Card, Button, Input, Select, Table, Alert } from '../components/UI';
import suppliersService from '../services/suppliersService';
import { validateForm, validateEmail, validatePhone } from '../utils/validation';

export function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('suppliers');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'servicios',
    address: '',
    contact_person: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (activeTab === 'suppliers') {
      loadSuppliers();
    } else {
      loadPurchaseOrders();
    }
  }, [activeTab]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await suppliersService.getSuppliers({});
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error cargando proveedores');
    } finally {
      setLoading(false);
    }
  };

  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);
      const data = await suppliersService.getPurchaseOrders({});
      setPurchaseOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error cargando órdenes de compra');
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
      name: { required: true, minLength: 3 },
      email: { type: 'email' },
      phone: { type: 'phone' },
      category: { required: true }
    };

    const errors = validateForm(formData, rules);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await suppliersService.createSupplier(formData);
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: 'servicios',
        address: '',
        contact_person: ''
      });
      setShowForm(false);
      loadSuppliers();
    } catch (err) {
      setError(err.response?.data?.error || 'Error creando proveedor');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro?')) {
      try {
        await suppliersService.deleteSupplier(id);
        loadSuppliers();
      } catch (err) {
        setError('Error eliminando proveedor');
      }
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Proveedores</h1>
        {activeTab === 'suppliers' && (
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus size={20} className="mr-2" />
            Nuevo Proveedor
          </Button>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === 'suppliers'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          Proveedores
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === 'orders'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          Órdenes de Compra
        </button>
      </div>

      {activeTab === 'suppliers' && (
        <>
          {showForm && (
            <Card className="mb-8">
              <h2 className="text-lg font-bold mb-4">Nuevo Proveedor</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nombre"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={validationErrors.name}
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
                  <Select
                    label="Categoría"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="servicios">Servicios</option>
                    <option value="materiales">Materiales</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="seguridad">Seguridad</option>
                    <option value="limpieza">Limpieza</option>
                  </Select>
                  <Input
                    label="Dirección"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                  <Input
                    label="Persona de Contacto"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleChange}
                  />
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
            <h2 className="text-lg font-bold mb-4">Proveedores</h2>
            <Table
              columns={['Nombre', 'Categoría', 'Email', 'Teléfono', 'Contacto', 'Acciones']}
              data={suppliers.map((s) => ({
                Nombre: s.name,
                Categoría: s.category,
                Email: s.email || '-',
                Teléfono: s.phone || '-',
                Contacto: s.contact_person || '-',
                Acciones: (
                  <div className="flex gap-2">
                    <button className="text-green-600 hover:text-green-800">
                      <Edit2 size={18} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(s.id)}
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

      {activeTab === 'orders' && (
        <Card>
          <h2 className="text-lg font-bold mb-4">Órdenes de Compra</h2>
          <Table
            columns={['Número', 'Proveedor', 'Fecha', 'Monto', 'Estado']}
            data={purchaseOrders.map((po) => ({
              Número: po.order_number || po.id?.substring(0, 8),
              Proveedor: po.supplier_name,
              Fecha: new Date(po.order_date).toLocaleDateString(),
              Monto: `$${po.total_amount?.toFixed(2) || '0.00'}`,
              Estado: (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  po.status === 'pendiente'
                    ? 'bg-yellow-100 text-yellow-800'
                    : po.status === 'completado'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {po.status}
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
