
import { useState, useEffect } from 'react';
import { Queue } from '@/integrations/supabase/schema';
import { announceQueue } from '@/utils/textToSpeech';
import { toast } from 'sonner';

export const useQueueAnnouncements = () => {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [counterName, setCounterName] = useState('1');
  
  // Load voice settings from localStorage on startup
  useEffect(() => {
    const savedVoiceEnabled = localStorage.getItem('queue_voice_enabled');
    if (savedVoiceEnabled !== null) {
      setVoiceEnabled(savedVoiceEnabled === 'true');
    }
    
    const savedCounterName = localStorage.getItem('counter_name');
    if (savedCounterName) {
      setCounterName(savedCounterName);
    }
  }, []);

  // Update queue settings
  const updateQueueSettings = (enabled: boolean, counter: string) => {
    setVoiceEnabled(enabled);
    setCounterName(counter);
    
    // Save to localStorage
    localStorage.setItem('queue_voice_enabled', String(enabled));
    localStorage.setItem('counter_name', counter);
  };
  
  // Call a queue
  const callQueue = async (queue: Queue, updateStatus: (id: string, status: string) => Promise<Queue | null>) => {
    const updatedQueue = await updateStatus(queue.id, 'ACTIVE');
    
    // Announce the queue if voice is enabled
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
  };
  
  // Recall a queue (announce again)
  const recallQueue = async (queue: Queue) => {
    if (voiceEnabled) {
      try {
        const announcementText = localStorage.getItem('queue_announcement_text') || 
          'ขอเชิญหมายเลข {queueNumber} ที่ช่องบริการ {counter}';
        
        await announceQueue(
          queue.number, 
          counterName, 
          queue.type,
          announcementText
        );
        
        toast.info(`เรียกซ้ำคิวหมายเลข ${queue.number}`);
        return queue;
      } catch (err) {
        console.error('Error recalling queue:', err);
        toast.error('ไม่สามารถประกาศเสียงเรียกคิวได้');
      }
    }
    
    return queue;
  };

  return {
    voiceEnabled,
    setVoiceEnabled,
    counterName,
    setCounterName,
    updateQueueSettings,
    callQueue,
    recallQueue
  };
};
