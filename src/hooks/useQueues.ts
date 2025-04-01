
import { Queue, QueueStatus } from '@/integrations/supabase/schema';
import { useQueueState } from './queue/useQueueState';
import { useQueueStatusUpdates } from './queue/useQueueStatusUpdates';
import { useQueueAnnouncements } from './queue/useQueueAnnouncements';
import { announceQueue } from '@/utils/textToSpeech';
import { QueueAlgorithmType, sortQueuesByAlgorithm, QueueTypeWithAlgorithm } from '@/utils/queueAlgorithms';
import { useState, useEffect } from 'react';

export const useQueues = () => {
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
  
  // Load algorithm and queue types from localStorage
  const [queueAlgorithm, setQueueAlgorithm] = useState<QueueAlgorithmType>(QueueAlgorithmType.FIFO);
  const [queueTypes, setQueueTypes] = useState<QueueTypeWithAlgorithm[]>([]);
  
  useEffect(() => {
    // Load algorithm from localStorage
    const savedAlgorithm = localStorage.getItem('queue_algorithm') as QueueAlgorithmType | null;
    if (savedAlgorithm) {
      setQueueAlgorithm(savedAlgorithm);
    }
    
    // Load queue types from localStorage
    const savedQueueTypes = localStorage.getItem('queue_types');
    if (savedQueueTypes) {
      try {
        const parsedQueueTypes = JSON.parse(savedQueueTypes);
        setQueueTypes(parsedQueueTypes);
      } catch (error) {
        console.error('Error parsing queue types from localStorage:', error);
      }
    }
  }, []);
  
  // Sort queues by the selected algorithm
  const sortQueues = (queuesToSort: Queue[]) => {
    return sortQueuesByAlgorithm(queuesToSort, queueTypes, queueAlgorithm);
  };
  
  // Wrapper for callQueue to handle both status update and announcement
  const callQueue = async (queueId: string) => {
    const queueToCall = queues.find(q => q.id === queueId);
    if (queueToCall) {
      const updatedQueue = await updateQueueStatus(queueId, 'ACTIVE');
      if (updatedQueue && voiceEnabled) {
        try {
          const announcementText = localStorage.getItem('queue_announcement_text') || 
            'ขอเชิญหมายเลข {queueNumber} ที่ช่องบริการ {counter}';
          
          await announceQueue(
            updatedQueue.number, 
            counterName, 
            updatedQueue.type,
            announcementText
          );
        } catch (err) {
          console.error('Error announcing queue:', err);
        }
      }
      return updatedQueue;
    }
    return null;
  };

  // Wrapper for recallQueue that gets queue by ID first
  const recallQueue = (queueId: string) => {
    const getQueueById = (id: string) => queues.find(q => q.id === id);
    return baseRecallQueue(queueId, getQueueById);
  };
  
  // Get next queue to call based on the selected algorithm
  const getNextQueueToCall = () => {
    const waitingQueues = queues.filter(q => q.status === 'WAITING');
    if (waitingQueues.length === 0) return null;
    
    const sortedQueues = sortQueues(waitingQueues);
    return sortedQueues[0] || null;
  };

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
    getNextQueueToCall
  };
};
