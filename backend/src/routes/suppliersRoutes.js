import express from 'express';
import {
  createSupplier,
  getSuppliers,
  createPurchaseOrder,
  getPurchaseOrders,
  updatePurchaseOrderStatus
} from '../controllers/suppliersController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, requireRole(['admin', 'syndic']), createSupplier);
router.get('/', authenticateToken, getSuppliers);
router.post('/order', authenticateToken, requireRole(['admin', 'syndic']), createPurchaseOrder);
router.get('/orders', authenticateToken, getPurchaseOrders);
router.put('/order/:id/status', authenticateToken, requireRole(['admin', 'syndic']), updatePurchaseOrderStatus);

export default router;
