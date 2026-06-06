import { getDatabase } from './config/database.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

async function seedDatabase() {
  try {
    console.log('Iniciando seeding de datos...');
    const db = await getDatabase();

    // Verificar si ya existe el usuario admin
    const adminExists = await db.get('SELECT id FROM users WHERE username = ?', ['admin']);
    
    if (!adminExists) {
      const userId = uuidv4();
      const hashedPassword = await bcrypt.hash('admin123', 10);

      await db.run(
        `INSERT INTO users (id, username, email, password, first_name, last_name, role) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, 'admin', 'admin@condominio.local', hashedPassword, 'Admin', 'Sistema', 'admin']
      );

      console.log('✅ Usuario admin creado exitosamente');
      console.log('   Usuario: admin');
      console.log('   Contraseña: admin123');
    } else {
      console.log('✅ Usuario admin ya existe');
    }

    // Crear algunos datos de prueba
    const residentsExist = await db.get('SELECT id FROM residents LIMIT 1');
    
    if (!residentsExist) {
      // Crear residentes de prueba
      const resident1Id = uuidv4();
      const resident2Id = uuidv4();

      await db.run(
        `INSERT INTO residents (id, first_name, last_name, email, phone, id_number, id_type, relationship) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [resident1Id, 'Juan', 'Pérez', 'juan@example.com', '3001234567', '1234567890', 'cedula', 'propietario']
      );

      await db.run(
        `INSERT INTO residents (id, first_name, last_name, email, phone, id_number, id_type, relationship) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [resident2Id, 'María', 'García', 'maria@example.com', '3009876543', '0987654321', 'cedula', 'residente']
      );

      // Crear unidades de prueba
      const unit1Id = uuidv4();
      const unit2Id = uuidv4();

      await db.run(
        `INSERT INTO units (id, unit_number, unit_type, floor, area, aliquot, status, owner_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [unit1Id, '101', 'departamento', '1', '80.50', '0.05', 'ocupado', resident1Id]
      );

      await db.run(
        `INSERT INTO units (id, unit_number, unit_type, floor, area, aliquot, status, owner_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [unit2Id, '102', 'departamento', '1', '90.00', '0.06', 'ocupado', resident2Id]
      );

      console.log('✅ Datos de prueba creados exitosamente');
    }

    console.log('✨ Seeding completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
