import React, { useState, useEffect } from 'react';
import { Download, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, Button, Select, Table, Alert } from '../components/UI';
import billingService from '../services/billingService';
import transactionsService from '../services/transactionsService';
import { exportToExcel, exportToPDF, generateReportHTML } from '../utils/exportUtils';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Reports() {
  const [delinquent, setDelinquent] = useState([]);
  const [financial, setFinancial] = useState(null);
  const [cashFlow, setCashFlow] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportType, setReportType] = useState('morosidad');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    loadReports();
  }, [reportType, month]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');

      if (reportType === 'morosidad') {
        const data = await billingService.getDelinquentReport();
        setDelinquent(Array.isArray(data) ? data : []);
      } else if (reportType === 'financiero') {
        const data = await transactionsService.getFinancialReport();
        setFinancial(data);
      } else if (reportType === 'flujo') {
        const data = await transactionsService.getCashFlowReport();
        setCashFlow(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError('Error cargando reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    let htmlContent = '';

    if (reportType === 'morosidad') {
      const totalDebt = delinquent.reduce((sum, d) => sum + parseFloat(d.total_debt || 0), 0);
      htmlContent = generateReportHTML(
        'Reporte de Morosidad - ' + new Date().toLocaleDateString(),
        delinquent.map(d => ({
          'Residente': d.resident_name,
          'Deuda Total': `$${parseFloat(d.total_debt).toFixed(2)}`,
          'Facturas Pendientes': d.pending_bills,
          'Email': d.email
        })),
        {
          'Total Deuda': `$${totalDebt.toFixed(2)}`,
          'Residentes Morosos': delinquent.length,
          'Fecha': new Date().toLocaleDateString()
        }
      );
    } else if (reportType === 'financiero' && financial) {
      htmlContent = generateReportHTML(
        'Reporte Financiero - ' + new Date().toLocaleDateString(),
        [
          { 'Concepto': 'Ingresos', 'Valor': `$${financial.total_income?.toFixed(2) || '0.00'}` },
          { 'Concepto': 'Egresos', 'Valor': `$${financial.total_expenses?.toFixed(2) || '0.00'}` },
          { 'Concepto': 'Utilidad', 'Valor': `$${financial.balance?.toFixed(2) || '0.00'}` }
        ],
        {
          'Margen de Ganancia': `${financial.profit_margin?.toFixed(2) || '0'}%`,
          'Fecha': new Date().toLocaleDateString()
        }
      );
    }

    exportToPDF(htmlContent, `Reporte-${reportType}`);
  };

  const handleExportExcel = () => {
    let data = [];

    if (reportType === 'morosidad') {
      data = delinquent.map(d => ({
        'Residente': d.resident_name,
        'Deuda Total': parseFloat(d.total_debt),
        'Facturas Pendientes': d.pending_bills,
        'Email': d.email
      }));
    } else if (reportType === 'financiero' && financial) {
      data = [
        { 'Concepto': 'Ingresos', 'Valor': financial.total_income },
        { 'Concepto': 'Egresos', 'Valor': financial.total_expenses },
        { 'Concepto': 'Utilidad', 'Valor': financial.balance }
      ];
    }

    exportToExcel(data, `Reporte-${reportType}-${new Date().toISOString().slice(0, 10)}`);
  };

  const calculateKPIs = () => {
    const totalDebt = delinquent.reduce((sum, d) => sum + parseFloat(d.total_debt || 0), 0);
    const delinquentCount = delinquent.length;
    const delinquencyRate = delinquentCount > 0 ? ((delinquentCount / 50) * 100).toFixed(2) : '0'; // Asumiendo 50 unidades

    return {
      totalDebt,
      delinquentCount,
      delinquencyRate,
      recoveryRate: (100 - parseFloat(delinquencyRate)).toFixed(2)
    };
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  const kpis = calculateKPIs();

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">📊 Reportes Gerenciales</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportExcel} variant="secondary">
            <Download size={18} className="mr-2" />
            Excel
          </Button>
          <Button onClick={handleExportPDF} variant="secondary">
            <FileText size={18} className="mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Selector de Reporte */}
      <Card className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Tipo de Reporte"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="morosidad">Reporte de Morosidad</option>
            <option value="financiero">Reporte Financiero</option>
            <option value="flujo">Flujo de Caja</option>
            <option value="kpis">Indicadores KPI</option>
          </Select>
          <Select
            label="Mes"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const d = new Date();
              d.setMonth(d.getMonth() - i);
              const monthStr = d.toISOString().slice(0, 7);
              return (
                <option key={monthStr} value={monthStr}>
                  {new Date(monthStr + '-01').toLocaleDateString('es-ES', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </option>
              );
            })}
          </Select>
        </div>
      </Card>

      {/* Reporte de Morosidad */}
      {reportType === 'morosidad' && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Deuda Total</p>
                  <p className="text-3xl font-bold text-red-600">${kpis.totalDebt.toFixed(2)}</p>
                </div>
                <AlertCircle size={32} className="text-red-600" />
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Residentes Morosos</p>
                  <p className="text-3xl font-bold">{kpis.delinquentCount}</p>
                </div>
                <TrendingUp size={32} className="text-orange-600" />
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Tasa de Morosidad</p>
                  <p className="text-3xl font-bold text-yellow-600">{kpis.delinquencyRate}%</p>
                </div>
                <AlertCircle size={32} className="text-yellow-600" />
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Tasa de Recupero</p>
                  <p className="text-3xl font-bold text-green-600">{kpis.recoveryRate}%</p>
                </div>
                <TrendingUp size={32} className="text-green-600" />
              </div>
            </Card>
          </div>

          <Card>
            <h2 className="text-lg font-bold mb-4">Residentes con Deuda</h2>
            <Table
              columns={['Residente', 'Deuda Total', 'Facturas Pendientes', 'Email']}
              data={delinquent.map((d) => ({
                Residente: d.resident_name,
                'Deuda Total': `$${parseFloat(d.total_debt).toFixed(2)}`,
                'Facturas Pendientes': d.pending_bills,
                Email: d.email || '-'
              }))}
              loading={loading}
            />
          </Card>
        </>
      )}

      {/* Reporte Financiero */}
      {reportType === 'financiero' && financial && (
        <>
          {/* KPIs Financieros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <p className="text-gray-600 text-sm">Ingresos Totales</p>
              <p className="text-3xl font-bold text-green-600">${financial.total_income?.toFixed(2) || '0.00'}</p>
            </Card>
            <Card>
              <p className="text-gray-600 text-sm">Egresos Totales</p>
              <p className="text-3xl font-bold text-red-600">${financial.total_expenses?.toFixed(2) || '0.00'}</p>
            </Card>
            <Card>
              <p className="text-gray-600 text-sm">Utilidad / Pérdida</p>
              <p className={`text-3xl font-bold ${(financial.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${financial.balance?.toFixed(2) || '0.00'}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Gráfico de Ingresos vs Egresos */}
            <Card>
              <h3 className="font-bold mb-4">Ingresos vs Egresos</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'Ingresos', value: financial.total_income || 0 },
                  { name: 'Egresos', value: financial.total_expenses || 0 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Gráfico de Categorías */}
            <Card>
              <h3 className="font-bold mb-4">Gastos por Categoría</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={financial.expenses_by_category || []}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {(financial.expenses_by_category || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Balance General */}
          <Card>
            <h2 className="text-lg font-bold mb-4">Balance General</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 p-4 rounded">
                <h3 className="font-bold text-green-700 mb-2">ACTIVOS</h3>
                <p className="text-2xl font-bold">${financial.total_income?.toFixed(2) || '0.00'}</p>
                <p className="text-sm text-gray-600">Ingresos acumulados</p>
              </div>
              <div className="bg-red-50 p-4 rounded">
                <h3 className="font-bold text-red-700 mb-2">PASIVOS</h3>
                <p className="text-2xl font-bold">${financial.total_expenses?.toFixed(2) || '0.00'}</p>
                <p className="text-sm text-gray-600">Egresos acumulados</p>
              </div>
              <div className={`${(financial.balance || 0) >= 0 ? 'bg-blue-50' : 'bg-orange-50'} p-4 rounded`}>
                <h3 className={`font-bold ${(financial.balance || 0) >= 0 ? 'text-blue-700' : 'text-orange-700'} mb-2`}>PATRIMONIO</h3>
                <p className={`text-2xl font-bold ${(financial.balance || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  ${financial.balance?.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-gray-600">Margen: {financial.profit_margin?.toFixed(2) || '0'}%</p>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Flujo de Caja */}
      {reportType === 'flujo' && (
        <Card>
          <h2 className="text-lg font-bold mb-4">Flujo de Caja Mensual</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={cashFlow}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="inflow" stroke="#00C49F" name="Ingresos" />
              <Line type="monotone" dataKey="outflow" stroke="#FF8042" name="Egresos" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* KPIs */}
      {reportType === 'kpis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <p className="text-gray-600 text-xs uppercase tracking-wide">KPI</p>
            <p className="text-2xl font-bold mt-2">Ocupación de Unidades</p>
            <p className="text-lg text-blue-600 font-bold mt-2">95%</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-xs uppercase tracking-wide">KPI</p>
            <p className="text-2xl font-bold mt-2">Recaudación Efectiva</p>
            <p className="text-lg text-green-600 font-bold mt-2">92%</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-xs uppercase tracking-wide">KPI</p>
            <p className="text-2xl font-bold mt-2">Gastos/Ingresos</p>
            <p className="text-lg text-orange-600 font-bold mt-2">78%</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-xs uppercase tracking-wide">KPI</p>
            <p className="text-2xl font-bold mt-2">Rentabilidad</p>
            <p className="text-lg text-purple-600 font-bold mt-2">22%</p>
          </Card>
        </div>
      )}
    </div>
  );
}
