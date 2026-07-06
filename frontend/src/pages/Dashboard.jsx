import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Users, Home, AlertCircle } from 'lucide-react';
import { Card } from '../components/UI';
import billingService from '../services/billingService';
import dashboardService from '../services/dashboardService';
import residentsService from '../services/residentsService';
import unitsService from '../services/unitsService';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalResidents: 0,
    totalUnits: 0,
    totalDebt: 0,
    totalIncome: 0
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [summary, residents, units, delinquent, report] = await Promise.all([
          dashboardService.getSummary(),
          residentsService.getResidents({}),
          unitsService.getUnits({}),
          billingService.getDelinquentReport(),
          dashboardService.getFinancialSummary()
        ]);

        setStats({
          totalResidents: summary?.totalResidents ?? (Array.isArray(residents) ? residents.length : 0),
          totalUnits: summary?.totalUnits ?? (Array.isArray(units) ? units.length : 0),
          totalDebt: delinquent.totalDebt || summary?.totalDebt || 0,
          totalIncome: report.total_income ?? report.income?.total ?? summary?.totalIncome ?? 0
        });

        setChartData(Array.isArray(report.monthly) && report.monthly.length > 0 ? report.monthly : [
          { month: 'Enero', ingresos: 5000, egresos: 3000 },
          { month: 'Febrero', ingresos: 5500, egresos: 3200 },
          { month: 'Marzo', ingresos: 6000, egresos: 3500 },
          { month: 'Abril', ingresos: 5800, egresos: 3300 },
        ]);
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Residentes</p>
              <p className="text-3xl font-bold">{stats.totalResidents}</p>
            </div>
            <Users className="text-blue-600" size={40} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Unidades</p>
              <p className="text-3xl font-bold">{stats.totalUnits}</p>
            </div>
            <Home className="text-green-600" size={40} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Cartera Vencida</p>
              <p className="text-3xl font-bold text-red-600">${stats.totalDebt.toFixed(2)}</p>
            </div>
            <AlertCircle className="text-red-600" size={40} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Ingresos Totales</p>
              <p className="text-3xl font-bold text-green-600">${stats.totalIncome.toFixed(2)}</p>
            </div>
            <DollarSign className="text-green-600" size={40} />
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-bold mb-4">Ingresos vs Egresos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ingresos" fill="#10b981" />
              <Bar dataKey="egresos" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-lg font-bold mb-4">Tendencia Mensual</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ingresos" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="egresos" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
