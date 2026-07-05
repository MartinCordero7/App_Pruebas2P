import { getDatabase } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export async function createAssembly(req, res) {
  try {
    const { assemblyDate, assemblyType, description, orderOfBusiness, quorumRequired } = req.body;

    if (!assemblyDate) {
      return res.status(400).json({ error: 'Fecha de asamblea requerida' });
    }

    const numericQuorum = parseFloat(quorumRequired);
    if (quorumRequired !== undefined && (isNaN(numericQuorum) || numericQuorum < 0 || numericQuorum > 100)) {
      return res.status(400).json({ error: 'El quórum requerido debe ser un porcentaje entre 0 y 100' });
    }

    const db = await getDatabase();
    const assemblyId = uuidv4();

    await db.run(
      `INSERT INTO assemblies (id, assembly_date, assembly_type, called_by, description, order_of_business, quorum_required, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'convocada')`,
      [assemblyId, assemblyDate, assemblyType || 'ordinaria', req.user.id, description || null, orderOfBusiness || null, isNaN(numericQuorum) ? 50 : numericQuorum]
    );

    res.status(201).json({ success: true, id: assemblyId });
  } catch (error) {
    console.error('Error creando asamblea:', error);
    res.status(500).json({ error: 'Error creando asamblea' });
  }
}

export async function getAssemblies(req, res) {
  try {
    const { status } = req.query;
    const db = await getDatabase();

    let query = `SELECT a.*, u.username as called_by_name 
                 FROM assemblies a 
                 JOIN users u ON a.called_by = u.id 
                 WHERE 1=1`;
    const params = [];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.assembly_date DESC';
    const assemblies = await db.all(query, params);
    res.json(assemblies);
  } catch (error) {
    console.error('Error obteniendo asambleas:', error);
    res.status(500).json({ error: 'Error obteniendo asambleas' });
  }
}

export async function recordVote(req, res) {
  try {
    const { assemblyId, voterId, voteOption } = req.body;

    if (!assemblyId || !voterId || !voteOption) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const db = await getDatabase();
    const voteId = uuidv4();

    // Verificar si el votante ya ha votado
    const existing = await db.get(
      'SELECT id FROM votes WHERE assembly_id = ? AND voter_id = ?',
      [assemblyId, voterId]
    );

    if (existing) {
      return res.status(409).json({ error: 'El votante ya ha emitido su voto' });
    }

    await db.run(
      `INSERT INTO votes (id, assembly_id, voter_id, vote_option)
       VALUES (?, ?, ?, ?)`,
      [voteId, assemblyId, voterId, voteOption]
    );

    res.status(201).json({ success: true, id: voteId });
  } catch (error) {
    console.error('Error registrando voto:', error);
    res.status(500).json({ error: 'Error registrando voto' });
  }
}

export async function getVotingResults(req, res) {
  try {
    const { assemblyId } = req.params;
    const db = await getDatabase();

    const results = await db.all(`
      SELECT vote_option, COUNT(*) as count
      FROM votes
      WHERE assembly_id = ?
      GROUP BY vote_option
    `, [assemblyId]);

    const totalVotes = results.reduce((sum, r) => sum + r.count, 0);

    res.json({
      assemblyId,
      totalVotes,
      results: results.map(r => ({
        option: r.vote_option,
        count: r.count,
        percentage: totalVotes > 0 ? (r.count / totalVotes) * 100 : 0
      }))
    });
  } catch (error) {
    console.error('Error obteniendo resultados de votación:', error);
    res.status(500).json({ error: 'Error obteniendo resultados de votación' });
  }
}

export async function recordAssemblyMinutes(req, res) {
  try {
    const { assemblyId, attendanceCount, quorumMet, minutesContent, resolutions } = req.body;

    if (!assemblyId) {
      return res.status(400).json({ error: 'ID de asamblea requerido' });
    }

    const db = await getDatabase();
    const minutesId = uuidv4();

    await db.run(
      `INSERT INTO assembly_minutes (id, assembly_id, attendance_count, quorum_met, minutes_content, resolutions)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [minutesId, assemblyId, attendanceCount || 0, quorumMet ? 1 : 0, minutesContent || null, resolutions || null]
    );

    // Actualizar estado de asamblea
    await db.run(
      'UPDATE assemblies SET status = ? WHERE id = ?',
      ['realizada', assemblyId]
    );

    res.status(201).json({ success: true, id: minutesId });
  } catch (error) {
    console.error('Error registrando acta:', error);
    res.status(500).json({ error: 'Error registrando acta' });
  }
}

export async function getAssemblyMinutes(req, res) {
  try {
    const { assemblyId } = req.params;
    const db = await getDatabase();

    const minutes = await db.get(
      'SELECT * FROM assembly_minutes WHERE assembly_id = ?',
      [assemblyId]
    );

    if (!minutes) {
      return res.status(404).json({ error: 'Acta no encontrada' });
    }

    res.json(minutes);
  } catch (error) {
    console.error('Error obteniendo acta:', error);
    res.status(500).json({ error: 'Error obteniendo acta' });
  }
}
