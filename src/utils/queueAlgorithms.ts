
import { Queue, QueueType } from '@/integrations/supabase/schema';

// Define the algorithm enum
export enum QueueAlgorithmType {
  FIFO = 'FIFO',
  WEIGHTED = 'WEIGHTED',
  PRIORITY = 'PRIORITY',
  SERVICE_POINT_WEIGHTED = 'SERVICE_POINT_WEIGHTED'
}

// Define the queue type with algorithm
export interface QueueTypeWithAlgorithm {
  id: string;
  code: string;
  name: string;
  algorithm: QueueAlgorithmType;
  priority: number;
}

// Define service point capabilities
export interface ServicePointCapability {
  servicePointId: string;
  queueTypeIds: string[];
}

// FIFO Algorithm (First In, First Out)
const sortByFIFO = (queues: Queue[]): Queue[] => {
  return [...queues].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
};

// Weighted Algorithm (By Queue Type Priority)
const sortByWeighted = (
  queues: Queue[], 
  queueTypes: QueueTypeWithAlgorithm[]
): Queue[] => {
  return [...queues].sort((a, b) => {
    // First sort by queue type priority
    const typeA = queueTypes.find(type => type.code === a.type);
    const typeB = queueTypes.find(type => type.code === b.type);
    
    const priorityA = typeA?.priority || 5;
    const priorityB = typeB?.priority || 5;
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Higher priority first
    }
    
    // If same priority, fall back to creation time
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
};

// Priority Algorithm (Manually set priority for each queue)
const sortByPriority = (queues: Queue[]): Queue[] => {
  // In future versions, individual queues can have priority values
  // For now, just use FIFO as fallback
  return sortByFIFO(queues);
};

// Service Point Based Weighted Algorithm 
const sortByServicePointWeighted = (
  queues: Queue[],
  queueTypes: QueueTypeWithAlgorithm[],
  servicePoints: ServicePointCapability[],
  selectedServicePointId?: string
): Queue[] => {
  // Filter queues that can be served by the selected service point
  if (selectedServicePointId) {
    const servicePoint = servicePoints.find(sp => sp.servicePointId === selectedServicePointId);
    if (servicePoint) {
      // Filter queues by queue types that this service point can handle
      const serviceableQueueTypes = servicePoint.queueTypeIds;
      const serviceableQueues = queues.filter(queue => {
        const queueType = queueTypes.find(type => type.code === queue.type);
        return queueType && serviceableQueueTypes.includes(queueType.id);
      });
      
      // Then apply weighted algorithm to the filtered queues
      return sortByWeighted(serviceableQueues, queueTypes);
    }
  }
  
  // If no service point is selected or not found, fall back to regular weighted algorithm
  return sortByWeighted(queues, queueTypes);
};

// Main queue sorting function
export const sortQueuesByAlgorithm = (
  queues: Queue[],
  queueTypes: QueueTypeWithAlgorithm[] | null = null,
  algorithm: QueueAlgorithmType = QueueAlgorithmType.FIFO,
  servicePoints: ServicePointCapability[] = [],
  selectedServicePointId?: string
): Queue[] => {
  if (!queues || queues.length === 0) return [];
  
  console.log(`Sorting ${queues.length} queues using algorithm: ${algorithm}`);
  
  switch (algorithm) {
    case QueueAlgorithmType.FIFO:
      return sortByFIFO(queues);
      
    case QueueAlgorithmType.WEIGHTED:
      return queueTypes ? sortByWeighted(queues, queueTypes) : sortByFIFO(queues);
      
    case QueueAlgorithmType.PRIORITY:
      return sortByPriority(queues);
      
    case QueueAlgorithmType.SERVICE_POINT_WEIGHTED:
      return queueTypes 
        ? sortByServicePointWeighted(queues, queueTypes, servicePoints, selectedServicePointId) 
        : sortByFIFO(queues);
        
    default:
      return sortByFIFO(queues);
  }
};
