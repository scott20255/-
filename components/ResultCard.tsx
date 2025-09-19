import React, { useState, useMemo } from 'react';
import { Refusal } from '../types';
import { ClipboardIcon, CheckIcon, SpeakerWaveIcon } from './Icons';

interface ResultCardProps {
  refusal: Refusal;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
}

const getScoreColorClasses = (score: number) => {
  if (score >= 80) {
    return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
  }
  if (score >= 60) {
    return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
  }
  return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
};

const ResultCard: React.FC<ResultCardProps> = ({ refusal, onSpeak, isSpeaking }) => {
  const [isCopied, setIsCopied] = useState(false);

  const scoreColorClasses = useMemo(() => getScoreColorClasses(refusal.score), [refusal.score]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card's onClick from firing
    navigator.clipboard.writeText(refusal.text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => console.error('Failed to copy text: ', err));
  };

  return (
    <div 
      onClick={() => onSpeak(refusal.text)}
      className={`p-5 bg-slate-800 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group ${isSpeaking ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold">{refusal.tone}</h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${scoreColorClasses}`}>
          <span>상처 안 줌 점수</span>
          <span className="text-lg">{refusal.score}</span>
        </div>
      </div>
      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{refusal.text}</p>
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onSpeak(refusal.text); }}
          className={`p-2 rounded-full bg-slate-700/50 text-slate-400 transition-all duration-200 ${isSpeaking ? 'text-purple-400' : 'opacity-0 group-hover:opacity-100'}`}
          aria-label={isSpeaking ? "Speaking" : "Speak text"}
        >
          <SpeakerWaveIcon className={`w-5 h-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
        </button>
        <button
          onClick={handleCopy}
          className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/70 text-slate-400 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
          aria-label="Copy to clipboard"
        >
          {isCopied ? <CheckIcon className="w-5 h-5 text-teal-400" /> : <ClipboardIcon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default ResultCard;