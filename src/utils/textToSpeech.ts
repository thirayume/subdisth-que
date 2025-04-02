
import { toast } from 'sonner';

interface TextToSpeechOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: string;
}

// Default options optimized for Thai language
const defaultOptions: TextToSpeechOptions = {
  voice: 'th-TH',
  rate: 0.9,  // Slightly slower rate for better Thai pronunciation
  pitch: 1,
  volume: 1,
  language: 'th-TH'
};

/**
 * Speak text using the Web Speech API with optimized settings for Thai language
 */
export const speakText = (text: string, options: TextToSpeechOptions = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      toast.error('ไม่รองรับการอ่านข้อความบนเบราว์เซอร์นี้');
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    // Create a new speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply options with defaults
    const mergedOptions = { ...defaultOptions, ...options };
    utterance.lang = mergedOptions.language || 'th-TH';
    utterance.rate = mergedOptions.rate || 0.9;
    utterance.pitch = mergedOptions.pitch || 1;
    utterance.volume = mergedOptions.volume || 1;
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Select a Thai voice if available
    const thaiVoices = voices.filter(voice => voice.lang.includes('th'));
    
    if (thaiVoices.length > 0) {
      utterance.voice = thaiVoices[0];
    } else {
      // Try to find any voice with Thai language support
      const anyThaiVoice = voices.find(voice => voice.lang.includes('th'));
      if (anyThaiVoice) {
        utterance.voice = anyThaiVoice;
      }
    }
    
    // Set event handlers
    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      toast.error('เกิดข้อผิดพลาดในการอ่านข้อความ');
      reject(new Error('Speech synthesis error'));
    };
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
  });
};

/**
 * Format and speak queue announcement
 */
export const announceQueue = (queueNumber: number, counter: string, queueType?: string, customText?: string): Promise<void> => {
  // Get volume from localStorage if available
  const volumeStr = localStorage.getItem('queue_voice_volume');
  const volume = volumeStr ? parseInt(volumeStr) / 100 : 1; // Convert percentage to decimal
  
  // Get rate from localStorage if available
  const rateStr = localStorage.getItem('queue_voice_rate');
  const rate = rateStr ? parseInt(rateStr) / 100 : 0.9; // Convert percentage to decimal
  
  // Default announcement text in Thai
  const defaultText = `ขอเชิญหมายเลข ${queueNumber} ${queueType ? `${queueType}` : ''} ที่ช่องบริการ ${counter}`;
  
  // Use custom text if provided
  let text = customText || defaultText;
  
  // Replace placeholder tokens
  text = text.replace('{queueNumber}', String(queueNumber));
  text = text.replace('{counter}', counter);
  
  if (queueType) {
    text = text.replace('{queueType}', queueType);
  }
  
  return speakText(text, { volume, rate });
};
