import React, { useEffect, useState } from 'react';
import { Card, Alert, Table } from '../components/UI';
import suppliersService from '../services/suppliersService';

export function Purchases() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);
      const data = await suppliersService.getPurchaseOrders();
      setPurchaseOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error cargando solicitudes de compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Gestión de Compras</h1>

      <Card>
        <div className="mb-4 text-sm text-gray-600">
          Las compras se registran como tickets con categoría de compra y luego se liquidan con pagos.
        </div>
        <Table
          columns={['Asunto', 'Estado', 'Prioridad', 'Fecha', 'Acciones']}
          data={purchaseOrders.map((order) => ({
            Asunto: order.title || order.subject || 'Solicitud de compra',
            Estado: order.status || 'pendiente',
            Prioridad: order.priority || '-',
            Fecha: order.created_at ? new Date(order.created_at).toLocaleDateString() : '-',
            Acciones: '-'
          }))}
          loading={loading}
        />
      </Card>
    </div>
  );
}
