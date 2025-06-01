
import { formatQueueNumber } from '@/utils/queueFormatters';
import { QueueTypeEnum } from '@/integrations/supabase/schema';

// Thai phonetic conversion for queue numbers
const thaiNumbers: { [key: string]: string } = {
  '0': 'ศูนย์',
  '1': 'หนึ่ง',
  '2': 'สอง',
  '3': 'สาม',
  '4': 'สี่',
  '5': 'ห้า',
  '6': 'หก',
  '7': 'เจ็ด',
  '8': 'แปด',
  '9': 'เก้า'
};

const thaiLetters: { [key: string]: string } = {
  'A': 'เอ',
  'B': 'บี',
  'C': 'ซี',
  'D': 'ดี',
  'E': 'อี',
  'F': 'เอฟ',
  'G': 'จี',
  'H': 'เอช',
  'I': 'ไอ',
  'J': 'เจ',
  'K': 'เค',
  'L': 'แอล',
  'M': 'เอ็ม',
  'N': 'เอ็น',
  'O': 'โอ',
  'P': 'พี',
  'Q': 'คิว',
  'R': 'อาร์',
  'S': 'เอส',
  'T': 'ที',
  'U': 'ยู',
  'V': 'วี',
  'W': 'ดับเบิลยู',
  'X': 'เอ็กซ์',
  'Y': 'วาย',
  'Z': 'แซด'
};

// Convert formatted queue number to Thai phonetic pronunciation
function convertToThaiPhonetic(formattedQueueNumber: string): string {
  let result = '';
  
  for (let i = 0; i < formattedQueueNumber.length; i++) {
    const char = formattedQueueNumber[i].toUpperCase();
    
    if (thaiLetters[char]) {
      result += thaiLetters[char] + ' ';
    } else if (thaiNumbers[char]) {
      result += thaiNumbers[char] + ' ';
    } else {
      result += char + ' ';
    }
  }
  
  return result.trim();
}

// Default TTS configuration
const defaultTTSConfig = {
  enabled: true,
  volume: 1.0,
  rate: 0.8,
  language: 'th-TH'
};

// Function to get TTS configuration from localStorage or use defaults
function getTTSConfig() {
  try {
    const savedConfig = localStorage.getItem('ttsConfig');
    if (savedConfig) {
      return { ...defaultTTSConfig, ...JSON.parse(savedConfig) };
    }
  } catch (error) {
    console.error('Error parsing TTS config from localStorage:', error);
  }
  return defaultTTSConfig;
}

// Function to speak text using Web Speech API with Thai language support
export function speakText(text: string): void {
  const config = getTTSConfig();
  
  if (!config.enabled) {
    console.log('TTS is disabled');
    return;
  }

  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = config.language || 'th-TH';
    utterance.volume = config.volume || 1.0;
    utterance.rate = config.rate || 0.8;
    utterance.pitch = 1.0;
    
    // Add event listeners for debugging
    utterance.onstart = () => {
      console.log('TTS started speaking:', text);
    };
    
    utterance.onend = () => {
      console.log('TTS finished speaking');
    };
    
    utterance.onerror = (event) => {
      console.error('TTS error:', event.error);
    };
    
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('Text-to-speech not supported in this browser');
  }
}

// Function to announce queue number with proper formatting and Thai pronunciation
export function announceQueue(queueNumber: number, counterName: string, queueType?: string): void {
  try {
    // Convert string to QueueTypeEnum if needed, with fallback
    const validQueueType = (queueType as QueueTypeEnum) || 'GENERAL';
    
    // Format the queue number properly (e.g., A105, B001)
    const formattedQueueNumber = formatQueueNumber(validQueueType, queueNumber);
    
    // Convert to Thai phonetic pronunciation
    const thaiPhoneticNumber = convertToThaiPhonetic(formattedQueueNumber);
    
    // Create the announcement message
    let message = `ขอเชิญหมายเลข ${thaiPhoneticNumber}`;
    
    if (counterName) {
      message += ` ที่ช่องบริการ ${counterName}`;
    }
    
    message += ' เชิญครับ';
    
    console.log('Announcing queue:', {
      originalNumber: queueNumber,
      queueType: validQueueType,
      formattedNumber: formattedQueueNumber,
      thaiPhonetic: thaiPhoneticNumber,
      fullMessage: message
    });
    
    speakText(message);
  } catch (error) {
    console.error('Error announcing queue:', error);
    // Fallback to simple announcement
    speakText(`ขอเชิญหมายเลข ${queueNumber} เชิญครับ`);
  }
}

// Function to announce custom message
export function announceCustomMessage(message: string): void {
  speakText(message);
}

// Function to test TTS with a sample message
export function testTTS(): void {
  const testMessage = 'ขอเชิญหมายเลข เอ หนึ่ง ศูนย์ ห้า เชิญครับ';
  console.log('Testing TTS with message:', testMessage);
  speakText(testMessage);
}
