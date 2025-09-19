import React, { useState, useCallback, useEffect } from 'react';
import { Tone, Language, LANGUAGES } from '../types';
import { MicrophoneIcon, AutoAwesomeIcon } from './Icons';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface InputFormProps {
  onSubmit: (situation: string, tone: Tone, language: Language) => void;
  isLoading: boolean;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, language, onLanguageChange }) => {
  const [situation, setSituation] = useState('');
  const [tone, setTone] = useState<Tone>(Tone.Polite);
  // FIX: Replace NodeJS.Timeout with ReturnType<typeof setTimeout> for browser compatibility.
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleSpeechResult = useCallback((transcript: string) => {
    setSituation((prev) => (prev ? prev + ' ' + transcript : transcript).trim());
  }, []);

  const { isListening, toggleListening, isSpeechRecognitionSupported } = useSpeechRecognition(handleSpeechResult, LANGUAGES[language].code);

  useEffect(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    if (situation.trim().length > 5) {
      const timeoutId = setTimeout(() => {
        onSubmit(situation, tone, language);
      }, 1500);
      setTypingTimeout(timeoutId);
    }

    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [situation, tone, language]);


  const getStatusMessage = () => {
    if (isLoading) {
      return (
        <>
          <svg className="animate-spin h-4 w-4 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>AI가 생각 중입니다...</span>
        </>
      );
    }
    if (situation.trim().length <= 5) {
      return <span>최소 5자 이상 입력해주세요.</span>;
    }
    return (
      <>
        <AutoAwesomeIcon className="w-4 h-4 text-teal-400" />
        <span>입력을 마치면 AI가 자동으로 생성합니다.</span>
      </>
    );
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="w-full max-w-2xl mx-auto space-y-6">
       <div>
        <label className="block text-lg font-medium text-slate-300 mb-3">
          언어 선택
        </label>
        <div className="flex flex-wrap gap-2">
            {(Object.keys(LANGUAGES) as Language[]).map(lang => (
                 <button
                 key={lang}
                 type="button"
                 onClick={() => onLanguageChange(lang)}
                 className={`py-2 px-4 rounded-full text-sm font-semibold transition duration-200 ${
                   language === lang
                     ? 'bg-purple-600 text-white shadow-md'
                     : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                 }`}
               >
                 {LANGUAGES[lang].name}
               </button>
            ))}
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="situation" className="block text-lg font-medium text-slate-300">
            어떤 상황인가요?
          </label>
          {isSpeechRecognitionSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors duration-200 ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              aria-label={isListening ? '음성 인식 중지' : '음성으로 입력하기'}
            >
              <MicrophoneIcon className="w-4 h-4" />
              <span>{isListening ? '인식 중...' : '음성 입력'}</span>
            </button>
          )}
        </div>
        <textarea
          id="situation"
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder="예) 친구의 갑작스러운 술 약속, 상사의 주말 근무 부탁 등"
          className="w-full h-32 p-4 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 resize-none placeholder-slate-500"
          required
        />
         <div className="h-5 mt-2 flex items-center justify-end text-xs text-slate-400 gap-2">
          {getStatusMessage()}
        </div>
      </div>

      <div>
        <label className="block text-lg font-medium text-slate-300 mb-2">
          어떤 톤으로 거절하고 싶으세요?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.values(Tone).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTone(t)}
              className={`py-3 px-4 rounded-lg text-center font-medium transition duration-200 ${
                tone === t
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
};

export default InputForm;
