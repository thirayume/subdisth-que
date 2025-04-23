
import React, { useState, useEffect } from 'react';
import { useQueues } from '@/hooks/useQueues';

// Add debug logging
console.log("[DEBUG] useDashboardQueues importing React:", React);

export const useDashboardQueues = () => {
  console.log('[useDashboardQueues] Hook initialized');
  const { queues, sortQueues } = useQueues();
  
  const [waitingQueues, setWaitingQueues] = useState([]);
  const [activeQueues, setActiveQueues] = useState([]);
  const [completedQueues, setCompletedQueues] = useState([]);

  useEffect(() => {
    console.log('[useDashboardQueues] Queues updated, filtering by status');
    if (queues) {
      const waiting = queues.filter(q => q.status === 'WAITING');
      const active = queues.filter(q => q.status === 'ACTIVE');
      const completed = queues.filter(q => q.status === 'COMPLETED');

      setWaitingQueues(sortQueues(waiting));
      setActiveQueues(active);
      setCompletedQueues(completed);
    }
  }, [queues, sortQueues]);

  return {
    waitingQueues,
    activeQueues,
    completedQueues
  };
};
