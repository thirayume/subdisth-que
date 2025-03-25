
import { Queue, QueueStatus } from '@/integrations/supabase/schema';
import { useQueueState } from './queue/useQueueState';
import { useQueueStatusUpdates } from './queue/useQueueStatusUpdates';
import { useQueueAnnouncements } from './queue/useQueueAnnouncements';
import { announceQueue } from '@/utils/textToSpeech';

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
    updateQueueSettings
  };
};
