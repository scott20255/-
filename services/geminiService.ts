import { GoogleGenAI, Type } from "@google/genai";
import { Tone, GenerationResult, Language, LANGUAGES } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    refusals: {
      type: Type.ARRAY,
      description: "생성된 4개의 거절 문구 배열",
      items: {
        type: Type.OBJECT,
        properties: {
          tone: { type: Type.STRING, description: "거절 문구의 톤 (예: 정중하게, 단호하게, 재치있게, 업무적으로)" },
          text: { type: Type.STRING, description: "생성된 거절 문구" },
          score: { type: Type.INTEGER, description: "상처 없는 거절 점수 (0-100)" },
        },
        required: ["tone", "text", "score"],
      },
    },
  },
  required: ["refusals"],
};

export async function generateRefusals(situation: string, selectedTone: Tone, language: Language): Promise<GenerationResult> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not set in environment variables.");
  }

  const languageName = LANGUAGES[language].name;

  const prompt = `
    CONTEXT:
    - You are a communication expert specializing in polite but clear refusal.
    - Your goal is to generate 4 refusal messages in 4 different tones: Polite, Direct, Witty, and Business.
    - The output must be in the language specified: ${languageName}.
    - The tone must be extremely conversational and natural for personal situations (Polite, Direct, Witty), and professional for business contexts. Avoid any stiff or robotic language.

    GOOD EXAMPLES (in Korean for personal context):
    - "자기야, 오늘은 너무 피곤해서 못 만날 것 같아. 내일 꼭 보자 ❤️"
    - "미안, 오늘 약속은 못 갈 것 같아. 담에 꼭 보자."
    - "고맙긴 한데 오늘은 집에 있고 싶어. 이해 좀 해줘."
    
    GOOD EXAMPLES (in Korean for business context):
    - "팀장님, 죄송하지만 주말 근무는 어려울 것 같습니다. 미리 계획된 개인 일정이 있습니다."
    - "제안은 감사하지만, 현재 저희 팀의 우선순위와는 맞지 않는 것 같습니다."

    TASK:
    - Situation: "${situation}"
    - My preferred primary tone: "${selectedTone}"
    - Language for response: "${languageName}"

    Generate 4 refusal messages (Polite, Direct, Witty, Business) for this situation in ${languageName}.
    Also provide a 'score' from 0-100 for how gentle the refusal is. The score for the 'Business' tone should reflect its professionalism and appropriateness in a work setting.
    Respond ONLY with the JSON object defined in the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.9,
        systemInstruction: `당신은 상대방의 기분을 상하지 않게 거절하는 법을 알려주는 커뮤니케이션 전문가입니다. 사용자가 선택한 언어(${languageName})로 상황에 맞는 자연스러운 말투로 거절 문구를 생성합니다. 개인적인 상황에서는 부드러운 구어체를, 업무적인 상황에서는 정중하고 프로페셔널한 어조를 사용해주세요. 딱딱하거나 AI 같은 말투는 피해주세요.`,
      },
    });

    const jsonString = response.text.trim();
    const parsedResult = JSON.parse(jsonString);
    return parsedResult as GenerationResult;

  } catch (error) {
    console.error("Error generating refusals:", error);
    throw new Error("AI 응답을 생성하는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
}
