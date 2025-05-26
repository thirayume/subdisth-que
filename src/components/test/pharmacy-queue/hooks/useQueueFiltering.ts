
import { useMemo } from 'react';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueueFiltering');

interface UseQueueFilteringProps {
  queues: any[];
  servicePointId: string;
  servicePoints: any[];
}

export const useQueueFiltering = ({ queues, servicePointId, servicePoints }: UseQueueFilteringProps) => {
  // Memoize the selected service point
  const selectedServicePoint = useMemo(() => {
    return servicePoints.find(sp => sp.id === servicePointId);
  }, [servicePoints, servicePointId]);

  // Memoize filtered queues with optimized filtering
  const servicePointQueues = useMemo(() => {
    if (!selectedServicePoint) {
      return [];
    }
    
    const filtered = queues.filter(q => q.service_point_id === selectedServicePoint.id);
    logger.debug(`Service point ${selectedServicePoint.code} has ${filtered.length} queues`);
    
    return filtered;
  }, [queues, selectedServicePoint]);

  // Memoize queue status groups
  const queuesByStatus = useMemo(() => {
    const waiting = servicePointQueues.filter(q => q.status === 'WAITING');
    const active = servicePointQueues.filter(q => q.status === 'ACTIVE');
    const completed = servicePointQueues.filter(q => q.status === 'COMPLETED');
    // Use 'SKIPPED' instead of 'PAUSED' as that's what exists in the schema
    const paused = servicePointQueues.filter(q => q.status === 'SKIPPED' && q.notes?.includes('PAUSED'));
    const skipped = servicePointQueues.filter(q => q.status === 'SKIPPED' && !q.notes?.includes('PAUSED'));
    
    return { waiting, active, completed, paused, skipped };
  }, [servicePointQueues]);

  return {
    selectedServicePoint,
    servicePointQueues,
    queuesByStatus
  };
};
