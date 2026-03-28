import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export const getFlashModel = () => genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
export const getProModel = () => genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

/** Gọi Gemini và parse JSON từ response */
export async function callGeminiJSON<T = any>(prompt: string, isPro = false): Promise<T> {
  const model = isPro ? getProModel() : getFlashModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
  const jsonStr = (jsonMatch[1] || text).trim();
  return JSON.parse(jsonStr) as T;
}

/** Gọi Gemini và trả về text thuần */
export async function callGeminiText(prompt: string, isPro = false): Promise<string> {
  const model = isPro ? getProModel() : getFlashModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export const getGeminiModel = (modelName: string = 'gemini-1.5-flash') => {
  return genAI.getGenerativeModel({ model: modelName });
};

export const analyzeWriting = async (promptGoal: string, userContent: string) => {
  const model = getGeminiModel();

  const systemPrompt = `
    You are an expert English teacher (IELTS/TOEIC examiner). 
    Your task is to analyze a student's writing based on the following task: "${promptGoal}".
    
    The criteria for scoring are:
    1. Grammar (25%)
    2. Vocabulary (25%)
    3. Coherence & Cohesion (25%)
    4. Task Achievement (25%)
    
    Please provide a detailed feedback in JSON format:
    {
      "overallScore": number (0-100),
      "breakdown": {
        "grammar": number (0-100),
        "vocabulary": number (0-100),
        "coherence": number (0-100),
        "taskAchievement": number (0-100)
      },
      "feedback": {
        "strengths": string[],
        "weaknesses": string[],
        "suggestions": string[]
      },
      "annotatedContent": "the string with <error tips='explanation'>incorrect text</error> markers",
      "modelAnswer": "a high-quality example answer for this prompt"
    }
    
    Important: 
    - Keep feedback encouraging but professional.
    - Use Vietnamese for explanations/tips but English for the model answer.
    - Return ONLY the JSON object.
  `;

  const result = await model.generateContent([systemPrompt, userContent]);
  const response = await result.response;
  const text = response.text();

  // Extract JSON if AI surrounds it with markdown
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error('AI failed to return valid JSON feedback');
};
