import express from 'express';
import {
  createAssembly,
  getAssemblies,
  recordVote,
  getVotingResults,
  recordAssemblyMinutes,
  getAssemblyMinutes
} from '../controllers/assembliesController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, requireRole(['admin', 'syndic']), createAssembly);
router.get('/', authenticateToken, getAssemblies);
router.post('/vote', authenticateToken, recordVote);
router.get('/:assemblyId/results', authenticateToken, getVotingResults);
router.post('/minutes', authenticateToken, requireRole(['admin', 'syndic']), recordAssemblyMinutes);
router.get('/:assemblyId/minutes', authenticateToken, getAssemblyMinutes);

export default router;
