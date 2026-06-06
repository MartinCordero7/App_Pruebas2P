import { getDatabase } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export async function createUnit(req, res) {
  try {
    const { unitNumber, unitType, floor, area, aliquot, status, ownerId, description } = req.body;

    if (!unitNumber || !unitType || !aliquot) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const db = await getDatabase();
    const unitId = uuidv4();

    await db.run(
      `INSERT INTO units (id, unit_number, unit_type, floor, area, aliquot, status, owner_id, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [unitId, unitNumber, unitType, floor || null, area || null, aliquot, status || 'ocupado', ownerId || null, description || null]
    );

    res.status(201).json({ success: true, id: unitId });
  } catch (error) {
    console.error('Error creando unidad:', error);
    res.status(500).json({ error: 'Error creando unidad' });
  }
}

export async function getUnits(req, res) {
  try {
    const { status, unitType, search } = req.query;
    const db = await getDatabase();

    let query = 'SELECT u.*, r.first_name, r.last_name FROM units u LEFT JOIN residents r ON u.owner_id = r.id WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND u.status = ?';
      params.push(status);
    }

    if (unitType) {
      query += ' AND u.unit_type = ?';
      params.push(unitType);
    }

    if (search) {
      query += ' AND (u.unit_number LIKE ? OR r.first_name LIKE ? OR r.last_name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const units = await db.all(query, params);
    res.json(units);
  } catch (error) {
    console.error('Error obteniendo unidades:', error);
    res.status(500).json({ error: 'Error obteniendo unidades' });
  }
}

export async function getUnitById(req, res) {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const unit = await db.get(
      'SELECT u.*, r.first_name, r.last_name, r.email FROM units u LEFT JOIN residents r ON u.owner_id = r.id WHERE u.id = ?',
      [id]
    );

    if (!unit) {
      return res.status(404).json({ error: 'Unidad no encontrada' });
    }

    res.json(unit);
  } catch (error) {
    console.error('Error obteniendo unidad:', error);
    res.status(500).json({ error: 'Error obteniendo unidad' });
  }
}

export async function updateUnit(req, res) {
  try {
    const { id } = req.params;
    const { unitNumber, unitType, floor, area, aliquot, status, ownerId, renterId, description } = req.body;

    const db = await getDatabase();

    await db.run(
      `UPDATE units 
       SET unit_number = ?, unit_type = ?, floor = ?, area = ?, aliquot = ?, status = ?, owner_id = ?, renter_id = ?, description = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [unitNumber, unitType, floor, area, aliquot, status, ownerId, renterId, description, id]
    );

    res.json({ success: true, message: 'Unidad actualizada' });
  } catch (error) {
    console.error('Error actualizando unidad:', error);
    res.status(500).json({ error: 'Error actualizando unidad' });
  }
}

export async function deleteUnit(req, res) {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    await db.run('DELETE FROM units WHERE id = ?', [id]);
    res.json({ success: true, message: 'Unidad eliminada' });
  } catch (error) {
    console.error('Error eliminando unidad:', error);
    res.status(500).json({ error: 'Error eliminando unidad' });
  }
}

export async function assignParkingSpace(req, res) {
  try {
    const { unitId, residentId, spaceNumber } = req.body;
    const db = await getDatabase();
    const parkingId = uuidv4();

    // Verificar si el espacio ya está asignado
    const existing = await db.get('SELECT id FROM parking_spaces WHERE space_number = ? AND status = ?', [spaceNumber, 'asignado']);
    if (existing) {
      return res.status(409).json({ error: 'Espacio de parqueo ya asignado' });
    }

    await db.run(
      'INSERT INTO parking_spaces (id, space_number, unit_id, resident_id, status) VALUES (?, ?, ?, ?, ?)',
      [parkingId, spaceNumber, unitId, residentId, 'asignado']
    );

    res.status(201).json({ success: true, id: parkingId });
  } catch (error) {
    console.error('Error asignando parqueo:', error);
    res.status(500).json({ error: 'Error asignando parqueo' });
  }
}

export async function getParkingSpaces(req, res) {
  try {
    const db = await getDatabase();
    const spaces = await db.all(
      'SELECT ps.*, u.unit_number, r.first_name, r.last_name FROM parking_spaces ps LEFT JOIN units u ON ps.unit_id = u.id LEFT JOIN residents r ON ps.resident_id = r.id'
    );
    res.json(spaces);
  } catch (error) {
    console.error('Error obteniendo parqueos:', error);
    res.status(500).json({ error: 'Error obteniendo parqueos' });
  }
}

export async function assignStorageRoom(req, res) {
  try {
    const { unitId, residentId, roomNumber } = req.body;
    const db = await getDatabase();
    const storageId = uuidv4();

    await db.run(
      'INSERT INTO storage_rooms (id, room_number, unit_id, resident_id, status) VALUES (?, ?, ?, ?, ?)',
      [storageId, roomNumber, unitId, residentId, 'asignado']
    );

    res.status(201).json({ success: true, id: storageId });
  } catch (error) {
    console.error('Error asignando bodega:', error);
    res.status(500).json({ error: 'Error asignando bodega' });
  }
}

export async function getStorageRooms(req, res) {
  try {
    const db = await getDatabase();
    const rooms = await db.all(
      'SELECT sr.*, u.unit_number, r.first_name, r.last_name FROM storage_rooms sr LEFT JOIN units u ON sr.unit_id = u.id LEFT JOIN residents r ON sr.resident_id = r.id'
    );
    res.json(rooms);
  } catch (error) {
    console.error('Error obteniendo bodegas:', error);
    res.status(500).json({ error: 'Error obteniendo bodegas' });
  }
}
