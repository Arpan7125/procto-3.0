import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export interface GeneratedQuestion {
  text: string;
  type: 'MCQ' | 'TRUE_FALSE' | 'SUBJECTIVE';
  options?: string[];
  correctAnswer: string;
  marks: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export const generateQuestionsFromAI = async (
  prompt: string,
  count: number,
  type: string,
  difficulty: string
): Promise<GeneratedQuestion[]> => {
  if (!apiKey) {
    console.warn('Using mock AI response because GEMINI_API_KEY is not set.');
    return Array.from({ length: count }).map((_, i) => ({
      text: `Mock Generated Question ${i+1} for topic: ${prompt}`,
      type: type === 'ANY' ? 'MCQ' : type as any,
      options: type === 'MCQ' ? ['Option A', 'Option B', 'Option C', 'Option D'] : undefined,
      correctAnswer: type === 'MCQ' ? 'Option A' : 'Mock Answer key',
      marks: 1,
      difficulty: difficulty === 'ANY' ? 'EASY' : difficulty as any,
    }));
  }

  const aiPrompt = `
You are an expert exam question generator for a university platform. 
Generate exactly ${count} question(s) based on the following topic/prompt: "${prompt}"

Requirements:
- Difficulty level: ${difficulty}
- Question type: ${type}
- You MUST return a JSON object with a single "questions" array property. Do not include markdown formatting like \`\`\`json or \`\`\`. 
- Do not include any conversational text.

The JSON object must strictly follow this exact structure:
{
  "questions": [
    {
      "text": "The actual question text",
      "type": "${type === 'ANY' ? 'MCQ or TRUE_FALSE or SUBJECTIVE' : type}",
      "options": ["Option A", "Option B", "Option C", "Option D"], // Only include this array if type is MCQ. Max 4 options.
      "correctAnswer": "The exact text of the correct option (for MCQ/TRUE_FALSE) or a detailed rubric/key points (for SUBJECTIVE)",
      "marks": 1,
      "difficulty": "${difficulty === 'ANY' ? 'EASY or MEDIUM or HARD' : difficulty}"
    }
  ]
}
  `;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent(aiPrompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting if the AI ignores instructions
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedData = JSON.parse(cleanedText);
    const questions: GeneratedQuestion[] = parsedData.questions;

    // Validate structure roughly
    if (!Array.isArray(questions)) {
      throw new Error('AI did not return an array inside the questions property');
    }

    return questions;
  } catch (error) {
    console.error('Error generating questions from AI:', error);
    throw new Error('Failed to generate questions. Please try again or refine your prompt.');
  }
};
