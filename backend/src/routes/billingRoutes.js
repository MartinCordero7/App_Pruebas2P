import express from 'express';
import {
  createBilling,
  generateMonthlyBilling,
  getBilling,
  recordPayment,
  getDelinquentReport,
  createPaymentAgreement,
  getPaymentAgreements,
  calculateInterest
} from '../controllers/billingController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, requireRole(['admin', 'syndic']), createBilling);
router.post('/generate-monthly', authenticateToken, requireRole(['admin', 'syndic']), generateMonthlyBilling);
router.get('/', authenticateToken, getBilling);
router.post('/payment', authenticateToken, requireRole(['admin', 'syndic', 'resident']), recordPayment);
router.get('/delinquent-report', authenticateToken, requireRole(['admin', 'syndic']), getDelinquentReport);
router.post('/agreement', authenticateToken, requireRole(['admin', 'syndic']), createPaymentAgreement);
router.get('/agreement/list', authenticateToken, getPaymentAgreements);
router.post('/calculate-interest', authenticateToken, requireRole(['admin', 'syndic']), calculateInterest);

export default router;
