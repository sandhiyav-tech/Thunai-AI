// Browser Speech Helpers for Thunai AI (Tamil-first Web Speech API)

export interface SpeechRecognitionHelper {
  isSupported: boolean;
  start: (
    onResult: (transcript: string) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    lang?: string
  ) => void;
  stop: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let activeRecognition: any = null;

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

export function startSpeechRecognition(
  onResult: (text: string) => void,
  onError: (errorMsg: string) => void,
  onEnd: () => void,
  lang: string = 'ta-IN'
): () => void {
  if (typeof window === 'undefined') {
    onError('Speech recognition is only supported in browser.');
    return () => {};
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError('Browser does not support voice input. Please type your message.');
    return () => {};
  }

  try {
    if (activeRecognition) {
      try {
        activeRecognition.stop();
      } catch {
        // ignore
      }
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        onResult(transcript);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      let message = 'Voice input error. Please try speaking again or type.';
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        message = 'Microphone permission denied. Please allow microphone access in your browser settings.';
      } else if (event.error === 'no-speech') {
        message = 'No speech was detected. Please try again.';
      }
      onError(message);
    };

    recognition.onend = () => {
      activeRecognition = null;
      onEnd();
    };

    recognition.start();
    activeRecognition = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };
  } catch (err) {
    console.error('Speech recognition start failed:', err);
    onError('Unable to start voice recording. Please use the text input.');
    return () => {};
  }
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function speakText(
  text: string,
  lang: 'ta' | 'en' = 'ta',
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: string) => void
): () => void {
  if (!isSpeechSynthesisSupported()) {
    if (onError) onError('Speech synthesis is not supported on this device.');
    return () => {};
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip markdown formatting for cleaner speech synthesis
  const cleanText = text
    .replace(/[*_#`~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '');

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
  utterance.rate = 0.95; // Slightly slower, highly clear for rural users
  utterance.pitch = 1.0;

  // Attempt to select a Tamil voice if available
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    const targetPrefix = lang === 'ta' ? 'ta' : 'en';
    const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetPrefix));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.error('TTS error:', e);
    if (onEnd) onEnd();
    if (onError) onError('Unable to play audio. Please read the text on screen.');
  };

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
  };
}
