
export enum QueueAlgorithmType {
  FIFO = "FIFO",
  PRIORITY = "PRIORITY",
  MULTILEVEL = "MULTILEVEL",
  MULTILEVEL_FEEDBACK = "MULTILEVEL_FEEDBACK"
}

// Service point capability type for algorithm use
export interface ServicePointCapability {
  servicePointId: string;
  queueTypeIds: string[];
}

// Extended queue type with algorithm info
export interface QueueTypeWithAlgorithm {
  id: string;
  code: string;
  priority: number;
  algorithm: QueueAlgorithmType;
}

// Sort queues based on the selected algorithm
export const sortQueuesByAlgorithm = (
  queues: any[],
  queueTypes: QueueTypeWithAlgorithm[],
  algorithm: QueueAlgorithmType = QueueAlgorithmType.FIFO,
  servicePointCapabilities: ServicePointCapability[] = [],
  selectedServicePointId?: string
) => {
  // Clone the queues array to avoid modifying the original
  const sortedQueues = [...queues];
  
  // If specific service point is selected, filter by queue types it can handle
  if (selectedServicePointId) {
    const selectedCapability = servicePointCapabilities.find(
      cap => cap.servicePointId === selectedServicePointId
    );
    
    if (selectedCapability) {
      // Sort queues based on whether they can be handled by this service point
      sortedQueues.sort((a, b) => {
        const aCanHandle = queueTypeMatchesServicePoint(a.id, selectedCapability.queueTypeIds);
        const bCanHandle = queueTypeMatchesServicePoint(b.id, selectedCapability.queueTypeIds);
        
        if (aCanHandle && !bCanHandle) return -1;
        if (!aCanHandle && bCanHandle) return 1;
        return 0;
      });
    }
  }
  
  // Sort based on the selected algorithm
  switch (algorithm) {
    case QueueAlgorithmType.PRIORITY:
      return sortByPriority(sortedQueues, queueTypes);
      
    case QueueAlgorithmType.MULTILEVEL:
      return sortByMultilevel(sortedQueues, queueTypes);
      
    case QueueAlgorithmType.MULTILEVEL_FEEDBACK:
      return sortByMultilevelFeedback(sortedQueues, queueTypes);
      
    case QueueAlgorithmType.FIFO:
    default:
      return sortByFIFO(sortedQueues);
  }
};

// Check if a queue's type matches any in the service point's capabilities
const queueTypeMatchesServicePoint = (queueTypeId: string, servicePointQueueTypes: string[]) => {
  return servicePointQueueTypes.includes(queueTypeId);
};

// First In, First Out sorting
const sortByFIFO = (queues: any[]) => {
  return queues.sort((a, b) => {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
};

// Priority-based sorting
const sortByPriority = (queues: any[], queueTypes: QueueTypeWithAlgorithm[]) => {
  return queues.sort((a, b) => {
    // Find queue type info
    const aType = queueTypes.find(qt => qt.id === a.type || qt.code === a.type);
    const bType = queueTypes.find(qt => qt.id === b.type || qt.code === b.type);
    
    // Compare by priority (higher priority first)
    const aPriority = aType ? aType.priority : 0;
    const bPriority = bType ? bType.priority : 0;
    
    if (bPriority !== aPriority) {
      return bPriority - aPriority;
    }
    
    // If same priority, sort by creation time (FIFO)
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
};

// Multilevel queue sorting - groups by type and then sorts within groups
const sortByMultilevel = (queues: any[], queueTypes: QueueTypeWithAlgorithm[]) => {
  // First group queues by type
  const queueGroups: Record<string, any[]> = {};
  
  queues.forEach(queue => {
    const type = queue.type;
    if (!queueGroups[type]) {
      queueGroups[type] = [];
    }
    queueGroups[type].push(queue);
  });
  
  // Sort each group by creation time
  Object.keys(queueGroups).forEach(type => {
    queueGroups[type].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  });
  
  // Get queue types in order of priority
  const typesByPriority = [...queueTypes].sort((a, b) => b.priority - a.priority);
  
  // Flatten the groups back to an array in order of priority
  return typesByPriority.reduce((result, queueType) => {
    const type = queueType.id || queueType.code;
    return result.concat(queueGroups[type] || []);
  }, [] as any[]);
};

// Multilevel feedback queue - considers waiting time along with priority
const sortByMultilevelFeedback = (queues: any[], queueTypes: QueueTypeWithAlgorithm[]) => {
  return queues.sort((a, b) => {
    const aType = queueTypes.find(qt => qt.id === a.type || qt.code === a.type);
    const bType = queueTypes.find(qt => qt.id === b.type || qt.code === b.type);
    
    // Base priority
    const aPriority = aType ? aType.priority : 0;
    const bPriority = bType ? bType.priority : 0;
    
    // Calculate waiting time in minutes
    const now = new Date().getTime();
    const aWaitTime = (now - new Date(a.created_at).getTime()) / 60000;
    const bWaitTime = (now - new Date(b.created_at).getTime()) / 60000;
    
    // Dynamic priority calculation based on waiting time
    // Increase priority by 1 for every 10 minutes of waiting
    const aAdjustedPriority = aPriority + Math.floor(aWaitTime / 10);
    const bAdjustedPriority = bPriority + Math.floor(bWaitTime / 10);
    
    if (aAdjustedPriority !== bAdjustedPriority) {
      return bAdjustedPriority - aAdjustedPriority;
    }
    
    // If adjusted priority is the same, prioritize the one that's been waiting longer
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
};
