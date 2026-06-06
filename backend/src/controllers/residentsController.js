import { getDatabase } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export async function createResident(req, res) {
  try {
    const { firstName, lastName, email, phone, idNumber, idType, relationship, address, city, state, postalCode, userId } = req.body;

    if (!firstName || !lastName || !idNumber) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const db = await getDatabase();
    const residentId = uuidv4();

    await db.run(
      `INSERT INTO residents (id, user_id, first_name, last_name, email, phone, id_number, id_type, relationship, address, city, state, postal_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [residentId, userId || null, firstName, lastName, email || null, phone || null, idNumber, idType || 'cedula', relationship || 'residente', address || null, city || null, state || null, postalCode || null]
    );

    res.status(201).json({
      success: true,
      id: residentId,
      message: 'Residente creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando residente:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'El número de identificación ya existe' });
    }
    res.status(500).json({ error: 'Error creando residente' });
  }
}

export async function getResidents(req, res) {
  try {
    const { relationship, search } = req.query;
    const db = await getDatabase();

    let query = 'SELECT * FROM residents WHERE 1=1';
    const params = [];

    if (relationship) {
      query += ' AND relationship = ?';
      params.push(relationship);
    }

    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR id_number LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const residents = await db.all(query, params);
    res.json(residents);
  } catch (error) {
    console.error('Error obteniendo residentes:', error);
    res.status(500).json({ error: 'Error obteniendo residentes' });
  }
}

export async function getResidentById(req, res) {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const resident = await db.get('SELECT * FROM residents WHERE id = ?', [id]);
    if (!resident) {
      return res.status(404).json({ error: 'Residente no encontrado' });
    }

    res.json(resident);
  } catch (error) {
    console.error('Error obteniendo residente:', error);
    res.status(500).json({ error: 'Error obteniendo residente' });
  }
}

export async function updateResident(req, res) {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, idNumber, idType, relationship, address, city, state, postalCode } = req.body;

    const db = await getDatabase();

    await db.run(
      `UPDATE residents 
       SET first_name = ?, last_name = ?, email = ?, phone = ?, id_number = ?, id_type = ?, relationship = ?, address = ?, city = ?, state = ?, postal_code = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [firstName, lastName, email, phone, idNumber, idType, relationship, address, city, state, postalCode, id]
    );

    res.json({ success: true, message: 'Residente actualizado' });
  } catch (error) {
    console.error('Error actualizando residente:', error);
    res.status(500).json({ error: 'Error actualizando residente' });
  }
}

export async function deleteResident(req, res) {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    await db.run('DELETE FROM residents WHERE id = ?', [id]);
    res.json({ success: true, message: 'Residente eliminado' });
  } catch (error) {
    console.error('Error eliminando residente:', error);
    res.status(500).json({ error: 'Error eliminando residente' });
  }
}

export async function getResidentBalance(req, res) {
  try {
    const { residentId } = req.params;
    const db = await getDatabase();

    // Obtener unidades del residente
    const units = await db.all('SELECT id FROM units WHERE owner_id = ?', [residentId]);
    const unitIds = units.map(u => u.id);

    if (unitIds.length === 0) {
      return res.json({ totalDebt: 0, units: [] });
    }

    const placeholders = unitIds.map(() => '?').join(',');
    const billing = await db.all(
      `SELECT * FROM billing WHERE unit_id IN (${placeholders}) AND paid = 0`,
      unitIds
    );

    const totalDebt = billing.reduce((sum, b) => sum + parseFloat(b.amount || 0) + parseFloat(b.interest_amount || 0), 0);

    res.json({
      totalDebt,
      pendingBills: billing.length,
      units: unitIds,
      details: billing
    });
  } catch (error) {
    console.error('Error obteniendo saldo:', error);
    res.status(500).json({ error: 'Error obteniendo saldo' });
  }
}
