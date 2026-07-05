import express from 'express';
import {
  createMaintenanceRequest,
  getMaintenanceRequests,
  updateMaintenanceRequest,
  getMaintenanceSchedule
} from '../controllers/maintenanceController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createMaintenanceRequest);
router.get('/', authenticateToken, getMaintenanceRequests);
router.put('/:id', authenticateToken, requireRole(['admin', 'syndic']), updateMaintenanceRequest);
router.get('/schedule', authenticateToken, getMaintenanceSchedule);

export default router;
