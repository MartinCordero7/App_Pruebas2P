import { getDatabase } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export async function createCommunication(req, res) {
  try {
    const { title, content, type, targetAudience } = req.body;

    if (!title || !content || !type) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const db = await getDatabase();
    const commId = uuidv4();

    await db.run(
      `INSERT INTO communications (id, title, content, type, target_audience, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [commId, title, content, type, targetAudience || 'todos', req.user.id]
    );

    res.status(201).json({ success: true, id: commId });
  } catch (error) {
    console.error('Error creando comunicación:', error);
    res.status(500).json({ error: 'Error creando comunicación' });
  }
}

export async function getCommunications(req, res) {
  try {
    const { type, published } = req.query;
    const db = await getDatabase();

    let query = `SELECT c.*, u.username as created_by_name 
                 FROM communications c 
                 JOIN users u ON c.created_by = u.id 
                 WHERE 1=1`;
    const params = [];

    if (type) {
      query += ' AND c.type = ?';
      params.push(type);
    }

    if (published === 'true') {
      query += ' AND c.published_at IS NOT NULL';
    }

    query += ' ORDER BY c.created_at DESC';
    const communications = await db.all(query, params);
    res.json(communications);
  } catch (error) {
    console.error('Error obteniendo comunicaciones:', error);
    res.status(500).json({ error: 'Error obteniendo comunicaciones' });
  }
}

export async function publishCommunication(req, res) {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    await db.run(
      'UPDATE communications SET published_at = ? WHERE id = ?',
      [new Date().toISOString(), id]
    );

    res.json({ success: true, message: 'Comunicación publicada' });
  } catch (error) {
    console.error('Error publicando comunicación:', error);
    res.status(500).json({ error: 'Error publicando comunicación' });
  }
}

export async function deleteCommunication(req, res) {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    await db.run('DELETE FROM communications WHERE id = ?', [id]);
    res.json({ success: true, message: 'Comunicación eliminada' });
  } catch (error) {
    console.error('Error eliminando comunicación:', error);
    res.status(500).json({ error: 'Error eliminando comunicación' });
  }
}

export async function recordVisitor(req, res) {
  try {
    const { name, idNumber, phone, unitToVisit, purpose, authorizedBy, vehiclePlate } = req.body;

    if (!name || !unitToVisit) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const db = await getDatabase();
    const visitorId = uuidv4();

    await db.run(
      `INSERT INTO visitors (id, name, id_number, phone, unit_to_visit, visitor_date, purpose, authorized_by, vehicle_plate, check_in_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [visitorId, name, idNumber || null, phone || null, unitToVisit, new Date().toISOString(), purpose || null, authorizedBy || null, vehiclePlate || null, new Date().toISOString()]
    );

    res.status(201).json({ success: true, id: visitorId });
  } catch (error) {
    console.error('Error registrando visitante:', error);
    res.status(500).json({ error: 'Error registrando visitante' });
  }
}

export async function recordSecurityEvent(req, res) {
  try {
    const { eventType, description, location, severity } = req.body;

    if (!eventType) {
      return res.status(400).json({ error: 'Tipo de evento requerido' });
    }

    const db = await getDatabase();
    const eventId = uuidv4();

    await db.run(
      `INSERT INTO security_log (id, event_type, description, location, severity, event_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [eventId, eventType, description || null, location || null, severity || 'normal', new Date().toISOString()]
    );

    res.status(201).json({ success: true, id: eventId });
  } catch (error) {
    console.error('Error registrando evento de seguridad:', error);
    res.status(500).json({ error: 'Error registrando evento de seguridad' });
  }
}

export async function getSecurityLog(req, res) {
  try {
    const { eventType, severity } = req.query;
    const db = await getDatabase();

    let query = 'SELECT * FROM security_log WHERE 1=1';
    const params = [];

    if (eventType) {
      query += ' AND event_type = ?';
      params.push(eventType);
    }

    if (severity) {
      query += ' AND severity = ?';
      params.push(severity);
    }

    query += ' ORDER BY event_date DESC';
    const events = await db.all(query, params);
    res.json(events);
  } catch (error) {
    console.error('Error obteniendo bitácora de seguridad:', error);
    res.status(500).json({ error: 'Error obteniendo bitácora de seguridad' });
  }
}
