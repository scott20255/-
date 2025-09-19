import React, { useState, useEffect } from 'react';

const messages = [
  'AI가 최적의 거절 문구를 찾고 있습니다...',
  '세련된 표현을 고르고 있어요...',
  '상처주지 않을 단어를 조합 중입니다...',
  '거절의 기술을 연마하는 중...',
];

const Loader: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-800/50 rounded-lg">
      <div className="relative">
        <div className="w-20 h-20 border-purple-200 border-4 rounded-full"></div>
        <div className="w-20 h-20 border-purple-700 border-t-4 animate-spin rounded-full absolute left-0 top-0"></div>
      </div>
      <p className="text-slate-300 text-lg mt-4 font-medium transition-opacity duration-500">{messages[messageIndex]}</p>
      <p className="text-slate-400 text-sm mt-1">잠시만 기다려주세요.</p>
    </div>
  );
};

export default Loader;