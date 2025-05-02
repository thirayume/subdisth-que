
import * as React from 'react';
import { QueueType } from '@/integrations/supabase/schema';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueueCreation');

export const useQueueCreation = () => {
  logger.debug('Hook initialized');
  
  const [queueType, setQueueType] = React.useState<QueueType>('GENERAL');
  const [notes, setNotes] = React.useState('');
  
  const resetQueueCreation = React.useCallback(() => {
    logger.debug('Resetting queue creation state');
    setQueueType('GENERAL');
    setNotes('');
  }, []);

  return {
    queueType,
    setQueueType,
    notes,
    setNotes,
    resetQueueCreation
  };
};
