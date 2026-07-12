import React, { useEffect, useState } from 'react';
import { Card, Table, Alert } from '../components/UI';
import securityService from '../services/securityService';

// Schema tabla acceso: id_visitante, id_unidad, id_guardia, id_estado (todos NOT NULL FK),
// hora_ingreso (timestamp DEFAULT now), hora_salida (nullable), foto (nullable)
// Este módulo es de SOLO LECTURA — los registros de acceso los crea el módulo de guardia/portería.

export function Security() {
  const [accesos, setAccesos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAccesos();

    const interval = setInterval(() => loadAccesos(), 15000);
    return () => clearInterval(interval);
  }, []);

  const loadAccesos = async () => {
    try {
      setLoading(true);
      const response = await securityService.getAccessLog();
      // Desempaquetar wrapper: { data: { content: [...] } }
      const list = response?.data?.content || response?.content || (Array.isArray(response) ? response : []);
      setAccesos(list);
    } catch (err) {
      setError('Error cargando bitácora de accesos');
    } finally {
      setLoading(false);
    }
  };

  const hoy = new Date().toDateString();
  const accesosHoy = accesos.filter(a => {
    try { return new Date(a.horaIngreso).toDateString() === hoy; } catch { return false; }
  }).length;
  const sinSalida = accesos.filter(a => !a.horaSalida).length;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Seguridad — Bitácora de Accesos</h1>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Estadísticas según campos reales de tabla acceso */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-gray-600 text-sm">Total Accesos</p>
          <p className="text-3xl font-bold">{accesos.length}</p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm">Accesos Hoy</p>
          <p className="text-3xl font-bold text-blue-600">{accesosHoy}</p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm">Visitas Activas (sin salida)</p>
          <p className="text-3xl font-bold text-orange-600">{sinSalida}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-bold mb-4">Registro de Accesos</h2>
        <Table
          columns={['Visitante', 'Unidad', 'Hora Ingreso', 'Hora Salida', 'Estado']}
          data={accesos.map((a) => ({
            // Campos mapeados desde tabla acceso y sus JOINs esperados en la API
            Visitante: a.visitanteNombre || a.nombre || '-',
            Unidad: a.unidadNombre || a.unidadNumero || '-',
            'Hora Ingreso': a.horaIngreso ? new Date(a.horaIngreso).toLocaleString() : '-',
            'Hora Salida': a.horaSalida ? new Date(a.horaSalida).toLocaleString() : (
              <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                En visita
              </span>
            ),
            Estado: a.estadoNombre || '-'
          }))}
          loading={loading}
        />
      </Card>
    </div>
  );
}
