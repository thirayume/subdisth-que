
import React, { useEffect } from 'react';
import QueueBoardContainer from '@/components/queue/board/QueueBoardContainer';
import { supabase } from '@/integrations/supabase/client';
import { announceQueue } from '@/utils/textToSpeech';
import { Queue, QueueStatus } from '@/integrations/supabase/schema';

const QueueBoard = () => {
  useEffect(() => {
    // Set up real-time subscription to queue changes
    const channel = supabase
      .channel('queue-board-changes')
      .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'queues' },
          (payload) => {
            // Check if a queue was just set to ACTIVE (meaning it was called)
            if (payload.new && payload.new.status === 'ACTIVE') {
              const queue = payload.new as Queue;
              
              // Get the counter number from the payload if available
              // Default to "1" if not available
              const counterName = queue.number?.toString() || "1";
              
              // Get announcement text from localStorage or use default
              const announcementText =
                localStorage.getItem("queue_announcement_text") ||
                "ขอเชิญหมายเลข {queueNumber} ที่ช่องบริการ {counter}";
              
              // Announce the queue
              announceQueue(
                queue.number,
                counterName,
                queue.type,
                announcementText
              ).catch(error => {
                console.error("Error announcing queue:", error);
              });
            }
          }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <QueueBoardContainer />;
};

export default QueueBoard;
