import React from 'react';
import { Card, Alert } from '../components/UI';

export function Purchases() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Gestión de Compras</h1>

      <Card>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">🛒 Módulo en Desarrollo</h2>
          <p className="text-gray-600 mb-8">
            La gestión de compras permite:
          </p>
          <ul className="text-left inline-block text-gray-700 space-y-2">
            <li>✅ Crear y gestionar solicitudes de compra</li>
            <li>✅ Comparar cotizaciones de proveedores</li>
            <li>✅ Autorizar órdenes de compra</li>
            <li>✅ Rastrear entregas</li>
            <li>✅ Procesar facturas y pagos</li>
            <li>✅ Generar reportes de gastos</li>
          </ul>
          <p className="text-sm text-gray-500 mt-8">
            Este módulo se integra con la gestión de proveedores y contabilidad
          </p>
        </div>
      </Card>
    </div>
  );
}
