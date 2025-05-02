import * as React from 'react';
import { useQueues } from '@/hooks/useQueues';
import { createLogger } from '@/utils/logger';
import { Queue } from '@/integrations/supabase/schema';

const logger = createLogger('useDashboardQueues');

export const useDashboardQueues = () => {
  logger.debug('Hook initialized');
  
  // Get queues data from the useQueues hook
  const { queues = [], sortQueues } = useQueues() || {};
  
  // Initialize state for different queue statuses
  const [queuesByStatus, setQueuesByStatus] = React.useState<{
    waiting: Queue[];
    active: Queue[];
    completed: Queue[];
    skipped: Queue[];
  }>({
    waiting: [],
    active: [],
    completed: [],
    skipped: []
  });
  
  // Process queues when data changes
  React.useEffect(() => {
    if (!Array.isArray(queues)) return;
    
    // Filter queues by status
    const waiting = queues.filter(q => q.status === 'WAITING');
    const active = queues.filter(q => q.status === 'ACTIVE');
    const completed = queues.filter(q => q.status === 'COMPLETED');
    const skipped = queues.filter(q => q.status === 'SKIPPED');
    
    // Only apply sorting to waiting queues for efficiency
    const sortedWaiting = sortQueues ? sortQueues(waiting) : waiting;
    
    const processedQueues = {
      waiting: sortedWaiting,
      active,
      completed,
      skipped
    };
    
    setQueuesByStatus(processedQueues);
    
    logger.info(
      `Processed queues - Waiting: ${processedQueues.waiting.length}, ` +
      `Active: ${processedQueues.active.length}, ` +
      `Completed: ${processedQueues.completed.length}, ` +
      `Skipped: ${processedQueues.skipped.length}`
    );
  }, [queues, sortQueues]); // Dependencies are now directly queues and sortQueues

  return {
    waitingQueues: queuesByStatus.waiting,
    activeQueues: queuesByStatus.active,
    completedQueues: queuesByStatus.completed,
    skippedQueues: queuesByStatus.skipped
  };
};