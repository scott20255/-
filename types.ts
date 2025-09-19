export enum Tone {
  Polite = '정중하게',
  Direct = '단호하게',
  Witty = '재치있게',
  Business = '업무적으로',
}

export interface Refusal {
  tone: string;
  text: string;
  score: number;
}

export interface GenerationResult {
  refusals: Refusal[];
}

export type Language = 'ko' | 'en' | 'ja' | 'zh';

export const LANGUAGES: Record<Language, { name: string, code: string }> = {
  ko: { name: '한국어', code: 'ko-KR' },
  en: { name: 'English', code: 'en-US' },
  ja: { name: '日本語', code: 'ja-JP' },
  zh: { name: '中文', code: 'zh-CN' },
};
