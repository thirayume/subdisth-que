
import * as React from 'react';
import { QueueType } from '@/integrations/supabase/schema';
import { createLogger } from '@/utils/logger';
import { supabase } from '@/integrations/supabase/client';
import { QueueCreationState, QueueCreationActions, QueueTypePurposes } from './types';

const logger = createLogger('useQueueCreation');

// Define the queue type purposes
export const queueTypePurposes: QueueTypePurposes = {
  'GENERAL': 'ทั่วไป',
  'PRIORITY': 'กรณีเร่งด่วน',
  'ELDERLY': 'ผู้สูงอายุ 60 ปีขึ้นไป',
  'FOLLOW_UP': 'ติดตามการรักษา'
};

export const useQueueCreation = (): QueueCreationState & QueueCreationActions & { queueTypePurposes: QueueTypePurposes } => {
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
    
    try {
      // Get the next queue number
      const { data: queueCountData } = await supabase
        .from('queues')
        .select('number')
        .order('number', { ascending: false })
        .limit(1);
      
      const nextQueueNumber = queueCountData && queueCountData.length > 0 
        ? queueCountData[0].number + 1 
        : 1;
      
      // Create queue in Supabase
      const { data, error } = await supabase
        .from('queues')
        .insert({
          patient_id: patientId,
          number: nextQueueNumber,
          type: queueType,
          status: 'WAITING',
          notes: notes
        })
        .select();
      
      if (error) {
        logger.error('Error creating queue:', error);
        throw error;
      }
      
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      logger.error('Error in createQueue:', err);
      throw err;
    }
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
