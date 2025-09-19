import React from 'react';
import { Refusal } from '../types';
import ResultCard from './ResultCard';
import { TrophyIcon } from './Icons';

interface HallOfFameProps {
  refusals: Refusal[];
  onSpeak: (text: string) => void;
  speakingText: string | null;
}

const HallOfFame: React.FC<HallOfFameProps> = ({ refusals, onSpeak, speakingText }) => {
  if (refusals.length === 0) {
    return (
      <div className="text-center p-8 bg-slate-800/50 rounded-lg text-slate-400">
        <TrophyIcon className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">명예의 전당이 비어있어요</h3>
        <p>점수가 90점 이상인 멋진 거절 문구들이 이곳에 저장됩니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {refusals.map((refusal, index) => (
        <ResultCard 
          key={`${index}-${refusal.text}`}
          refusal={refusal} 
          onSpeak={onSpeak}
          isSpeaking={speakingText === refusal.text}
        />
      ))}
    </div>
  );
};

export default HallOfFame;
