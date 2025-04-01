
import { Queue, QueueType } from '@/integrations/supabase/schema';

export enum QueueAlgorithmType {
  FIFO = 'FIFO',
  PRIORITY = 'PRIORITY',
  MULTILEVEL = 'MULTILEVEL',
  MULTILEVEL_FEEDBACK = 'MULTILEVEL_FEEDBACK',
}

export type QueueTypeWithAlgorithm = {
  id: string;
  code: string;
  name: string;
  prefix: string;
  purpose: string;
  format: '0' | '00' | '000';
  enabled: boolean;
  algorithm: QueueAlgorithmType;
  priority: number; // Used for priority-based algorithms
};

// Base sorting algorithm interface
interface QueueSortingStrategy {
  sort(queues: Queue[], queueTypes: QueueTypeWithAlgorithm[]): Queue[];
}

// First-In-First-Out algorithm
export class FIFOStrategy implements QueueSortingStrategy {
  sort(queues: Queue[]): Queue[] {
    return [...queues].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }
}

// Priority queue algorithm - sorts by queue type priority
export class PriorityStrategy implements QueueSortingStrategy {
  sort(queues: Queue[], queueTypes: QueueTypeWithAlgorithm[]): Queue[] {
    return [...queues].sort((a, b) => {
      // Find priority for each queue type
      const typeA = queueTypes.find(t => t.id === a.type);
      const typeB = queueTypes.find(t => t.id === b.type);
      
      const priorityA = typeA?.priority || 0;
      const priorityB = typeB?.priority || 0;
      
      // First sort by priority, then by creation time
      if (priorityA !== priorityB) {
        return priorityB - priorityA; // Higher priority first
      }
      
      // If same priority, use FIFO
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }
}

// Multilevel Queue algorithm - processes each queue type completely before moving to next
export class MultilevelStrategy implements QueueSortingStrategy {
  sort(queues: Queue[], queueTypes: QueueTypeWithAlgorithm[]): Queue[] {
    // Group queues by type
    const queuesByType: { [key: string]: Queue[] } = {};
    
    // Sort queue types by priority
    const sortedTypes = [...queueTypes].sort((a, b) => b.priority - a.priority);
    
    // Initialize queue groups
    sortedTypes.forEach(type => {
      queuesByType[type.id] = [];
    });
    
    // Group queues by their type
    queues.forEach(queue => {
      const typeId = queue.type;
      if (queuesByType[typeId]) {
        queuesByType[typeId].push(queue);
      }
    });
    
    // Sort each type's queues by creation time (FIFO)
    Object.keys(queuesByType).forEach(typeId => {
      queuesByType[typeId].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
    
    // Flatten the grouped queues in order of priority
    return sortedTypes.flatMap(type => queuesByType[type.id] || []);
  }
}

// Multilevel Feedback Queue - dynamic priority adjustment based on waiting time
export class MultilevelFeedbackStrategy implements QueueSortingStrategy {
  sort(queues: Queue[], queueTypes: QueueTypeWithAlgorithm[]): Queue[] {
    return [...queues].sort((a, b) => {
      // Find base priority for each queue type
      const typeA = queueTypes.find(t => t.id === a.type);
      const typeB = queueTypes.find(t => t.id === b.type);
      
      let priorityA = typeA?.priority || 0;
      let priorityB = typeB?.priority || 0;
      
      // Calculate waiting time in minutes
      const waitingTimeA = (Date.now() - new Date(a.created_at).getTime()) / (1000 * 60);
      const waitingTimeB = (Date.now() - new Date(b.created_at).getTime()) / (1000 * 60);
      
      // Add dynamic priority boost based on waiting time
      // Every 15 minutes of waiting increases priority by 1
      priorityA += Math.floor(waitingTimeA / 15);
      priorityB += Math.floor(waitingTimeB / 15);
      
      // Sort by adjusted priority
      if (priorityA !== priorityB) {
        return priorityB - priorityA;
      }
      
      // If adjusted priority is the same, use original creation time (FIFO)
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }
}

// Mixed/Optimized algorithm for pharmacy queue
export class OptimizedPharmacyStrategy implements QueueSortingStrategy {
  sort(queues: Queue[], queueTypes: QueueTypeWithAlgorithm[]): Queue[] {
    // Copy queues to avoid mutations
    const queuesCopy = [...queues];
    
    // Separate urgent/priority queues
    const urgentQueues = queuesCopy.filter(q => {
      const qType = queueTypes.find(t => t.id === q.type);
      return qType && qType.priority >= 8; // High priority threshold
    });
    
    // Separate elderly queues
    const elderlyQueues = queuesCopy.filter(q => {
      const qType = queueTypes.find(t => t.id === q.type);
      return q.type === 'ELDERLY' || (qType && qType.priority >= 5 && qType.priority < 8);
    });
    
    // Regular queues
    const regularQueues = queuesCopy.filter(q => {
      const qType = queueTypes.find(t => t.id === q.type);
      return (!qType || qType.priority < 5) && q.type !== 'ELDERLY';
    });
    
    // Sort each group by creation time
    urgentQueues.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    elderlyQueues.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    regularQueues.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    // Apply the 4:2:1 rule - for every 4 regular queues, process 2 elderly queues and 1 urgent queue
    const result: Queue[] = [];
    let regularCount = 0;
    let elderlyCount = 0;
    let urgentCount = 0;
    
    // Continue until all queues are processed
    while (regularQueues.length > 0 || elderlyQueues.length > 0 || urgentQueues.length > 0) {
      // Add urgent queue every 7th position
      if (urgentQueues.length > 0 && (urgentCount === 0 || (result.length % 7 === 6))) {
        result.push(urgentQueues.shift()!);
        urgentCount++;
      } 
      // Add elderly queue every 3rd position
      else if (elderlyQueues.length > 0 && (elderlyCount === 0 || ((result.length + 1) % 3 === 0))) {
        result.push(elderlyQueues.shift()!);
        elderlyCount++;
      } 
      // Fill with regular queues
      else if (regularQueues.length > 0) {
        result.push(regularQueues.shift()!);
        regularCount++;
      } 
      // If we've exhausted regular queues but still have elderly
      else if (elderlyQueues.length > 0) {
        result.push(elderlyQueues.shift()!);
        elderlyCount++;
      } 
      // If we've exhausted regular and elderly queues but still have urgent
      else if (urgentQueues.length > 0) {
        result.push(urgentQueues.shift()!);
        urgentCount++;
      }
    }
    
    return result;
  }
}

// Factory to get the appropriate sorting strategy
export class QueueSorterFactory {
  static getStrategy(algorithmType: QueueAlgorithmType): QueueSortingStrategy {
    switch (algorithmType) {
      case QueueAlgorithmType.FIFO:
        return new FIFOStrategy();
      case QueueAlgorithmType.PRIORITY:
        return new PriorityStrategy();
      case QueueAlgorithmType.MULTILEVEL:
        return new MultilevelStrategy();
      case QueueAlgorithmType.MULTILEVEL_FEEDBACK:
        return new MultilevelFeedbackStrategy();
      default:
        return new OptimizedPharmacyStrategy();
    }
  }
}

// Main function to sort queues based on algorithm selection
export const sortQueuesByAlgorithm = (
  queues: Queue[], 
  queueTypes: QueueTypeWithAlgorithm[], 
  algorithm: QueueAlgorithmType = QueueAlgorithmType.FIFO
): Queue[] => {
  const strategy = QueueSorterFactory.getStrategy(algorithm);
  return strategy.sort(queues, queueTypes);
};

// Function to determine which algorithm is best for the current pharmacy scenario
export const getOptimalAlgorithmForPharmacy = (
  waitingCount: number,
  urgentCount: number,
  elderlyCount: number
): QueueAlgorithmType => {
  // If there are many urgent cases, prioritize them
  if (urgentCount > waitingCount * 0.3) {
    return QueueAlgorithmType.PRIORITY;
  }
  
  // If there's a mix of different types with elderly patients
  if (elderlyCount > 0 && urgentCount > 0) {
    return QueueAlgorithmType.MULTILEVEL_FEEDBACK;
  }
  
  // For balanced queues with some priority cases
  if (urgentCount > 0 || elderlyCount > 0) {
    return QueueAlgorithmType.MULTILEVEL;
  }
  
  // Default to FIFO for simple queues
  return QueueAlgorithmType.FIFO;
};
