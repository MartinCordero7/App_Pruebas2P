import express from 'express';
import {
  createResident,
  getResidents,
  getResidentById,
  updateResident,
  deleteResident,
  getResidentBalance
} from '../controllers/residentsController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, requireRole(['admin', 'syndic']), createResident);
router.get('/', authenticateToken, getResidents);
router.get('/:id', authenticateToken, getResidentById);
router.get('/:residentId/balance', authenticateToken, getResidentBalance);
router.put('/:id', authenticateToken, requireRole(['admin', 'syndic']), updateResident);
router.delete('/:id', authenticateToken, requireRole(['admin', 'syndic']), deleteResident);

export default router;
