
import { QueueType } from '@/integrations/supabase/schema';

// Queue type format mapping
export const queueTypeFormat = {
  'GENERAL': { prefix: 'A', padLength: 3 },
  'PRIORITY': { prefix: 'P', padLength: 3 },
  'ELDERLY': { prefix: 'E', padLength: 3 },
  'FOLLOW_UP': { prefix: 'F', padLength: 3 },
};

// Format the queue number with the type prefix
export const formatQueueNumber = (queueType: QueueType, queueNumber: number): string => {
  const format = queueTypeFormat[queueType];
  return `${format.prefix}${queueNumber.toString().padStart(format.padLength, '0')}`;
};
