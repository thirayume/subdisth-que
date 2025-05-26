// For your textToSpeech.ts file

import { toast } from 'sonner';

interface TextToSpeechOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: string;
  debug?: boolean;
}

// Default options optimized for Thai language
const defaultOptions: TextToSpeechOptions = {
  voice: 'th',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  language: 'th',
  debug: false
};

let audioElement: HTMLAudioElement | null = null;
let isSpeaking = false;
let audioChunks: string[] = [];
let currentAudioIndex = 0;

/**
 * Split text into chunks of maximum 200 characters
 */
function splitTextIntoChunks(text: string, maxLength = 200): string[] {
  // Split by sentence endings first to try to keep sentences together
  const sentences = text.split(/(?<=[.!?।॥])\s+/);
  const chunks: string[] = [];
  let currentChunk = "";
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    
    if (sentence.length > maxLength) {
      // If a single sentence is longer than maxLength, split it further
      // Try to split by commas or other natural pauses
      const parts = sentence.split(/(?<=[,;:])(?=\s)/);
      for (const part of parts) {
        if (part.length > maxLength) {
          // If still too long, just split by maxLength
          for (let j = 0; j < part.length; j += maxLength) {
            chunks.push(part.substring(j, j + maxLength));
          }
        } else {
          if (currentChunk.length + part.length > maxLength) {
            chunks.push(currentChunk);
            currentChunk = part;
          } else {
            currentChunk += (currentChunk ? " " : "") + part;
          }
        }
      }
    } else {
      // If adding this sentence would exceed maxLength, start a new chunk
      if (currentChunk.length + sentence.length > maxLength) {
        chunks.push(currentChunk);
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? " " : "") + sentence;
      }
    }
  }
  
  // Add the last chunk if there's anything left
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

/**
 * Get the correct URL for TTS
 */
function getTtsUrl(text: string, lang: string): string {
  // Check if we're in development or production more reliably
  const isLocalDev = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname.includes('192.168.') ||
                    window.location.hostname.includes('10.0.') ||
                    window.location.port !== '';
  
  // Always use the Netlify function proxy for production
  // Only use direct Google TTS for local development
  if (isLocalDev && process.env.NODE_ENV === 'development') {
    console.log("Using direct Google TTS URL (local development environment)");
    return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
  } else {
    // In production or any deployed environment, use our serverless function proxy
    console.log("Using Netlify function proxy for TTS (production environment)");
    return `/.netlify/functions/tts-proxy?text=${encodeURIComponent(text)}&lang=${lang}`;
  }
}

/**
 * Stop any currently playing speech
 */
function stopSpeaking(): void {
  isSpeaking = false;
  
  // Stop current audio
  if (audioElement) {
    audioElement.pause();
    audioElement = null;
  }
  
  // Reset variables
  currentAudioIndex = 0;
  audioChunks = [];
}

/**
 * Play the next chunk of audio
 */
function playNextChunk(options: TextToSpeechOptions, resolve: () => void, reject: (error: Error) => void): void {
  if (!isSpeaking || currentAudioIndex >= audioChunks.length) {
    // All chunks finished or stopped
    isSpeaking = false;
    
    // Reset for next play
    currentAudioIndex = 0;
    audioChunks = [];
    
    resolve();
    return;
  }
  
  const text = audioChunks[currentAudioIndex];
  
  // Get language and voice modifiers
  let lang = options.language || 'th';
  let speechRate = options.rate || 1.0;
  
  // Handle voice modifiers if using the voice ID format
  const voice = options.voice || 'th';
  if (voice.includes('+')) {
    // Handle special voices with modifiers
    const parts = voice.split('+');
    lang = parts[0];
    
    // Apply voice modifiers
    if (parts[1] === 's') speechRate = 0.7; // Slow voice
  } else {
    // Standard voice - just use the voice ID as language
    lang = voice;
  }
  
  try {
    // Create audio element
    const audio = new Audio();
    
    // Set main event handlers
    audio.onended = () => {
      if (!isSpeaking) return;
      currentAudioIndex++;
      playNextChunk(options, resolve, reject);
    };
    
    audio.onerror = async (e) => {
      console.error("Audio error event triggered", e);
      
      // Log detailed error information
      if (audio.error) {
        console.error(`Audio error code: ${audio.error.code}, message: ${audio.error.message}`);
      }
      
      // Show error toast only for the first chunk to avoid spam
      if (currentAudioIndex === 0) {
        toast.error(`เกิดข้อผิดพลาดในการอ่านข้อความ`);
      }
      
      // Continue to next chunk
      if (!isSpeaking) return;
      currentAudioIndex++;
      setTimeout(() => playNextChunk(options, resolve, reject), 500);
    };
    
    // Get the TTS URL
    const url = getTtsUrl(text, lang);
    console.log(`Using TTS URL: ${url}`);
    
    // Set volume
    audio.volume = options.volume || 1.0;
    
    // Try to set playback rate
    try {
      audio.playbackRate = speechRate;
    } catch (e) {
      console.log("Browser doesn't support playbackRate adjustment:", e);
    }
    
    // Set source
    audio.src = url;
    
    // Store reference
    audioElement = audio;
    
    // Play audio
    audio.play().catch(error => {
      console.error("Failed to play audio:", error);
      
      if (error.name === "NotAllowedError") {
        toast.error("ไม่สามารถเล่นเสียงได้: ต้องมีการโต้ตอบจากผู้ใช้ก่อน (กดปุ่มใดก็ได้)");
      }
      
      if (!isSpeaking) return;
      
      // Try next chunk
      currentAudioIndex++;
      setTimeout(() => playNextChunk(options, resolve, reject), 500);
    });
  } catch (error) {
    console.error("Error creating or playing audio:", error);
    toast.error(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    if (!isSpeaking) return;
    
    // Try next chunk
    currentAudioIndex++;
    setTimeout(() => playNextChunk(options, resolve, reject), 500);
  }
}

/**
 * Speak text using Google Translate TTS
 */
export const speakText = (text: string, options: TextToSpeechOptions = {}): Promise<void> => {
  console.log("Speaking text:", text.substring(0, 50) + "...");
  
  // Check if debug mode is enabled in localStorage
  const isDebug = localStorage.getItem('tts_debug_mode') === 'true' || options.debug === true;
  
  return new Promise((resolve, reject) => {
    // Stop any current speech
    stopSpeaking();
    
    // Apply options with defaults
    const mergedOptions = { ...defaultOptions, ...options, debug: isDebug };
    
    // Set speaking state
    isSpeaking = true;
    
    // Split text into chunks (Google Translate TTS has a character limit)
    audioChunks = splitTextIntoChunks(text);
    currentAudioIndex = 0;
    
    // Start playing chunks
    playNextChunk(mergedOptions, resolve, reject);
  });
};

/**
 * Format and speak queue announcement
 */
export const announceQueue = (queueNumber: number, counter: string, queueType?: string, customText?: string): Promise<void> => {
  console.log(`Announcing queue: ${queueNumber}, counter: ${counter}, type: ${queueType || 'none'}`);
  
  // Get settings from localStorage
  const volumeStr = localStorage.getItem('queue_voice_volume');
  const rateStr = localStorage.getItem('queue_voice_rate');
  const voiceType = localStorage.getItem('queue_voice_type') || 'th';
  const debugMode = localStorage.getItem('tts_debug_mode') === 'true';
  
  // Convert settings to proper values
  const volume = volumeStr ? parseInt(volumeStr) / 100 : 1; 
  const rate = rateStr ? parseInt(rateStr) / 100 : 1.0;
  
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
  
  return speakText(text, { volume, rate, voice: voiceType, debug: debugMode });
};

/**
 * Cancel any ongoing speech
 */
export const cancelSpeech = (): void => {
  const isDebug = localStorage.getItem('tts_debug_mode') === 'true';
  stopSpeaking();
};
