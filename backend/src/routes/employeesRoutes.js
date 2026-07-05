import express from 'express';
import {
  getEmployees,
  createEmployee,
  deleteEmployee
} from '../controllers/employeesController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getEmployees);
router.post('/', authenticateToken, requireRole(['admin', 'syndic']), createEmployee);
router.delete('/:id', authenticateToken, requireRole(['admin', 'syndic']), deleteEmployee);

export default router;
