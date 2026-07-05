import express from 'express';
import {
  createCommunication,
  getCommunications,
  publishCommunication,
  deleteCommunication,
  recordVisitor,
  recordSecurityEvent,
  getSecurityLog
} from '../controllers/communicationsController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Comunicaciones
router.post('/', authenticateToken, requireRole(['admin', 'syndic']), createCommunication);
router.get('/', authenticateToken, getCommunications);
router.put('/:id/publish', authenticateToken, requireRole(['admin', 'syndic']), publishCommunication);
router.delete('/:id', authenticateToken, requireRole(['admin', 'syndic']), deleteCommunication);

// Visitantes y seguridad
router.post('/visitor', authenticateToken, recordVisitor);
router.post('/security-event', authenticateToken, recordSecurityEvent);
router.get('/security-log', authenticateToken, requireRole(['admin', 'syndic', 'security']), getSecurityLog);

export default router;
