
import { useState, useEffect } from 'react';
import { Queue } from '@/integrations/supabase/schema';
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { th } from 'date-fns/locale';
import { QueueAlgorithmType, getOptimalAlgorithmForPharmacy } from '@/utils/queueAlgorithms';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Calculate metrics from real data
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
    const fetchAnalyticsData = async () => {
      try {
        let startDate: Date;
        let endDate = new Date();
        
        // Set time range based on timeFrame
        if (timeFrame === 'day') {
          startDate = startOfDay(new Date());
        } else if (timeFrame === 'week') {
          startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
        } else { // month
          startDate = startOfMonth(new Date());
        }
        
        // Fetch wait time data from completed queues directly from Supabase
        const { data: waitTimeQueryData, error: waitTimeError } = await supabase
          .from('queues')
          .select('created_at, called_at')
          .not('called_at', 'is', null)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: true });
          
        if (waitTimeError) {
          console.error('Error fetching wait time data:', waitTimeError);
          return;
        }
        
        // Process wait time data
        const waitTimeMap = new Map();
        
        waitTimeQueryData?.forEach(queue => {
          if (queue.called_at && queue.created_at) {
            const waitMs = new Date(queue.called_at).getTime() - new Date(queue.created_at).getTime();
            const waitMinutes = waitMs / 60000;
            
            let timeKey: string;
            const createdDate = new Date(queue.created_at);
            
            if (timeFrame === 'day') {
              timeKey = format(createdDate, 'HH:00', { locale: th });
            } else {
              timeKey = format(createdDate, 'dd MMM', { locale: th });
            }
            
            if (!waitTimeMap.has(timeKey)) {
              waitTimeMap.set(timeKey, { count: 0, total: 0 });
            }
            
            const current = waitTimeMap.get(timeKey);
            waitTimeMap.set(timeKey, {
              count: current.count + 1,
              total: current.total + waitMinutes
            });
          }
        });
        
        // Generate data for all time points in the range
        const waitTimeChartData = [];
        
        if (timeFrame === 'day') {
          for (let hour = 0; hour < 24; hour++) {
            const timeKey = `${hour.toString().padStart(2, '0')}:00`;
            const data = waitTimeMap.get(timeKey);
            
            waitTimeChartData.push({
              time: timeKey,
              waitTime: data ? Math.round(data.total / data.count) : 0
            });
          }
        } else {
          let currentDate = new Date(startDate);
          
          while (currentDate <= endDate) {
            const timeKey = format(currentDate, 'dd MMM', { locale: th });
            const data = waitTimeMap.get(timeKey);
            
            waitTimeChartData.push({
              time: timeKey,
              waitTime: data ? Math.round(data.total / data.count) : 0
            });
            
            currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
          }
        }
        
        setWaitTimeData(waitTimeChartData);
        
        // Fetch throughput data (completed queues count) directly from Supabase
        const { data: throughputQueryData, error: throughputError } = await supabase
          .from('queues')
          .select('completed_at, status')
          .eq('status', 'COMPLETED')
          .gte('completed_at', startDate.toISOString())
          .lte('completed_at', endDate.toISOString())
          .order('completed_at', { ascending: true });
          
        if (throughputError) {
          console.error('Error fetching throughput data:', throughputError);
          return;
        }
        
        // Process throughput data
        const throughputMap = new Map();
        
        throughputQueryData?.forEach(queue => {
          if (queue.completed_at) {
            let timeKey: string;
            const completedDate = new Date(queue.completed_at);
            
            if (timeFrame === 'day') {
              timeKey = format(completedDate, 'HH:00', { locale: th });
            } else {
              timeKey = format(completedDate, 'dd MMM', { locale: th });
            }
            
            if (!throughputMap.has(timeKey)) {
              throughputMap.set(timeKey, 0);
            }
            
            throughputMap.set(timeKey, throughputMap.get(timeKey) + 1);
          }
        });
        
        // Generate data for all time points in the range
        const throughputChartData = [];
        
        if (timeFrame === 'day') {
          for (let hour = 0; hour < 24; hour++) {
            const timeKey = `${hour.toString().padStart(2, '0')}:00`;
            
            throughputChartData.push({
              time: timeKey,
              count: throughputMap.get(timeKey) || 0
            });
          }
        } else {
          let currentDate = new Date(startDate);
          
          while (currentDate <= endDate) {
            const timeKey = format(currentDate, 'dd MMM', { locale: th });
            
            throughputChartData.push({
              time: timeKey,
              count: throughputMap.get(timeKey) || 0
            });
            
            currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
          }
        }
        
        setThroughputData(throughputChartData);
        
      } catch (error) {
        console.error('Error in fetchAnalyticsData:', error);
      }
    };
    
    fetchAnalyticsData();
  }, [timeFrame]);

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
