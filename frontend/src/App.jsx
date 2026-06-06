import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { PrivateRoute } from './components/PrivateRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Residents } from './pages/Residents';
import { Units } from './pages/Units';
import { Billing } from './pages/Billing';
import { Finance } from './pages/Finance';
import { Parking } from './pages/Parking';
import { Storage } from './pages/Storage';
import { Documents } from './pages/Documents';
import { Maintenance } from './pages/Maintenance';
import { Suppliers } from './pages/Suppliers';
import { Communications } from './pages/Communications';
import { Assemblies } from './pages/Assemblies';
import { Employees } from './pages/Employees';
import { Reports } from './pages/Reports';
import { Budget } from './pages/Budget';
import { Purchases } from './pages/Purchases';
import { Visitors } from './pages/Visitors';
import { Security } from './pages/Security';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas privadas */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <>
                <Navbar />
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  
                  {/* Gestión */}
                  <Route path="/residents" element={<Residents />} />
                  <Route path="/units" element={<Units />} />
                  <Route path="/parking" element={<Parking />} />
                  <Route path="/storage" element={<Storage />} />
                  <Route path="/documents" element={<Documents />} />
                  
                  {/* Financiero */}
                  <Route path="/billing" element={<Billing />} />
                  <Route path="/finance" element={<Finance />} />
                  <Route path="/budget" element={<Budget />} />
                  
                  {/* Operaciones */}
                  <Route path="/maintenance" element={<Maintenance />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/purchases" element={<Purchases />} />
                  
                  {/* Comunicación */}
                  <Route path="/communications" element={<Communications />} />
                  <Route path="/assemblies" element={<Assemblies />} />
                  <Route path="/visitors" element={<Visitors />} />
                  <Route path="/security" element={<Security />} />
                  
                  {/* Administración */}
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/reports" element={<Reports />} />
                  
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
