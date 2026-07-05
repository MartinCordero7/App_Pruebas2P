import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, Button } from '../components/UI';
import transactionsService from '../services/transactionsService';

export function Finance() {
  const [report, setReport] = useState(null);
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      const [financialReport, balanceData, cashFlow] = await Promise.all([
        transactionsService.getFinancialReport(),
        transactionsService.generateBalanceSheet(),
        transactionsService.getCashFlowReport()
      ]);

      setReport(financialReport);
      setBalanceSheet(balanceData);

      // Preparar datos para gráfico
      setChartData([
        { category: 'Ingresos', amount: financialReport.income?.total || 0 },
        { category: 'Egresos', amount: financialReport.expenses?.total || 0 }
      ]);
    } catch (error) {
      console.error('Error cargando datos financieros:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container py-8">Cargando...</div>;

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Finanzas</h1>

      {/* Balance General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-gray-600 text-sm mb-2">Ingresos Totales</p>
          <p className="text-3xl font-bold text-green-600">
            ${(report?.income?.total || 0).toFixed(2)}
          </p>
        </Card>

        <Card>
          <p className="text-gray-600 text-sm mb-2">Egresos Totales</p>
          <p className="text-3xl font-bold text-red-600">
            ${(report?.expenses?.total || 0).toFixed(2)}
          </p>
        </Card>

        <Card>
          <p className="text-gray-600 text-sm mb-2">Utilidad</p>
          <p className="text-3xl font-bold text-blue-600">
            ${(report?.balance || 0).toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-lg font-bold mb-4">Ingresos vs Egresos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-lg font-bold mb-4">Detalles por Categoría</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-green-600 mb-2">Ingresos</h3>
              {report?.income?.byCategory?.map((cat, idx) => (
                <div key={idx} className="flex justify-between text-sm mb-1">
                  <span>{cat.category}</span>
                  <span className="font-medium">${parseFloat(cat.total).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-semibold text-red-600 mb-2">Egresos</h3>
              {report?.expenses?.byCategory?.map((cat, idx) => (
                <div key={idx} className="flex justify-between text-sm mb-1">
                  <span>{cat.category}</span>
                  <span className="font-medium">${parseFloat(cat.total).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-bold mb-4">Balance General</h2>
          <div className="space-y-3">
            <div className="flex justify-between pb-2 border-b">
              <span>Activos</span>
              <span className="font-medium">${(balanceSheet?.assets || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between pb-2 border-b">
              <span>Pasivos</span>
              <span className="font-medium">${(balanceSheet?.liabilities || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 text-lg font-bold">
              <span>Patrimonio</span>
              <span>${(balanceSheet?.equity || 0).toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold mb-4">Indicadores</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Margen de Ganancia</span>
              <span className="font-medium">{(report?.profit_margin || 0).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Utilidad Neta</span>
              <span className="font-medium text-green-600">
                ${(report?.balance || 0).toFixed(2)}
              </span>
            </div>
          </div>
          <Button className="w-full mt-4">Exportar a PDF</Button>
        </Card>
      </div>
    </div>
  );
}
