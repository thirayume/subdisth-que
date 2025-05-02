
import * as React from 'react';
import { QueueType } from '@/integrations/supabase/schema';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueueCreation');

// Define the queue type purposes
export const queueTypePurposes: Record<string, string> = {
  'GENERAL': 'ทั่วไป',
  'PRIORITY': 'กรณีเร่งด่วน',
  'ELDERLY': 'ผู้สูงอายุ 60 ปีขึ้นไป',
  'FOLLOW_UP': 'ติดตามการรักษา'
};

export const useQueueCreation = () => {
  logger.debug('Hook initialized');
  
  const [queueType, setQueueType] = React.useState<QueueType>('GENERAL');
  const [notes, setNotes] = React.useState('');
  
  const resetQueueCreation = React.useCallback(() => {
    logger.debug('Resetting queue creation state');
    setQueueType('GENERAL');
    setNotes('');
  }, []);

  // Method to create a queue
  const createQueue = async (patientId: string) => {
    logger.debug('Creating queue for patient', patientId);
    // Implementation would go here
    return null;
  };

  return {
    queueType,
    setQueueType,
    notes,
    setNotes,
    resetQueueCreation,
    createQueue,
    queueTypePurposes
  };
};
