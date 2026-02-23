import express from 'express';
import { generateQuestions } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Route to generate questions. Protected by JWT.
router.post('/generate', authenticate as express.RequestHandler, generateQuestions as any);

export default router;
