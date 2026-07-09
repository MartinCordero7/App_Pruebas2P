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
        const results = await Promise.allSettled([
          dashboardService.getSummary(),
          residentsService.getResidents({}),
          unitsService.getUnits({}),
          billingService.getDelinquentReport(),
          dashboardService.getFinancialSummary()
        ]);

        const summary = results[0].status === 'fulfilled' ? results[0].value : null;
        const residents = results[1].status === 'fulfilled' ? results[1].value : null;
        const units = results[2].status === 'fulfilled' ? results[2].value : null;
        const delinquent = results[3].status === 'fulfilled' ? results[3].value : null;
        const report = results[4].status === 'fulfilled' ? results[4].value : null;

        const summaryData = summary?.data || summary || {};
        const residentsList = residents?.data?.content || residents?.content || (Array.isArray(residents) ? residents : []);
        const unitsList = units?.data?.content || units?.content || (Array.isArray(units) ? units : []);
        const delinquentData = delinquent?.data || delinquent || {};
        const reportData = report?.data || report || {};

        setStats({
          totalResidents: summaryData.totalResidents || residentsList.length,
          totalUnits: summaryData.totalUnits || unitsList.length,
          totalDebt: delinquentData.totalDebt || summaryData.totalDebt || 0,
          totalIncome: reportData.total_income ?? reportData.income?.total ?? summaryData.totalIncome ?? 0
        });

        setChartData(Array.isArray(reportData.monthly) && reportData.monthly.length > 0 ? reportData.monthly : [
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

    const interval = setInterval(() => {
      loadDashboardData();
    }, 15000);

    return () => clearInterval(interval);
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
