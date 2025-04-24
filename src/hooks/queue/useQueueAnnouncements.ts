
import * as React from 'react';
import { Queue } from '@/integrations/supabase/schema';
import { announceQueue } from '@/utils/textToSpeech';
import { toast } from 'sonner';

// Add debug logging
console.log("[DEBUG] useQueueAnnouncements importing React:", React);

export const useQueueAnnouncements = () => {
  const [voiceEnabled, setVoiceEnabled] = React.useState(true);
  const [counterName, setCounterName] = React.useState('1');
  const [volume, setVolume] = React.useState(80);
  const [rate, setRate] = React.useState(90);
  
  // Load voice settings from localStorage on startup
  React.useEffect(() => {
    const savedVoiceEnabled = localStorage.getItem('queue_voice_enabled');
    if (savedVoiceEnabled !== null) {
      setVoiceEnabled(savedVoiceEnabled === 'true');
    }
    
    const savedCounterName = localStorage.getItem('counter_name');
    if (savedCounterName) {
      setCounterName(savedCounterName);
    }
    
    const savedVolume = localStorage.getItem('queue_voice_volume');
    if (savedVolume) {
      setVolume(parseInt(savedVolume));
    }
    
    const savedRate = localStorage.getItem('queue_voice_rate');
    if (savedRate) {
      setRate(parseInt(savedRate));
    }
  }, []);

  // Update queue settings
  const updateQueueSettings = (enabled: boolean, counter: string, newVolume?: number, newRate?: number) => {
    setVoiceEnabled(enabled);
    setCounterName(counter);
    
    if (newVolume !== undefined) {
      setVolume(newVolume);
      localStorage.setItem('queue_voice_volume', String(newVolume));
    }
    
    if (newRate !== undefined) {
      setRate(newRate);
      localStorage.setItem('queue_voice_rate', String(newRate));
    }
    
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
  const recallQueue = async (queueOrId: Queue | string, queueGetter?: (id: string) => Queue | undefined) => {
    // If queueOrId is a string and we have a queueGetter function, get the Queue object
    let queue: Queue | undefined;
    
    if (typeof queueOrId === 'string' && queueGetter) {
      queue = queueGetter(queueOrId);
      if (!queue) {
        console.error('Queue not found for ID:', queueOrId);
        return null;
      }
    } else if (typeof queueOrId !== 'string') {
      queue = queueOrId;
    } else {
      console.error('Cannot recall queue without Queue object or queue getter function');
      return null;
    }

    if (voiceEnabled && queue) {
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
    
    return queue || null;
  };

  return {
    voiceEnabled,
    setVoiceEnabled,
    counterName,
    setCounterName,
    volume,
    rate,
    updateQueueSettings,
    callQueue,
    recallQueue
  };
};
