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
let debugContainer: HTMLDivElement | null = null;

/**
 * Log to console and debug UI if in debug mode
 */
function debugLog(message: string, data?: any): void {
  console.log(message, data);
  
  if (!debugContainer) return;
  
  const logDiv = debugContainer.querySelector('#debug-log');
  if (!logDiv) return;
  
  const timestamp = new Date().toISOString().substr(11, 8);
  const logItem = document.createElement('div');
  logItem.innerHTML = `<span style="color:#aaa">[${timestamp}]</span> ${message}`;
  
  if (data) {
    const dataText = typeof data === 'string' ? data : JSON.stringify(data);
    logItem.innerHTML += `<pre style="color:#66ff66;margin:0;padding:4px 0 8px 12px;font-size:11px">${dataText}</pre>`;
  }
  
  logDiv.appendChild(logItem);
  logDiv.scrollTop = logDiv.scrollHeight;
}

/**
 * Setup debug UI
 */
function setupDebugUI(): HTMLDivElement {
  if (debugContainer) return debugContainer;
  
  debugContainer = document.createElement('div');
  debugContainer.style.position = 'fixed';
  debugContainer.style.bottom = '10px';
  debugContainer.style.right = '10px';
  debugContainer.style.width = '400px';
  debugContainer.style.height = '300px';
  debugContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  debugContainer.style.color = 'white';
  debugContainer.style.padding = '10px';
  debugContainer.style.overflow = 'auto';
  debugContainer.style.zIndex = '9999';
  debugContainer.style.fontFamily = 'monospace';
  debugContainer.style.fontSize = '12px';
  debugContainer.innerHTML = '<h3>Queue TTS Debug</h3><div id="debug-log"></div>';
  
  const closeButton = document.createElement('button');
  closeButton.innerText = 'Close';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.right = '10px';
  closeButton.style.padding = '2px 8px';
  closeButton.style.backgroundColor = '#333';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '3px';
  closeButton.style.cursor = 'pointer';
  closeButton.onclick = () => {
    document.body.removeChild(debugContainer!);
    debugContainer = null;
  };
  
  debugContainer.appendChild(closeButton);
  document.body.appendChild(debugContainer);
  return debugContainer;
}

/**
 * Split text into chunks of maximum 200 characters
 */
function splitTextIntoChunks(text: string, maxLength = 200): string[] {
  debugLog("Splitting text into chunks:", text);
  
  // Split by sentence endings first to try to keep sentences together
  let sentences = text.split(/(?<=[.!?।॥])\s+/);
  let chunks: string[] = [];
  let currentChunk = "";
  
  for (let i = 0; i < sentences.length; i++) {
    let sentence = sentences[i];
    
    if (sentence.length > maxLength) {
      // If a single sentence is longer than maxLength, split it further
      // Try to split by commas or other natural pauses
      let parts = sentence.split(/(?<=[,;:])(?=\s)/);
      for (let part of parts) {
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
  
  debugLog(`Split into ${chunks.length} chunks:`, chunks);
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
    debugLog("Using direct Google TTS URL (development environment)");
    return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
  } else {
    // In production (Netlify), use our serverless function proxy
    debugLog("Using Netlify function proxy for TTS (production environment)");
    return `/.netlify/functions/tts-proxy?text=${encodeURIComponent(text)}&lang=${lang}`;
  }
}

/**
 * Stop any currently playing speech
 */
function stopSpeaking(): void {
  debugLog("Stopping speech");
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
    debugLog("All chunks finished or speech stopped");
    isSpeaking = false;
    
    // Reset for next play
    currentAudioIndex = 0;
    audioChunks = [];
    
    resolve();
    return;
  }
  
  debugLog(`Playing chunk ${currentAudioIndex + 1}/${audioChunks.length}`);
  
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
    
    debugLog(`Using modified voice: ${lang} with rate=${speechRate}`);
  } else {
    // Standard voice - just use the voice ID as language
    lang = voice;
    debugLog(`Using standard voice: ${lang}`);
  }
  
  try {
    // Create audio element
    const audio = new Audio();
    
    // Add detailed event logging
    audio.onloadstart = () => debugLog("Audio loading started");
    audio.oncanplay = () => debugLog("Audio can be played now");
    audio.onplaying = () => debugLog("Audio playback started");
    
    // Set main event handlers
    audio.onended = () => {
      debugLog("Audio playback ended successfully");
      if (!isSpeaking) return;
      currentAudioIndex++;
      playNextChunk(options, resolve, reject);
    };
    
    audio.onerror = async (e) => {
      debugLog("Audio error event triggered", e);
      
      // Log detailed error information
      if (audio.error) {
        debugLog(`Audio error code: ${audio.error.code}, message: ${audio.error.message}`);
      }
      
      // Try direct fetch for troubleshooting
      try {
        debugLog(`Trying direct fetch to troubleshoot URL: ${audio.src}`);
        const response = await fetch(audio.src);
        debugLog(`Direct fetch status: ${response.status} ${response.statusText}`);
        
        // Try to read response body
        const text = await response.text();
        if (text.length < 1000) {
          debugLog("Response text:", text);
        }
      } catch (fetchError) {
        debugLog("Error during troubleshooting fetch:", fetchError);
      }
      
      // Show error toast
      toast.error(`เกิดข้อผิดพลาดในการอ่านข้อความส่วนที่ ${currentAudioIndex+1}`);
      
      // Create test player if debugging
      if (options.debug && debugContainer) {
        const testAudio = document.createElement('div');
        testAudio.innerHTML = `
          <div style="margin:10px 0;padding:5px;background:#333;border-radius:3px;">
            <p style="margin:0 0 5px 0;font-size:11px">Test audio for: "${text.substring(0, 30)}..."</p>
            <audio controls style="width:100%">
              <source src="${audio.src}" type="audio/mpeg">
            </audio>
          </div>
        `;
        debugContainer.appendChild(testAudio);
      }
      
      // Continue to next chunk
      if (!isSpeaking) return;
      currentAudioIndex++;
      setTimeout(() => playNextChunk(options, resolve, reject), 500);
    };
    
    // Get the TTS URL
    const url = getTtsUrl(text, lang);
    debugLog(`Using TTS URL: ${url}`);
    
    // Set volume
    audio.volume = options.volume || 1.0;
    
    // Try to set playback rate
    try {
      audio.playbackRate = speechRate;
    } catch (e) {
      debugLog("Browser doesn't support playbackRate adjustment:", e);
    }
    
    // Set source
    audio.src = url;
    
    // Store reference
    audioElement = audio;
    
    // Play audio
    audio.play().catch(error => {
      debugLog("Failed to play audio:", error);
      
      if (error.name === "NotAllowedError") {
        toast.error("ไม่สามารถเล่นเสียงได้: ต้องมีการโต้ตอบจากผู้ใช้ก่อน (กดปุ่มใดก็ได้)");
        debugLog("Audio playback requires user interaction first");
      }
      
      if (!isSpeaking) return;
      
      // Try next chunk
      currentAudioIndex++;
      setTimeout(() => playNextChunk(options, resolve, reject), 500);
    });
  } catch (error) {
    debugLog("Error creating or playing audio:", error);
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
  if (isDebug && !debugContainer) {
    setupDebugUI();
  }
  
  if (isDebug) {
    debugLog("Speaking text:", text.substring(0, 50) + "...");
    debugLog("With options:", options);
  }
  
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
  
  if (debugMode) {
    debugLog("Final announcement text:", text);
    debugLog(`Using voice settings - volume: ${volume}, rate: ${rate}, voice: ${voiceType}`);
  }
  
  return speakText(text, { volume, rate, voice: voiceType, debug: debugMode });
};

/**
 * Cancel any ongoing speech
 */
export const cancelSpeech = (): void => {
  const isDebug = localStorage.getItem('tts_debug_mode') === 'true';
  if (isDebug) {
    debugLog("Cancelling speech");
  }
  stopSpeaking();
};

// /**
//  * Toggle debug mode for TTS
//  */
// export const toggleTTSDebug = (): boolean => {
//   const currentState = localStorage.getItem('tts_debug_mode') === 'true';
//   const newState = !currentState;
  
//   if (newState) {
//     localStorage.setItem('tts_debug_mode', 'true');
//     setupDebugUI();
//     toast.info("เปิดโหมดการแก้ไขปัญหาเสียงแล้ว");
//   } else {
//     localStorage.removeItem('tts_debug_mode');
//     if (debugContainer) {
//       document.body.removeChild(debugContainer);
//       debugContainer = null;
//     }
//     toast.info("ปิดโหมดการแก้ไขปัญหาเสียงแล้ว");
//   }
  
//   return newState;
// };

// /**
//  * Test TTS functionality
//  */
// export const testTTSSettings = (): Promise<void> => {
//   const volumeStr = localStorage.getItem('queue_voice_volume');
//   const rateStr = localStorage.getItem('queue_voice_rate');
//   const voiceType = localStorage.getItem('queue_voice_type') || 'th';
  
//   const volume = volumeStr ? parseInt(volumeStr) / 100 : 1;
//   const rate = rateStr ? parseInt(rateStr) / 100 : 1.0;
  
//   const testMessage = "ทดสอบระบบเสียงด้วยการตั้งค่าปัจจุบัน";
  
//   toast.info("กำลังทดสอบการตั้งค่าเสียง...");
  
//   return speakText(testMessage, { 
//     volume, 
//     rate, 
//     voice: voiceType,
//     debug: true
//   });
// };