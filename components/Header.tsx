import React from 'react';
import { SparklesIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="py-8 text-center">
      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 text-transparent bg-clip-text flex items-center justify-center gap-3">
        <SparklesIcon className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
        싫다고 말해요(EASY REFUSAL)
      </h1>
      <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
        거절은 못하는 게 아니라, 방법을 모르는 것일뿐.
      </p>
    </header>
  );
};

export default Header;