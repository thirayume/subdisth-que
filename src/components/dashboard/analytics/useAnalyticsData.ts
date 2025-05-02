
// Update this file to use proper logging

import { Queue } from '@/integrations/supabase/schema';
import { useTimeFrameState } from './hooks/useTimeFrameState';
import { useWaitTimeData } from './hooks/useWaitTimeData';
import { useThroughputData } from './hooks/useThroughputData';
import { useQueueMetrics } from './hooks/useQueueMetrics';
import { useAlgorithmState } from './hooks/useAlgorithmState';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AnalyticsData');

export const useAnalyticsData = (completedQueues: Queue[], waitingQueues: Queue[]) => {
  logger.debug('Hook initialized with completed queue count:', completedQueues?.length);
  
  // Time frame state
  const { timeFrame, setTimeFrame } = useTimeFrameState();
  
  // Chart data
  const { waitTimeData } = useWaitTimeData(completedQueues, timeFrame);
  const { throughputData } = useThroughputData(completedQueues, timeFrame);
  
  // Calculate metrics
  const { 
    averageWaitTime,
    averageServiceTime,
    urgentCount,
    elderlyCount
  } = useQueueMetrics(completedQueues, waitingQueues);
  
  // Algorithm recommendation
  const {
    currentAlgorithm,
    recommendedAlgorithm,
    shouldChangeAlgorithm,
    handleChangeAlgorithm
  } = useAlgorithmState(urgentCount, elderlyCount, waitingQueues.length);
  
  logger.debug('Analytics data prepared', {
    timeFrame,
    averageWaitTime,
    averageServiceTime,
    currentAlgorithm
  });
  
  return {
    timeFrame,
    setTimeFrame,
    waitTimeData,
    throughputData,
    averageWaitTime,
    averageServiceTime,
    currentAlgorithm,
    recommendedAlgorithm,
    shouldChangeAlgorithm,
    urgentCount,
    elderlyCount,
    handleChangeAlgorithm
  };
};
