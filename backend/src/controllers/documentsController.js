import { getDatabase } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export async function uploadDocument(req, res) {
  try {
    const { title, documentType, relatedEntityType, relatedEntityId, fileName, expirationDate } = req.body;

    if (!title || !documentType) {
      return res.status(400).json({ error: 'Título y tipo de documento requeridos' });
    }

    const db = await getDatabase();
    const docId = uuidv4();

    await db.run(
      `INSERT INTO documents (id, title, document_type, related_entity_type, related_entity_id, file_name, expiration_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [docId, title, documentType, relatedEntityType || null, relatedEntityId || null, fileName || null, expirationDate || null]
    );

    res.status(201).json({ success: true, id: docId });
  } catch (error) {
    console.error('Error subiendo documento:', error);
    res.status(500).json({ error: 'Error subiendo documento' });
  }
}

export async function getDocuments(req, res) {
  try {
    const { documentType, relatedEntityType, relatedEntityId } = req.query;
    const db = await getDatabase();

    let query = 'SELECT * FROM documents WHERE 1=1';
    const params = [];

    if (documentType) {
      query += ' AND document_type = ?';
      params.push(documentType);
    }

    if (relatedEntityType) {
      query += ' AND related_entity_type = ?';
      params.push(relatedEntityType);
    }

    if (relatedEntityId) {
      query += ' AND related_entity_id = ?';
      params.push(relatedEntityId);
    }

    query += ' ORDER BY upload_date DESC';
    const documents = await db.all(query, params);
    res.json(documents);
  } catch (error) {
    console.error('Error obteniendo documentos:', error);
    res.status(500).json({ error: 'Error obteniendo documentos' });
  }
}

export async function getDocumentById(req, res) {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const document = await db.get('SELECT * FROM documents WHERE id = ?', [id]);
    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    res.json(document);
  } catch (error) {
    console.error('Error obteniendo documento:', error);
    res.status(500).json({ error: 'Error obteniendo documento' });
  }
}

export async function updateDocument(req, res) {
  try {
    const { id } = req.params;
    const { title, documentType, expirationDate } = req.body;

    const db = await getDatabase();

    await db.run(
      'UPDATE documents SET title = ?, document_type = ?, expiration_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, documentType, expirationDate, id]
    );

    res.json({ success: true, message: 'Documento actualizado' });
  } catch (error) {
    console.error('Error actualizando documento:', error);
    res.status(500).json({ error: 'Error actualizando documento' });
  }
}

export async function deleteDocument(req, res) {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    await db.run('DELETE FROM documents WHERE id = ?', [id]);
    res.json({ success: true, message: 'Documento eliminado' });
  } catch (error) {
    console.error('Error eliminando documento:', error);
    res.status(500).json({ error: 'Error eliminando documento' });
  }
}

export async function getExpiringDocuments(req, res) {
  try {
    const db = await getDatabase();
    const daysAhead = 30; // Documentos que vencen en 30 días

    const documents = await db.all(`
      SELECT * FROM documents
      WHERE expiration_date IS NOT NULL
      AND expiration_date <= datetime('now', '+' || ? || ' days')
      AND expiration_date > datetime('now')
      ORDER BY expiration_date ASC
    `, [daysAhead]);

    res.json(documents);
  } catch (error) {
    console.error('Error obteniendo documentos próximos a vencer:', error);
    res.status(500).json({ error: 'Error obteniendo documentos próximos a vencer' });
  }
}
