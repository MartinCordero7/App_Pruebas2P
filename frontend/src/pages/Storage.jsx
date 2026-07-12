import React from 'react';
import { Card } from '../components/UI';

// La tabla 'bodega' NO existe en el schema.sql de la base de datos.
// Este módulo está pendiente de implementación en el backend.
export function Storage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Gestión de Bodegas</h1>
      <Card>
        <div className="text-center py-16 text-gray-500">
          <p className="text-5xl mb-4">🏗️</p>
          <p className="text-xl font-semibold mb-2">Módulo no disponible</p>
          <p className="text-sm">
            La tabla <code className="bg-gray-100 px-1 rounded">bodega</code> no está definida
            en el esquema de la base de datos actual.
            Este módulo estará disponible cuando se implemente en el backend.
          </p>
        </div>
      </Card>
    </div>
  );
}
