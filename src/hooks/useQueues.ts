
import * as React from 'react';
import { Queue } from '@/integrations/supabase/schema';
import { useQueueState } from './queue/useQueueState';
import { useQueueStatusUpdates } from './queue/useQueueStatusUpdates';
import { useQueueAnnouncements } from './queue/useQueueAnnouncements';
import { useQueueAlgorithm } from './queue/useQueueAlgorithm';
import { useQueueActions } from './queue/useQueueActions';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueues');

export const useQueues = () => {
  logger.debug('Hook initialized');
  
  // Use the refactored hooks
  const { 
    queues, 
    loading, 
    error, 
    fetchQueues, 
    addQueue, 
    getQueuesByStatus,
    updateQueueInState
  } = useQueueState();
  
  const { updateQueueStatus } = useQueueStatusUpdates(updateQueueInState);
  
  const { 
    voiceEnabled, 
    setVoiceEnabled, 
    counterName, 
    setCounterName, 
    updateQueueSettings, 
    recallQueue: baseRecallQueue 
  } = useQueueAnnouncements();
  
  const {
    queueAlgorithm,
    setQueueAlgorithm,
    queueTypes,
    sortQueues
  } = useQueueAlgorithm();

  // Wrapper for recallQueue that gets queue by ID first
  const recallQueue = (queueId: string) => {
    const getQueueById = (id: string) => queues.find(q => q.id === id);
    return baseRecallQueue(queueId, getQueueById);
  };
  
  // Use our queue actions hook
  const {
    callQueue,
    getNextQueueToCall,
    transferQueueToServicePoint,
    putQueueOnHold
  } = useQueueActions(
    queues,
    updateQueueStatus,
    updateQueueInState,
    fetchQueues, 
    sortQueues,
    queueAlgorithm,
    baseRecallQueue,
    voiceEnabled
  );

  return {
    queues,
    loading,
    error,
    fetchQueues,
    addQueue,
    updateQueueStatus,
    getQueuesByStatus,
    callQueue,
    recallQueue,
    voiceEnabled,
    setVoiceEnabled,
    counterName,
    setCounterName,
    updateQueueSettings,
    sortQueues,
    queueAlgorithm,
    setQueueAlgorithm,
    getNextQueueToCall,
    transferQueueToServicePoint,
    putQueueOnHold
  };
};
