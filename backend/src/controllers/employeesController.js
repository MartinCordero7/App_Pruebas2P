import { getDatabase } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export async function getEmployees(req, res) {
  try {
    const db = await getDatabase();
    const employees = await db.all('SELECT * FROM employees ORDER BY created_at DESC');
    res.json(employees);
  } catch (error) {
    console.error('Error obteniendo empleados:', error);
    res.status(500).json({ error: 'Error obteniendo empleados' });
  }
}

export async function createEmployee(req, res) {
  try {
    const { first_name, last_name, email, phone, position, salary, hire_date, status = 'activo' } = req.body;

    if (!first_name || !last_name || !position || salary === undefined || salary === null || !hire_date) {
      return res.status(400).json({ error: 'Faltan campos requeridos (Nombre, Apellido, Cargo, Salario o Fecha de Contratación)' });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Formato de correo electrónico inválido' });
    }

    if (phone && !/^\d{7,15}$/.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({ error: 'Formato de teléfono inválido (debe tener entre 7 y 15 dígitos)' });
    }

    const numericSalary = parseFloat(salary);
    if (isNaN(numericSalary) || numericSalary < 0) {
      return res.status(400).json({ error: 'El salario debe ser un número positivo' });
    }

    const db = await getDatabase();
    const employeeId = uuidv4();

    await db.run(
      `INSERT INTO employees (id, first_name, last_name, email, phone, position, salary, hire_date, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [employeeId, first_name, last_name, email || null, phone || null, position, numericSalary, hire_date, status === 'activo' ? 1 : 0]
    );

    res.status(201).json({
      success: true,
      id: employeeId,
      message: 'Empleado registrado exitosamente'
    });
  } catch (error) {
    console.error('Error creando empleado:', error);
    res.status(500).json({ error: 'Error creando empleado' });
  }
}

export async function deleteEmployee(req, res) {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const result = await db.run('DELETE FROM employees WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    res.json({ success: true, message: 'Empleado eliminado' });
  } catch (error) {
    console.error('Error eliminando empleado:', error);
    res.status(500).json({ error: 'Error eliminando empleado' });
  }
}
