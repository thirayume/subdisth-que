
import * as React from 'react';
import { Queue } from '@/integrations/supabase/schema';
import { 
  useTimeFrameState, 
  useAlgorithmState, 
  useQueueMetrics, 
  useWaitTimeData, 
  useThroughputData 
} from './hooks';

export const useAnalyticsData = (
  completedQueues: Queue[],
  waitingQueues: Queue[]
) => {
  // Use modular hooks to manage state and fetch data
  const { timeFrame, setTimeFrame } = useTimeFrameState();
  
  const {
    currentAlgorithm,
    recommendedAlgorithm,
    shouldChangeAlgorithm,
    urgentCount,
    elderlyCount,
    handleChangeAlgorithm
  } = useAlgorithmState(waitingQueues);
  
  const { averageWaitTime, averageServiceTime } = useQueueMetrics(completedQueues);
  const waitTimeData = useWaitTimeData(timeFrame);
  const throughputData = useThroughputData(timeFrame);

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
