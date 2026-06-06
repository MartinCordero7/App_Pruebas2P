import express from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getExpiringDocuments
} from '../controllers/documentsController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, requireRole(['admin', 'syndic']), uploadDocument);
router.get('/', authenticateToken, getDocuments);
router.get('/expiring', authenticateToken, getExpiringDocuments);
router.get('/:id', authenticateToken, getDocumentById);
router.put('/:id', authenticateToken, requireRole(['admin', 'syndic']), updateDocument);
router.delete('/:id', authenticateToken, requireRole(['admin', 'syndic']), deleteDocument);

export default router;
