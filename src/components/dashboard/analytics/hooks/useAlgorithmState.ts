
import * as React from 'react';
import { QueueAlgorithmType, getOptimalAlgorithmForPharmacy } from '@/utils/queueAlgorithms';
import { Queue } from '@/integrations/supabase/schema';

export const useAlgorithmState = (waitingQueues: Queue[]) => {
  const [currentAlgorithm, setCurrentAlgorithm] = React.useState<QueueAlgorithmType>(
    localStorage.getItem('queue_algorithm') as QueueAlgorithmType || QueueAlgorithmType.FIFO
  );
  
  // Calculate queue counts for algorithm recommendation
  const urgentCount = waitingQueues.filter(q => q.type === 'PRIORITY').length;
  const elderlyCount = waitingQueues.filter(q => q.type === 'ELDERLY').length;
  
  // Get the recommended algorithm based on queue composition
  const recommendedAlgorithm = getOptimalAlgorithmForPharmacy(
    waitingQueues.length,
    urgentCount,
    elderlyCount
  );
  
  const shouldChangeAlgorithm = recommendedAlgorithm !== currentAlgorithm;
  
  const handleChangeAlgorithm = () => {
    setCurrentAlgorithm(recommendedAlgorithm);
    localStorage.setItem('queue_algorithm', recommendedAlgorithm);
    window.location.reload();
  };
  
  return {
    currentAlgorithm,
    recommendedAlgorithm,
    shouldChangeAlgorithm,
    urgentCount,
    elderlyCount,
    handleChangeAlgorithm
  };
};
