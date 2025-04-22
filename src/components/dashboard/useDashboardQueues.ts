
import React, { useState, useEffect } from 'react';
import { useQueues } from '@/hooks/useQueues';

export const useDashboardQueues = () => {
  const { queues, sortQueues } = useQueues();
  
  const [waitingQueues, setWaitingQueues] = useState([]);
  const [activeQueues, setActiveQueues] = useState([]);
  const [completedQueues, setCompletedQueues] = useState([]);

  // Update filtered queues when the main queues array changes
  useEffect(() => {
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
