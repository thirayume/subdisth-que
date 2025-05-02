
import * as React from 'react';
import { useQueues } from '@/hooks/useQueues';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useDashboardQueues');

export const useDashboardQueues = () => {
  logger.debug('Hook initialized');
  const { queues, sortQueues } = useQueues() || { queues: [], sortQueues: (q) => q };
  
  const [waitingQueues, setWaitingQueues] = React.useState([]);
  const [activeQueues, setActiveQueues] = React.useState([]);
  const [completedQueues, setCompletedQueues] = React.useState([]);

  React.useEffect(() => {
    logger.debug('Queues updated, filtering by status');
    if (queues && Array.isArray(queues)) {
      const waiting = queues.filter(q => q.status === 'WAITING');
      const active = queues.filter(q => q.status === 'ACTIVE');
      const completed = queues.filter(q => q.status === 'COMPLETED');

      setWaitingQueues(sortQueues(waiting));
      setActiveQueues(active);
      setCompletedQueues(completed);
      
      logger.info(`Filtered queues - Waiting: ${waiting.length}, Active: ${active.length}, Completed: ${completed.length}`);
    }
  }, [queues, sortQueues]);

  return {
    waitingQueues,
    activeQueues,
    completedQueues
  };
};
