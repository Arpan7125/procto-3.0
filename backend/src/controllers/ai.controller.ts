import { Request, Response } from 'express';
import { z } from 'zod';
import { generateQuestionsFromAI } from '../services/ai.service';

const generateRequestSchema = z.object({
  prompt: z.string().min(3, 'Prompt must be at least 3 characters long'),
  count: z.number().min(1).max(50).default(3),
  type: z.string().default('ANY').transform((val) => {
    const valid = ['MCQ', 'TRUE_FALSE', 'SUBJECTIVE', 'ANY'];
    return valid.includes(val) ? val : 'ANY';
  }),
  difficulty: z.string().default('ANY').transform((val) => {
    const valid = ['EASY', 'MEDIUM', 'HARD', 'ANY'];
    return valid.includes(val) ? val : 'ANY';
  })
});

export const generateQuestions = async (req: Request, res: Response) => {
  try {
    const validatedData = generateRequestSchema.parse(req.body);

    const questions = await generateQuestionsFromAI(
      validatedData.prompt,
      validatedData.count,
      validatedData.type,
      validatedData.difficulty
    );

    res.json({ questions });
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: error.message || 'An error occurred while generating questions' });
  }
};
