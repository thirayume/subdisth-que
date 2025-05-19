
import { supabase } from '@/integrations/supabase/client';
import { Queue } from '@/integrations/supabase/schema';
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';
import { mapToQueueObject } from './queueMapping';
import { safeGetPriority } from './queueTypes';

// Function to get next queue based on algorithm type
export const getNextQueue = async (
  servicePointId: string | null,
  algorithm: QueueAlgorithmType
): Promise<Queue | null> => {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Get waiting queues for today
    let query = supabase
      .from('queues')
      .select(`
        *,
        queue_type:type
      `)
      .eq('queue_date', today)
      .eq('status', 'WAITING');
    
    // Filter by service point capabilities if servicePointId is provided
    if (servicePointId) {
      // Get service point capabilities
      const { data: servicePointCapabilities } = await supabase
        .from('service_point_queue_types')
        .select(`
          queue_type_id,
          queue_type:queue_types(code)
        `)
        .eq('service_point_id', servicePointId);
      
      if (servicePointCapabilities && servicePointCapabilities.length > 0) {
        const validTypes = servicePointCapabilities.map(cap => 
          cap.queue_type?.code || ''
        ).filter(code => code !== '');
        
        if (validTypes.length > 0) {
          query = query.in('type', validTypes);
        }
      }
    }
    
    const { data: waitingQueues, error } = await query;
    
    if (error) {
      throw error;
    }
    
    if (!waitingQueues || waitingQueues.length === 0) {
      return null; // No waiting queues
    }

    // Get queue types to access priority information
    const { data: queueTypesData } = await supabase
      .from('queue_types')
      .select('id, code, priority, algorithm');

    const queueTypeMap = queueTypesData ? 
      queueTypesData.reduce((map: Record<string, any>, qt) => {
        map[qt.code] = qt;
        return map;
      }, {}) : {};
    
    // Apply queue algorithm based on the selected type
    const nextQueue = await applyQueueAlgorithm(waitingQueues, queueTypeMap, algorithm);
    return nextQueue;
    
  } catch (error) {
    console.error('Error getting next queue:', error);
    return null;
  }
};

// Modified function that properly handles the async nature
async function applyQueueAlgorithm(
  waitingQueues: any[],
  queueTypeMap: Record<string, any>,
  algorithm: QueueAlgorithmType
): Promise<Queue | null> {
  switch (algorithm) {
    case QueueAlgorithmType.FIFO:
      return applyFifoAlgorithm(waitingQueues);
    case QueueAlgorithmType.PRIORITY:
      return applyPriorityAlgorithm(waitingQueues, queueTypeMap);
    case QueueAlgorithmType.MULTILEVEL:
      return applyMultilevelAlgorithm(waitingQueues, queueTypeMap);
    case QueueAlgorithmType.MULTILEVEL_FEEDBACK:
      return applyMultilevelFeedbackAlgorithm(waitingQueues, queueTypeMap);
    default:
      return applyFifoAlgorithm(waitingQueues);
  }
}

// FIFO algorithm implementation
function applyFifoAlgorithm(waitingQueues: any[]): Queue | null {
  return waitingQueues.length > 0 ?
    [...waitingQueues]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(mapToQueueObject)[0] || null
    : null;
}

// Priority algorithm implementation
function applyPriorityAlgorithm(waitingQueues: any[], queueTypeMap: Record<string, any>): Queue | null {
  const queuesWithPriority = waitingQueues.map(q => {
    // Look up the priority from our queue types map
    const queueTypeInfo = queueTypeMap[q.type] || { priority: 5 };
    return {
      ...q,
      calculatedPriority: queueTypeInfo.priority || 5
    };
  });
  
  const sortedByPriority = [...queuesWithPriority].sort((a, b) => {
    // Sort by priority (high to low)
    if (b.calculatedPriority !== a.calculatedPriority) {
      return b.calculatedPriority - a.calculatedPriority;
    }
    // Then by creation time
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
  
  return sortedByPriority.length > 0 ? mapToQueueObject(sortedByPriority[0]) : null;
}

// Multilevel algorithm implementation
async function applyMultilevelAlgorithm(waitingQueues: any[], queueTypeMap: Record<string, any>): Promise<Queue | null> {
  const today = new Date().toISOString().split('T')[0];
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  // Get completed queues in the last hour
  const { data: completedQueues } = await supabase
    .from('queues')
    .select('type')
    .eq('queue_date', today)
    .eq('status', 'COMPLETED')
    .gte('completed_at', oneHourAgo);
    
  // Manually count completions by type
  const typeCompletionCounts: Record<string, number> = {};
  if (completedQueues) {
    completedQueues.forEach(q => {
      typeCompletionCounts[q.type] = (typeCompletionCounts[q.type] || 0) + 1;
    });
  }
  
  // Find queue types with lower completion rates
  const queueTypeFrequency = new Map<string, number>();
  waitingQueues.forEach(q => {
    const type = q.type;
    queueTypeFrequency.set(type, (queueTypeFrequency.get(type) || 0) + 1);
  });
  
  // Calculate scores for each queue
  const queuesWithScore = waitingQueues.map(q => {
    const waitingCountForType = queueTypeFrequency.get(q.type) || 0;
    const completedCountForType = typeCompletionCounts[q.type] || 0;
    // Look up the priority from our queue types map
    const queueTypeInfo = queueTypeMap[q.type] || { priority: 5 };
    const priority = queueTypeInfo.priority || 5;
    const waitTime = new Date().getTime() - new Date(q.created_at).getTime();
    
    // Score favors types with many waiting and few completed, high priority, and long wait time
    const score = 
      (waitingCountForType / (completedCountForType + 1)) * 
      priority * 
      (waitTime / 60000); // Convert ms to minutes
      
    return { ...q, score };
  });
  
  // Sort by score (highest first)
  return queuesWithScore.length > 0 ? 
    mapToQueueObject(queuesWithScore.sort((a, b) => b.score - a.score)[0]) : 
    null;
}

// Multilevel feedback algorithm implementation
function applyMultilevelFeedbackAlgorithm(waitingQueues: any[], queueTypeMap: Record<string, any>): Queue | null {
  // Calculate a score based on wait time and priority
  const queuesWithFeedbackScore = waitingQueues.map(q => {
    const waitTimeMs = new Date().getTime() - new Date(q.created_at).getTime();
    const waitTimeMinutes = waitTimeMs / 60000;
    // Look up the priority from our queue types map
    const queueTypeInfo = queueTypeMap[q.type] || { priority: 5 };
    const priority = queueTypeInfo.priority || 5;
    
    // Waiting time gets more weight over time - after certain thresholds, priority increases
    let effectivePriority = priority;
    if (waitTimeMinutes > 30) effectivePriority += 2;
    else if (waitTimeMinutes > 15) effectivePriority += 1;
    
    // Final score is a combination of effective priority and wait time
    const feedbackScore = effectivePriority * Math.log10(1 + waitTimeMinutes);
    
    return { ...q, feedbackScore };
  });
  
  // Sort by feedback score (highest first)
  return queuesWithFeedbackScore.length > 0 ?
    mapToQueueObject(queuesWithFeedbackScore.sort((a, b) => b.feedbackScore - a.feedbackScore)[0]) :
    null;
}
