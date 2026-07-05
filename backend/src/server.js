import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import residentsRoutes from './routes/residentsRoutes.js';
import unitsRoutes from './routes/unitsRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import transactionsRoutes from './routes/transactionsRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import suppliersRoutes from './routes/suppliersRoutes.js';
import communicationsRoutes from './routes/communicationsRoutes.js';
import assembliesRoutes from './routes/assembliesRoutes.js';
import documentsRoutes from './routes/documentsRoutes.js';
import employeesRoutes from './routes/employeesRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/residents', residentsRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/communications', communicationsRoutes);
app.use('/api/assemblies', assembliesRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/employees', employeesRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    status: err.status || 500
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Inicializar base de datos e iniciar servidor
async function startServer() {
  try {
    console.log('Inicializando base de datos...');
    await initializeDatabase();
    console.log('Base de datos inicializada correctamente');

    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en puerto ${PORT}`);
      console.log(`URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

export default app;
