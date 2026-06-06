import express from 'express';
import {
  createTransaction,
  getTransactions,
  getFinancialReport,
  getCashFlowReport,
  generateBalanceSheet
} from '../controllers/transactionsController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, requireRole(['admin', 'syndic']), createTransaction);
router.get('/', authenticateToken, getTransactions);
router.get('/report/financial', authenticateToken, requireRole(['admin', 'syndic']), getFinancialReport);
router.get('/report/cash-flow', authenticateToken, requireRole(['admin', 'syndic']), getCashFlowReport);
router.get('/report/balance-sheet', authenticateToken, requireRole(['admin', 'syndic']), generateBalanceSheet);

export default router;
