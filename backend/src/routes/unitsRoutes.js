import express from 'express';
import {
  createUnit,
  getUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
  assignParkingSpace,
  getParkingSpaces,
  assignStorageRoom,
  getStorageRooms
} from '../controllers/unitsController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, requireRole(['admin', 'syndic']), createUnit);
router.get('/', authenticateToken, getUnits);
router.get('/:id', authenticateToken, getUnitById);
router.put('/:id', authenticateToken, requireRole(['admin', 'syndic']), updateUnit);
router.delete('/:id', authenticateToken, requireRole(['admin', 'syndic']), deleteUnit);

// Parqueaderos
router.post('/parking', authenticateToken, requireRole(['admin', 'syndic']), assignParkingSpace);
router.get('/parking/list', authenticateToken, getParkingSpaces);

// Bodegas
router.post('/storage', authenticateToken, requireRole(['admin', 'syndic']), assignStorageRoom);
router.get('/storage/list', authenticateToken, getStorageRooms);

export default router;
