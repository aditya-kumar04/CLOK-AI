import { useState, useEffect, useCallback } from 'react';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const [synthesis, setSynthesis] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSynthesis(window.speechSynthesis);
    } else {
      setError('Text-to-speech is not supported in this browser.');
    }
  }, []);

  const speak = useCallback((text, options = {}) => {
    if (!synthesis) {
      setError('Speech synthesis not available');
      return;
    }

    // Cancel any ongoing speech
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set default options
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    utterance.lang = options.lang || 'en-US';

    utterance.onstart = () => {
      setIsSpeaking(true);
      setError(null);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      setError(`Speech synthesis error: ${event.error}`);
      setIsSpeaking(false);
    };

    synthesis.speak(utterance);
  }, [synthesis]);

  const stop = useCallback(() => {
    if (synthesis) {
      synthesis.cancel();
      setIsSpeaking(false);
    }
  }, [synthesis]);

  const pause = useCallback(() => {
    if (synthesis) {
      synthesis.pause();
    }
  }, [synthesis]);

  const resume = useCallback(() => {
    if (synthesis) {
      synthesis.resume();
    }
  }, [synthesis]);

  const getVoices = useCallback(() => {
    if (synthesis) {
      return synthesis.getVoices();
    }
    return [];
  }, [synthesis]);

  return {
    isSpeaking,
    error,
    speak,
    stop,
    pause,
    resume,
    getVoices,
    isSupported: !!synthesis
  };
};
