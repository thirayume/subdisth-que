
import { useMemo } from 'react';
import { Queue, ServicePoint, QueueStatus } from '@/integrations/supabase/schema';

interface UseQueueFilteringProps {
  queues: Queue[];
  servicePointId: string;
  servicePoints: ServicePoint[];
}

export const useQueueFiltering = ({ queues, servicePointId, servicePoints }: UseQueueFilteringProps) => {
  // Ensure we have safe arrays to work with
  const safeQueues = Array.isArray(queues) ? queues : [];
  const safeServicePoints = Array.isArray(servicePoints) ? servicePoints : [];

  const selectedServicePoint = useMemo(() => {
    return safeServicePoints.find(sp => sp.id === servicePointId) || null;
  }, [safeServicePoints, servicePointId]);

  const servicePointQueues = useMemo(() => {
    if (!selectedServicePoint) return [];
    
    return safeQueues.filter(queue => {
      // Filter by service point or show all if no specific service point assigned
      const matchesServicePoint = !queue.service_point_id || queue.service_point_id === selectedServicePoint.id;
      // Only show active queues for pharmacy
      const isActive = queue.status === 'ACTIVE';
      
      return matchesServicePoint && isActive;
    });
  }, [safeQueues, selectedServicePoint]);

  const queuesByStatus = useMemo(() => {
    if (!Array.isArray(servicePointQueues)) return {};
    
    const grouped: Record<QueueStatus, Queue[]> = {
      'WAITING': [],
      'ACTIVE': [],
      'COMPLETED': [],
      'SKIPPED': [],
      'CANCELLED': [],
      'ON_HOLD': []
    };

    servicePointQueues.forEach(queue => {
      if (queue && queue.status && grouped[queue.status as QueueStatus]) {
        grouped[queue.status as QueueStatus].push(queue);
      }
    });

    return grouped;
  }, [servicePointQueues]);

  return {
    selectedServicePoint,
    servicePointQueues: Array.isArray(servicePointQueues) ? servicePointQueues : [],
    queuesByStatus
  };
};
