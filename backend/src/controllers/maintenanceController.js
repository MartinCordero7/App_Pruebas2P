import { getDatabase } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export async function createMaintenanceRequest(req, res) {
  try {
    const { reportedBy, unitId, commonArea, issueType, description, priority } = req.body;

    if (!reportedBy || (!unitId && !commonArea) || !issueType) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const db = await getDatabase();
    const requestId = uuidv4();

    await db.run(
      `INSERT INTO maintenance_requests (id, reported_by, unit_id, common_area, issue_type, description, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'abierto')`,
      [requestId, reportedBy, unitId || null, commonArea || null, issueType, description || null, priority || 'normal']
    );

    res.status(201).json({ success: true, id: requestId });
  } catch (error) {
    console.error('Error creando solicitud de mantenimiento:', error);
    res.status(500).json({ error: 'Error creando solicitud de mantenimiento' });
  }
}

export async function getMaintenanceRequests(req, res) {
  try {
    const { status, priority, unitId } = req.query;
    const db = await getDatabase();

    let query = `SELECT mr.*, r.first_name as reporter_name, u.unit_number 
                 FROM maintenance_requests mr 
                 LEFT JOIN residents r ON mr.reported_by = r.id 
                 LEFT JOIN units u ON mr.unit_id = u.id 
                 WHERE 1=1`;
    const params = [];

    if (status) {
      query += ' AND mr.status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND mr.priority = ?';
      params.push(priority);
    }

    if (unitId) {
      query += ' AND mr.unit_id = ?';
      params.push(unitId);
    }

    query += ' ORDER BY mr.created_at DESC';
    const requests = await db.all(query, params);
    res.json(requests);
  } catch (error) {
    console.error('Error obteniendo solicitudes de mantenimiento:', error);
    res.status(500).json({ error: 'Error obteniendo solicitudes de mantenimiento' });
  }
}

export async function updateMaintenanceRequest(req, res) {
  try {
    const { id } = req.params;
    const { status, assignedTo, completedAt } = req.body;

    const db = await getDatabase();

    const updateFields = [];
    const params = [];

    if (status !== undefined) {
      updateFields.push('status = ?');
      params.push(status);
    }

    if (assignedTo !== undefined) {
      updateFields.push('assigned_to = ?');
      params.push(assignedTo);
    }

    if (completedAt !== undefined && status === 'cerrado') {
      updateFields.push('completed_at = ?');
      params.push(new Date().toISOString());
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await db.run(
      `UPDATE maintenance_requests SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ success: true, message: 'Solicitud actualizada' });
  } catch (error) {
    console.error('Error actualizando solicitud de mantenimiento:', error);
    res.status(500).json({ error: 'Error actualizando solicitud de mantenimiento' });
  }
}

export async function getMaintenanceSchedule(req, res) {
  try {
    const db = await getDatabase();

    const schedule = {
      elevators: { frequency: 'mensual', lastService: '2024-05-15', nextService: '2024-06-15' },
      pumps: { frequency: 'mensual', lastService: '2024-05-10', nextService: '2024-06-10' },
      gates: { frequency: 'trimestral', lastService: '2024-04-01', nextService: '2024-07-01' },
      cctv: { frequency: 'semestral', lastService: '2024-01-15', nextService: '2024-07-15' },
      gardens: { frequency: 'semanal', lastService: '2024-05-27', nextService: '2024-06-03' }
    };

    res.json(schedule);
  } catch (error) {
    console.error('Error obteniendo cronograma:', error);
    res.status(500).json({ error: 'Error obteniendo cronograma' });
  }
}
