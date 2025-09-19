import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResultCard from './components/ResultCard';
import Loader from './components/Loader';
import HallOfFame from './components/HallOfFame';
import { Tone, Refusal, Language, LANGUAGES } from './types';
import { generateRefusals } from './services/geminiService';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { PencilSquareIcon, TrophyIcon } from './components/Icons';

type View = 'generator' | 'hallOfFame';

const App: React.FC = () => {
  const [results, setResults] = useState<Refusal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('generator');
  const [hallOfFame, setHallOfFame] = useState<Refusal[]>([]);
  const [language, setLanguage] = useState<Language>('ko');
  
  const { speak, isSpeaking, spokenText } = useSpeechSynthesis();

  const HALL_OF_FAME_KEY = 'aiRefusalMaker_hallOfFame_v2';

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HALL_OF_FAME_KEY);
      if (saved) {
        setHallOfFame(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(HALL_OF_FAME_KEY, JSON.stringify(hallOfFame));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  }, [hallOfFame]);

  const handleGenerate = useCallback(async (situation: string, tone: Tone, lang: Language) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    setResults([]);
    try {
      const result = await generateRefusals(situation, tone, lang);
      setResults(result.refusals);

      if (result.refusals.length > 0) {
        speak(result.refusals[0].text, LANGUAGES[lang].code);
      }

      const highScorers = result.refusals.filter(r => r.score >= 90);
      if (highScorers.length > 0) {
        setHallOfFame(prev => {
          const newEntries = highScorers.filter(newItem => !prev.some(existingItem => existingItem.text === newItem.text));
          return [...newEntries, ...prev];
        });
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, speak]);

  const handleSpeak = useCallback((text: string) => {
    speak(text, LANGUAGES[language].code);
  }, [language, speak]);

  const renderContent = () => {
    if (view === 'hallOfFame') {
      return <HallOfFame refusals={hallOfFame} onSpeak={handleSpeak} speakingText={spokenText} />;
    }

    if (isLoading && results.length === 0) return <Loader />;
    if (error) {
      return (
        <div className="text-center p-8 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
          <h3 className="text-xl font-bold mb-2">오류 발생</h3>
          <p>{error}</p>
        </div>
      );
    }
    if (results.length > 0) {
      return (
        <div className="space-y-4">
          {results.map((refusal, index) => (
            <ResultCard 
              key={index} 
              refusal={refusal} 
              onSpeak={handleSpeak}
              isSpeaking={isSpeaking && spokenText === refusal.text}
            />
          ))}
        </div>
      );
    }
    return (
      <div className="text-center p-8 bg-slate-800/50 rounded-lg text-slate-400">
        <h3 className="text-xl font-bold mb-2">결과를 기다리고 있어요</h3>
        <p>거절할 상황과 원하는 톤을 선택하고 입력을 시작해주세요.</p>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
      <div className="container mx-auto px-4 py-8">
        <Header />
        <main className="mt-8">
          <InputForm 
            onSubmit={handleGenerate} 
            isLoading={isLoading}
            language={language}
            onLanguageChange={setLanguage}
          />
          
          <div className="w-full max-w-4xl mx-auto mt-12">
            <div className="flex justify-center mb-8 border-b border-slate-700">
                <button 
                  onClick={() => setView('generator')}
                  className={`flex items-center gap-2 py-3 px-6 font-medium border-b-2 transition-colors duration-200 ${view === 'generator' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                >
                  <PencilSquareIcon className="w-5 h-5"/>
                  생성하기
                </button>
                <button
                  onClick={() => setView('hallOfFame')}
                  className={`flex items-center gap-2 py-3 px-6 font-medium border-b-2 transition-colors duration-200 ${view === 'hallOfFame' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                >
                  <TrophyIcon className="w-5 h-5"/>
                  명예의 전당
                  {hallOfFame.length > 0 && <span className="bg-purple-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{hallOfFame.length}</span>}
                </button>
            </div>
            {renderContent()}
          </div>
        </main>
        <footer className="text-center mt-16 text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} AI Refusal Maker. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
