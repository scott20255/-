import { useState, useCallback, useEffect } from 'react';

const synth = window.speechSynthesis;

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenText, setSpokenText] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const getVoices = () => {
      const voiceList = synth.getVoices();
      if (voiceList.length > 0) {
        setVoices(voiceList);
      }
    };
    
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = getVoices;
    }
    getVoices(); // Initial call for browsers that load voices upfront
  }, []);

  const speak = useCallback((text: string, lang: string) => {
    if (!synth) {
      console.warn('Speech synthesis not supported');
      return;
    }

    if (synth.speaking && spokenText === text) {
      synth.cancel();
      return;
    }
    
    if (synth.speaking) {
      synth.cancel();
    }

    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;

        // Find the best voice for the language
        const preferredVoices = voices.filter(v => v.lang.startsWith(lang.split('-')[0]));
        // Prioritize high-quality native voices if available
        const nativeVoice = preferredVoices.find(v => v.localService && (v.name.includes('Google') || v.name.includes('Apple') || v.name.includes('Microsoft')));
        const specificKoreanVoice = preferredVoices.find(v => v.name === 'Yuna' || v.name === 'Google 한국의');
        
        utterance.voice = specificKoreanVoice || nativeVoice || preferredVoices[0] || null;

        utterance.pitch = 1;
        utterance.rate = 1;

        utterance.onstart = () => {
            setIsSpeaking(true);
            setSpokenText(text);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setSpokenText(null);
        };
        
        utterance.onerror = (e) => {
            console.error('Speech synthesis error', e);
            setIsSpeaking(false);
            setSpokenText(null);
        };

        synth.speak(utterance);
    }, 100);
  }, [spokenText, voices]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (synth && synth.speaking) {
        synth.cancel();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      handleBeforeUnload(); // Also cancel on unmount
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return { speak, isSpeaking, spokenText };
};
