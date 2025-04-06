
import { useState, useEffect } from 'react';
import { Queue } from '@/integrations/supabase/schema';
import { format, subDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { QueueAlgorithmType, getOptimalAlgorithmForPharmacy } from '@/utils/queueAlgorithms';

export const useAnalyticsData = (
  completedQueues: Queue[],
  waitingQueues: Queue[]
) => {
  const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month'>('day');
  const [waitTimeData, setWaitTimeData] = useState<any[]>([]);
  const [throughputData, setThroughputData] = useState<any[]>([]);
  const [currentAlgorithm, setCurrentAlgorithm] = useState<QueueAlgorithmType>(
    localStorage.getItem('queue_algorithm') as QueueAlgorithmType || QueueAlgorithmType.FIFO
  );
  
  // Calculate metrics
  const averageWaitTime = completedQueues.length > 0 
    ? completedQueues.reduce((sum, queue) => {
        if (queue.called_at && queue.created_at) {
          const waitMs = new Date(queue.called_at).getTime() - new Date(queue.created_at).getTime();
          return sum + (waitMs / 60000);
        }
        return sum;
      }, 0) / completedQueues.length
    : 0;
    
  const averageServiceTime = completedQueues.length > 0 
    ? completedQueues.reduce((sum, queue) => {
        if (queue.completed_at && queue.called_at) {
          const serviceMs = new Date(queue.completed_at).getTime() - new Date(queue.called_at).getTime();
          return sum + (serviceMs / 60000);
        }
        return sum;
      }, 0) / completedQueues.length
    : 0;
  
  const urgentCount = waitingQueues.filter(q => q.type === 'PRIORITY').length;
  const elderlyCount = waitingQueues.filter(q => q.type === 'ELDERLY').length;
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
  
  useEffect(() => {
    const generateWaitTimeData = () => {
      const today = new Date();
      const data = [];
      
      for (let i = 0; i < (timeFrame === 'day' ? 24 : timeFrame === 'week' ? 7 : 30); i++) {
        const date = timeFrame === 'day' 
          ? new Date(today.getFullYear(), today.getMonth(), today.getDate(), i) 
          : subDays(today, i);
        
        const waitTime = Math.round(5 + Math.random() * 20);
        
        data.push({
          time: timeFrame === 'day' 
            ? format(date, 'HH:mm', { locale: th })
            : format(date, 'dd MMM', { locale: th }),
          waitTime: waitTime
        });
      }
      
      return timeFrame === 'day' ? data : data.reverse();
    };
    
    const generateThroughputData = () => {
      const today = new Date();
      const data = [];
      
      for (let i = 0; i < (timeFrame === 'day' ? 24 : timeFrame === 'week' ? 7 : 30); i++) {
        const date = timeFrame === 'day' 
          ? new Date(today.getFullYear(), today.getMonth(), today.getDate(), i) 
          : subDays(today, i);
        
        const patientCount = Math.round(Math.random() * 15);
        
        data.push({
          time: timeFrame === 'day' 
            ? format(date, 'HH:mm', { locale: th })
            : format(date, 'dd MMM', { locale: th }),
          count: patientCount
        });
      }
      
      return timeFrame === 'day' ? data : data.reverse();
    };
    
    setWaitTimeData(generateWaitTimeData());
    setThroughputData(generateThroughputData());
  }, [timeFrame, completedQueues]);

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
