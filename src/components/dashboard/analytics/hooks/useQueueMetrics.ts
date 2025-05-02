
import * as React from 'react';
import { Queue } from '@/integrations/supabase/schema';

export const useQueueMetrics = (completedQueues: Queue[]) => {
  const [metrics, setMetrics] = React.useState({
    averageWaitTime: 0,
    averageServiceTime: 0,
    urgentCount: 0,
    elderlyCount: 0
  });

  React.useEffect(() => {
    if (!completedQueues || completedQueues.length === 0) {
      setMetrics({
        averageWaitTime: 0,
        averageServiceTime: 0,
        urgentCount: 0,
        elderlyCount: 0
      });
      return;
    }

    // Calculate average wait time (from created to called)
    let totalWaitTime = 0;
    let waitTimeCount = 0;
    
    // Calculate average service time (from called to completed)
    let totalServiceTime = 0;
    let serviceTimeCount = 0;
    
    // Count urgent and elderly queues
    let urgentCount = 0;
    let elderlyCount = 0;

    completedQueues.forEach(queue => {
      // Count by types
      if (queue.type === 'PRIORITY') urgentCount++;
      if (queue.type === 'ELDERLY') elderlyCount++;

      // Calculate wait time
      if (queue.created_at && queue.called_at) {
        const waitMs = new Date(queue.called_at).getTime() - new Date(queue.created_at).getTime();
        const waitMinutes = waitMs / 60000;
        totalWaitTime += waitMinutes;
        waitTimeCount++;
      }
      
      // Calculate service time
      if (queue.called_at && queue.completed_at) {
        const serviceMs = new Date(queue.completed_at).getTime() - new Date(queue.called_at).getTime();
        const serviceMinutes = serviceMs / 60000;
        totalServiceTime += serviceMinutes;
        serviceTimeCount++;
      }
    });

    setMetrics({
      averageWaitTime: waitTimeCount > 0 ? Math.round(totalWaitTime / waitTimeCount) : 0,
      averageServiceTime: serviceTimeCount > 0 ? Math.round(totalServiceTime / serviceTimeCount) : 0,
      urgentCount,
      elderlyCount
    });
  }, [completedQueues]);

  return metrics;
};
