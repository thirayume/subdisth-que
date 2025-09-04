import React, { useState, useEffect } from 'react';
import { useInsQueues } from '@/hooks/useInsQueues';
import { useServicePointIns } from '@/hooks/useServicePointIns';
import { QueueStatus } from '@/integrations/supabase/schema';
import QueueInsBoardContent from '@/components/ins-queue/board/QueueInsBoardContent';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';
import { isCompletedToday } from '@/utils/dateUtils';

const logger = createLogger('QueueInsBoard');

// Define queue status constants to use as values
const QUEUE_STATUS = {
  ACTIVE: 'ACTIVE' as QueueStatus,
  WAITING: 'WAITING' as QueueStatus,
  COMPLETED: 'COMPLETED' as QueueStatus,
  SKIPPED: 'SKIPPED' as QueueStatus
};

const QueueInsBoardContainer = () => {
  logger.debug('Rendering QueueInsBoardContainer');
  
  // Fetch data from Supabase
  const { getQueuesByStatus } = useInsQueues();
  const { servicePoints } = useServicePointIns();
  const [activeQueues, setActiveQueues] = useState([]);
  const [waitingQueues, setWaitingQueues] = useState([]);
  const [completedQueues, setCompletedQueues] = useState([]);
  
  // Fetch queues data and set up real-time subscription
  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const active = await getQueuesByStatus(QUEUE_STATUS.ACTIVE);
        setActiveQueues(active);
        
        const waiting = await getQueuesByStatus(QUEUE_STATUS.WAITING);
        // Display waiting queues in order of creation
        setWaitingQueues(waiting.slice(0, 5));
        
        const completed = await getQueuesByStatus(QUEUE_STATUS.COMPLETED);
        // Filter completed queues to only show today's queues
        const todayCompleted = completed.filter(queue => 
          isCompletedToday(queue.completed_at, queue.queue_date)
        );
        setCompletedQueues(todayCompleted.sort((a, b) => 
          new Date(b.completed_at || b.updated_at).getTime() - 
          new Date(a.completed_at || a.updated_at).getTime()).slice(0, 5));
          
        logger.info(`Fetched INS queues - Active: ${active.length}, Waiting: ${waiting.length}, Completed today: ${todayCompleted.length}`);
      } catch (error) {
        logger.error('Error fetching INS queues:', error);
        toast.error('ไม่สามารถดึงข้อมูลคิว INS ได้');
      }
    };
    
    fetchQueues();
    
    // Set up real-time subscription for INS queues
    const channel = supabase
      .channel('queue-ins-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'queues_ins' },
          (payload) => {
            logger.debug('INS Queue change detected:', payload);
            fetchQueues(); // Refresh data when changes occur
          }
      )
      .subscribe();
    
    // Refresh data every 30 seconds as a fallback
    const refreshTimer = setInterval(fetchQueues, 30000);
    
    return () => {
      clearInterval(refreshTimer);
      supabase.removeChannel(channel);
    };
  }, [getQueuesByStatus]);

  // Find service point by ID
  const findServicePoint = (servicePointId: string | null) => {
    if (!servicePointId) return null;
    return servicePoints.find(sp => sp.id === servicePointId);
  };
  
  return (
    <QueueInsBoardContent 
      activeQueues={activeQueues}
      waitingQueues={waitingQueues}
      completedQueues={completedQueues}
      findServicePoint={findServicePoint}
    />
  );
};

export default QueueInsBoardContainer;
