
import * as React from 'react';
import { toast } from 'sonner';
import { announceQueue } from '@/utils/textToSpeech';

export const useQueueAnnouncements = () => {
  const [voiceEnabled, setVoiceEnabled] = React.useState<boolean>(() => {
    const saved = localStorage.getItem('queue_voice_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [counterName, setCounterName] = React.useState<string>(() => {
    return localStorage.getItem('queue_counter_name') || '1';
  });

  React.useEffect(() => {
    localStorage.setItem('queue_voice_enabled', String(voiceEnabled));
  }, [voiceEnabled]);

  React.useEffect(() => {
    localStorage.setItem('queue_counter_name', counterName);
  }, [counterName]);

  const updateQueueSettings = (settings: {
    voiceEnabled?: boolean;
    counterName?: string;
  }) => {
    if (settings.voiceEnabled !== undefined) {
      setVoiceEnabled(settings.voiceEnabled);
    }
    if (settings.counterName !== undefined) {
      setCounterName(settings.counterName);
    }
  };

  const recallQueue = async (queueId: string, getQueueById: (id: string) => any | undefined) => {
    const queueToRecall = getQueueById(queueId);
    
    if (queueToRecall && voiceEnabled) {
      try {
        await announceQueue(
          queueToRecall.number, 
          counterName, 
          queueToRecall.type
        );
        
        toast.success(`เรียกซ้ำคิวหมายเลข ${queueToRecall.number}`);
        return true;
      } catch (err) {
        console.error('Error recalling queue:', err);
        toast.error('ไม่สามารถเรียกคิวซ้ำได้');
        return false;
      }
    }
    
    return false;
  };

  return {
    voiceEnabled,
    setVoiceEnabled,
    counterName,
    setCounterName,
    updateQueueSettings,
    recallQueue
  };
};
