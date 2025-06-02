import { toast } from 'sonner';
import { formatQueueNumber } from '@/utils/queueFormatters';
import { QueueTypeEnum } from '@/integrations/supabase/schema';

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
  // Check if we're in development or production
  const isDev = process.env.NODE_ENV === 'development' || 
                window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1';
  
  if (isDev) {
    // In development, use Google's TTS directly (works fine locally)
    return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
  } else {
    // In production (Netlify), use our serverless function proxy
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
      // Show error toast
      toast.error(`เกิดข้อผิดพลาดในการอ่านข้อความส่วนที่ ${currentAudioIndex+1}`);
      
      // Continue to next chunk
      if (!isSpeaking) return;
      currentAudioIndex++;
      setTimeout(() => playNextChunk(options, resolve, reject), 500);
    };
    
    // Get the TTS URL
    const url = getTtsUrl(text, lang);
    
    // Set volume
    audio.volume = options.volume || 1.0;
    
    // Try to set playback rate
    try {
      audio.playbackRate = speechRate;
    } catch (e) {
      // Browser doesn't support playbackRate adjustment
    }
    
    // Set source
    audio.src = url;
    
    // Store reference
    audioElement = audio;
    
    // Play audio
    audio.play().catch(error => {
      if (error.name === "NotAllowedError") {
        toast.error("ไม่สามารถเล่นเสียงได้: ต้องมีการโต้ตอบจากผู้ใช้ก่อน (กดปุ่มใดก็ได้)");
      }
      
      if (!isSpeaking) return;
      
      // Try next chunk
      currentAudioIndex++;
      setTimeout(() => playNextChunk(options, resolve, reject), 500);
    });
  } catch (error) {
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

// Function to announce queue number with proper service point information
export function announceQueue(
  queueNumber: number, 
  servicePointInfo: { code?: string; name?: string } | string, 
  queueType?: string
): void {
  try {
    // Convert string to QueueTypeEnum if needed, with fallback
    const validQueueType = (queueType as QueueTypeEnum) || 'GENERAL';
    
    // Format the queue number properly (e.g., A105, B001)
    const formattedQueueNumber = formatQueueNumber(validQueueType, queueNumber);
    
    // Handle service point information
    let servicePointMessage = '';
    if (typeof servicePointInfo === 'string') {
      // Legacy support - treat as counter name
      servicePointMessage = `ที่ช่องบริการ ${servicePointInfo}`;
    } else if (servicePointInfo && (servicePointInfo.code || servicePointInfo.name)) {
      // New service point format - use code and name directly in Thai
      let servicePointParts = [];
      
      if (servicePointInfo.code) {
        servicePointParts.push(servicePointInfo.code);
      }
      
      if (servicePointInfo.name) {
        servicePointParts.push(servicePointInfo.name);
      }
      
      servicePointMessage = `ที่ ${servicePointParts.join(' ')}`;
    } else {
      // Fallback to default
      servicePointMessage = 'ที่ช่องบริการ หนึ่ง';
    }
    
    // Create the announcement message using your working format
    let message = `ขอเชิญหมายเลข ${formattedQueueNumber} ${servicePointMessage} เชิญครับ`;
    
    console.log('Announcing queue:', {
      originalNumber: queueNumber,
      queueType: validQueueType,
      formattedNumber: formattedQueueNumber,
      servicePointInfo,
      servicePointMessage,
      fullMessage: message
    });
    
    // Get settings from localStorage
    const volumeStr = localStorage.getItem('queue_voice_volume');
    const rateStr = localStorage.getItem('queue_voice_rate');
    const voiceType = localStorage.getItem('queue_voice_type') || 'th';
    const debugMode = localStorage.getItem('tts_debug_mode') === 'true';
    
    // Convert settings to proper values
    const volume = volumeStr ? parseInt(volumeStr) / 100 : 1; 
    const rate = rateStr ? parseInt(rateStr) / 100 : 1.0;
    
    speakText(message, { volume, rate, voice: voiceType, debug: debugMode });
  } catch (error) {
    console.error('Error announcing queue:', error);
    // Fallback to simple announcement
    speakText(`ขอเชิญหมายเลข ${queueNumber} เชิญครับ`);
  }
}

// Function to announce custom message
export function announceCustomMessage(message: string): void {
  const volumeStr = localStorage.getItem('queue_voice_volume');
  const rateStr = localStorage.getItem('queue_voice_rate');
  const voiceType = localStorage.getItem('queue_voice_type') || 'th';
  
  const volume = volumeStr ? parseInt(volumeStr) / 100 : 1; 
  const rate = rateStr ? parseInt(rateStr) / 100 : 1.0;
  
  speakText(message, { volume, rate, voice: voiceType });
}

// Function to test TTS with a sample message
export function testTTS(): void {
  const testMessage = 'ขอเชิญหมายเลข เอ หนึ่ง ศูนย์ ห้า เชิญครับ';
  console.log('Testing TTS with message:', testMessage);
  
  const volumeStr = localStorage.getItem('queue_voice_volume');
  const rateStr = localStorage.getItem('queue_voice_rate');
  const voiceType = localStorage.getItem('queue_voice_type') || 'th';
  
  const volume = volumeStr ? parseInt(volumeStr) / 100 : 1; 
  const rate = rateStr ? parseInt(rateStr) / 100 : 1.0;
  
  speakText(testMessage, { volume, rate, voice: voiceType, debug: true });
}

/**
 * Cancel any ongoing speech
 */
export const cancelSpeech = (): void => {
  stopSpeaking();
};
