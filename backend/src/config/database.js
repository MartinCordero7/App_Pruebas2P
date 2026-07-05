import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../data/condominio.db');

// Crear carpeta data si no existe
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;

export async function getDatabase() {
  if (db) {
    return db;
  }

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Habilitar foreign keys
  await db.exec('PRAGMA foreign_keys = ON');

  return db;
}

export async function initializeDatabase() {
  const database = await getDatabase();

  // Crear tablas
  await database.exec(`
    -- Tabla de usuarios (administradores, síndicos, etc.)
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      role TEXT NOT NULL DEFAULT 'resident', -- admin, syndic, resident, security
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabla de propietarios y residentes
    CREATE TABLE IF NOT EXISTS residents (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      id_number TEXT UNIQUE,
      id_type TEXT, -- cedula, pasaporte, ruc
      relationship TEXT, -- propietario, arrendatario, residente
      address TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Tabla de unidades inmobiliarias
    CREATE TABLE IF NOT EXISTS units (
      id TEXT PRIMARY KEY,
      unit_number TEXT NOT NULL,
      unit_type TEXT NOT NULL, -- departamento, casa, local, oficina
      floor TEXT,
      area DECIMAL(10, 2),
      aliquot DECIMAL(10, 4) NOT NULL, -- coeficiente de copropiedad
      status TEXT DEFAULT 'ocupado', -- ocupado, vacio, alquilado
      owner_id TEXT,
      renter_id TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES residents(id),
      FOREIGN KEY (renter_id) REFERENCES residents(id)
    );

    -- Tabla de parqueaderos
    CREATE TABLE IF NOT EXISTS parking_spaces (
      id TEXT PRIMARY KEY,
      space_number TEXT NOT NULL,
      unit_id TEXT,
      resident_id TEXT,
      status TEXT DEFAULT 'disponible', -- disponible, asignado
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (unit_id) REFERENCES units(id),
      FOREIGN KEY (resident_id) REFERENCES residents(id)
    );

    -- Tabla de bodegas
    CREATE TABLE IF NOT EXISTS storage_rooms (
      id TEXT PRIMARY KEY,
      room_number TEXT NOT NULL,
      unit_id TEXT,
      resident_id TEXT,
      status TEXT DEFAULT 'disponible',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (unit_id) REFERENCES units(id),
      FOREIGN KEY (resident_id) REFERENCES residents(id)
    );

    -- Tabla de cuotas y cobranza
    CREATE TABLE IF NOT EXISTS billing (
      id TEXT PRIMARY KEY,
      unit_id TEXT NOT NULL,
      billing_date DATETIME NOT NULL,
      due_date DATETIME NOT NULL,
      amount DECIMAL(12, 2) NOT NULL,
      type TEXT NOT NULL, -- ordinaria, extraordinaria
      description TEXT,
      paid BOOLEAN DEFAULT 0,
      payment_date DATETIME,
      payment_method TEXT, -- transferencia, efectivo, cheque
      interest_amount DECIMAL(12, 2) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (unit_id) REFERENCES units(id)
    );

    -- Tabla de pagos
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      billing_id TEXT NOT NULL,
      amount DECIMAL(12, 2) NOT NULL,
      payment_date DATETIME NOT NULL,
      payment_method TEXT,
      reference TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (billing_id) REFERENCES billing(id)
    );

    -- Tabla de convenios de pago
    CREATE TABLE IF NOT EXISTS payment_agreements (
      id TEXT PRIMARY KEY,
      unit_id TEXT NOT NULL,
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      total_amount DECIMAL(12, 2) NOT NULL,
      monthly_amount DECIMAL(12, 2) NOT NULL,
      status TEXT DEFAULT 'activo', -- activo, completado, cancelado
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (unit_id) REFERENCES units(id)
    );

    -- Tabla de contabilidad
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL, -- ingreso, egreso
      category TEXT NOT NULL, -- cuotas, reparacion, servicios, etc
      amount DECIMAL(12, 2) NOT NULL,
      description TEXT,
      reference TEXT,
      transaction_date DATETIME NOT NULL,
      account_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabla de proveedores
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      business_name TEXT NOT NULL,
      contact_person TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      ruc TEXT,
      payment_terms TEXT,
      rating DECIMAL(3, 2),
      active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabla de órdenes de compra
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      supplier_id TEXT NOT NULL,
      order_number TEXT UNIQUE,
      order_date DATETIME NOT NULL,
      expected_delivery DATETIME,
      status TEXT DEFAULT 'pendiente', -- pendiente, recibido, cancelado
      total_amount DECIMAL(12, 2),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    );

    -- Tabla de reportes de mantenimiento
    CREATE TABLE IF NOT EXISTS maintenance_requests (
      id TEXT PRIMARY KEY,
      reported_by TEXT NOT NULL,
      unit_id TEXT,
      common_area TEXT,
      issue_type TEXT NOT NULL, -- daño, reparacion, preventivo
      description TEXT,
      priority TEXT DEFAULT 'normal', -- baja, normal, alta, urgente
      status TEXT DEFAULT 'abierto', -- abierto, en_progreso, cerrado
      assigned_to TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (reported_by) REFERENCES residents(id),
      FOREIGN KEY (unit_id) REFERENCES units(id),
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    );

    -- Tabla de visitantes
    CREATE TABLE IF NOT EXISTS visitors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      id_number TEXT,
      phone TEXT,
      unit_to_visit TEXT NOT NULL,
      visitor_date DATETIME NOT NULL,
      check_in_time DATETIME,
      check_out_time DATETIME,
      purpose TEXT,
      authorized_by TEXT,
      vehicle_plate TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (authorized_by) REFERENCES residents(id)
    );

    -- Tabla de bitácora de seguridad
    CREATE TABLE IF NOT EXISTS security_log (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL, -- ingreso, salida, alerta, incidente
      description TEXT,
      location TEXT,
      reported_by TEXT,
      severity TEXT DEFAULT 'normal', -- normal, grave
      event_date DATETIME NOT NULL,
      resolved BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabla de comunicados
    CREATE TABLE IF NOT EXISTS communications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL, -- comunicado, notificacion, convocatoria, circular
      target_audience TEXT DEFAULT 'todos', -- todos, propietarios, residentes
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      published_at DATETIME,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    -- Tabla de asambleas
    CREATE TABLE IF NOT EXISTS assemblies (
      id TEXT PRIMARY KEY,
      assembly_date DATETIME NOT NULL,
      assembly_type TEXT, -- ordinaria, extraordinaria
      called_by TEXT NOT NULL,
      description TEXT,
      order_of_business TEXT,
      quorum_required DECIMAL(5, 2),
      status TEXT DEFAULT 'convocada', -- convocada, realizada, cancelada
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (called_by) REFERENCES users(id)
    );

    -- Tabla de votaciones
    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      assembly_id TEXT NOT NULL,
      voter_id TEXT NOT NULL,
      vote_option TEXT NOT NULL, -- si, no, abstención
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assembly_id) REFERENCES assemblies(id),
      FOREIGN KEY (voter_id) REFERENCES residents(id)
    );

    -- Tabla de actas de asamblea
    CREATE TABLE IF NOT EXISTS assembly_minutes (
      id TEXT PRIMARY KEY,
      assembly_id TEXT NOT NULL,
      attendance_count INTEGER,
      quorum_met BOOLEAN,
      minutes_content TEXT,
      resolutions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assembly_id) REFERENCES assemblies(id)
    );

    -- Tabla de empleados (guardias, conserjes, etc.)
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      id_number TEXT,
      position TEXT NOT NULL, -- guardia, conserje, limpieza, mantenimiento
      hire_date DATETIME NOT NULL,
      salary DECIMAL(12, 2),
      contract_file TEXT,
      active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabla de turnos
    CREATE TABLE IF NOT EXISTS shifts (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      shift_date DATETIME NOT NULL,
      start_time TEXT,
      end_time TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    -- Tabla de documentos
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      document_type TEXT NOT NULL, -- escritura, contrato, cedula, autorizacion, reglamento
      related_entity_type TEXT, -- resident, unit, supplier
      related_entity_id TEXT,
      file_path TEXT,
      file_name TEXT,
      upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      expiration_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Crear índices para mejorar rendimiento
    CREATE INDEX IF NOT EXISTS idx_residents_email ON residents(email);
    CREATE INDEX IF NOT EXISTS idx_residents_id_number ON residents(id_number);
    CREATE INDEX IF NOT EXISTS idx_units_status ON units(status);
    CREATE INDEX IF NOT EXISTS idx_billing_unit_id ON billing(unit_id);
    CREATE INDEX IF NOT EXISTS idx_billing_paid ON billing(paid);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
    CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_requests(status);
    CREATE INDEX IF NOT EXISTS idx_assemblies_date ON assemblies(assembly_date);
  `);

  console.log('Base de datos inicializada correctamente');
}
