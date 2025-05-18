
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';
import { QueueType } from '@/hooks/useQueueTypes';
import { supabase } from '@/integrations/supabase/client';
import { Queue, QueueStatus, ServicePoint, QueueTypeEnum } from '@/integrations/supabase/schema';

// Helper function to safely cast a string to QueueTypeEnum
const ensureQueueTypeEnum = (type: string): QueueTypeEnum => {
  const validTypes: QueueTypeEnum[] = ['GENERAL', 'PRIORITY', 'ELDERLY', 'FOLLOW_UP'];
  return validTypes.includes(type as QueueTypeEnum) 
    ? type as QueueTypeEnum 
    : 'GENERAL';
};

// Helper function to safely cast a string to QueueStatus
const ensureQueueStatus = (status: string): QueueStatus => {
  const validStatuses: QueueStatus[] = ['WAITING', 'ACTIVE', 'COMPLETED', 'SKIPPED'];
  return validStatuses.includes(status as QueueStatus)
    ? status as QueueStatus
    : 'WAITING';
};

// Function to convert a Supabase queue result to a strongly-typed Queue object
const mapToQueueObject = (queueData: any): Queue => {
  return {
    id: queueData.id,
    number: queueData.number,
    patient_id: queueData.patient_id,
    type: ensureQueueTypeEnum(queueData.type),
    status: ensureQueueStatus(queueData.status),
    service_point_id: queueData.service_point_id,
    notes: queueData.notes || null,
    created_at: queueData.created_at,
    updated_at: queueData.updated_at,
    called_at: queueData.called_at || null,
    completed_at: queueData.completed_at || null,
    queue_date: queueData.queue_date || null
  };
};

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
        queue_type:type(id, name, code, algorithm, priority)
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
        const validTypes = servicePointCapabilities.map(cap => cap.queue_type.code);
        query = query.in('type', validTypes);
      }
    }
    
    const { data: waitingQueues, error } = await query;
    
    if (error) {
      throw error;
    }
    
    if (!waitingQueues || waitingQueues.length === 0) {
      return null; // No waiting queues
    }
    
    // Apply queue algorithm
    let nextQueue: Queue | null = null;
    
    switch (algorithm) {
      case QueueAlgorithmType.FIFO:
        // First in, first out - sort by created_at (oldest first)
        nextQueue = [...waitingQueues]
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map(mapToQueueObject)[0] || null;
        break;
        
      case QueueAlgorithmType.PRIORITY:
        // Use queue type priority - highest priority first, then FIFO
        const queuesWithPriority = waitingQueues.map(q => ({
          ...q,
          calculatedPriority: q.queue_type?.priority || 0
        }));
        
        const sortedByPriority = [...queuesWithPriority].sort((a, b) => {
          // Sort by priority (high to low)
          if (b.calculatedPriority !== a.calculatedPriority) {
            return b.calculatedPriority - a.calculatedPriority;
          }
          // Then by creation time
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
        
        nextQueue = sortedByPriority[0] ? mapToQueueObject(sortedByPriority[0]) : null;
        break;
        
      case QueueAlgorithmType.MULTILEVEL:
        // Check if there are any high priority queue types that haven't been called for a while
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        
        // Get counts of completed queues by type in the last hour
        const { data: typeCounts } = await supabase
          .from('queues')
          .select('type, count(*)')
          .eq('queue_date', today)
          .eq('status', 'COMPLETED')
          .gte('completed_at', oneHourAgo)
          .groupBy('type');
        
        const typeCompletionCounts = typeCounts ? 
          Object.fromEntries(typeCounts.map(t => [t.type, parseInt(t.count)])) :
          {};
        
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
          const priority = q.queue_type?.priority || 5;
          const waitTime = new Date().getTime() - new Date(q.created_at).getTime();
          
          // Score favors types with many waiting and few completed, high priority, and long wait time
          const score = 
            (waitingCountForType / (completedCountForType + 1)) * 
            priority * 
            (waitTime / 60000); // Convert ms to minutes
            
          return { ...q, score };
        });
        
        // Sort by score (highest first)
        nextQueue = queuesWithScore[0] ? 
          mapToQueueObject(queuesWithScore.sort((a, b) => b.score - a.score)[0]) : 
          null;
        break;
        
      case QueueAlgorithmType.MULTILEVEL_FEEDBACK:
        // Calculate a score based on wait time and priority
        const queuesWithFeedbackScore = waitingQueues.map(q => {
          const waitTimeMs = new Date().getTime() - new Date(q.created_at).getTime();
          const waitTimeMinutes = waitTimeMs / 60000;
          const priority = q.queue_type?.priority || 5;
          
          // Waiting time gets more weight over time - after certain thresholds, priority increases
          let effectivePriority = priority;
          if (waitTimeMinutes > 30) effectivePriority += 2;
          else if (waitTimeMinutes > 15) effectivePriority += 1;
          
          // Final score is a combination of effective priority and wait time
          const feedbackScore = effectivePriority * Math.log10(1 + waitTimeMinutes);
          
          return { ...q, feedbackScore };
        });
        
        // Sort by feedback score (highest first)
        nextQueue = queuesWithFeedbackScore[0] ?
          mapToQueueObject(queuesWithFeedbackScore.sort((a, b) => b.feedbackScore - a.feedbackScore)[0]) :
          null;
        break;
        
      default:
        // Default to FIFO
        nextQueue = [...waitingQueues]
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map(mapToQueueObject)[0] || null;
        break;
    }
    
    return nextQueue;
    
  } catch (error) {
    console.error('Error getting next queue:', error);
    return null;
  }
};

// Transfer a queue from one service point to another
export const transferQueue = async (
  queueId: string, 
  sourceServicePointId: string,
  targetServicePointId: string,
  notes?: string
): Promise<boolean> => {
  try {
    const now = new Date().toISOString();
    
    // Complete the queue at the current service point
    const { error: completeError } = await supabase
      .from('queues')
      .update({
        status: 'COMPLETED',
        completed_at: now,
        notes: notes ? `${notes} (Transferred to another service point)` : 'Transferred to another service point'
      })
      .eq('id', queueId)
      .eq('service_point_id', sourceServicePointId);
      
    if (completeError) {
      throw completeError;
    }
    
    // Get the queue details to create a new queue at the target service point
    const { data: queueData, error: queueError } = await supabase
      .from('queues')
      .select('number, patient_id, type, notes')
      .eq('id', queueId)
      .single();
      
    if (queueError) {
      throw queueError;
    }
    
    if (!queueData) {
      throw new Error('Queue not found');
    }
    
    // Create a new queue at the target service point
    const { error: createError } = await supabase
      .from('queues')
      .insert({
        number: queueData.number, // Keep the same queue number
        patient_id: queueData.patient_id,
        type: queueData.type,
        status: 'WAITING',
        service_point_id: targetServicePointId,
        notes: notes ? `${notes} (Transferred from another service point)` : 'Transferred from another service point'
      });
      
    if (createError) {
      throw createError;
    }
    
    return true;
  } catch (error) {
    console.error('Error transferring queue:', error);
    return false;
  }
};

// Hold a queue
export const holdQueue = async (
  queueId: string, 
  servicePointId: string,
  reason?: string
): Promise<boolean> => {
  try {
    // Change status to WAITING (from ACTIVE)
    const { error } = await supabase
      .from('queues')
      .update({
        status: 'WAITING',
        // Don't clear called_at to preserve the original call time
        notes: reason ? `[HOLD] ${reason}` : '[HOLD] Queue temporarily on hold'
      })
      .eq('id', queueId)
      .eq('service_point_id', servicePointId)
      .eq('status', 'ACTIVE');
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error holding queue:', error);
    return false;
  }
};

// Get queue history for a patient
export const getPatientQueueHistory = async (patientId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('queues')
      .select(`
        *,
        service_point:service_points(id, name)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting patient queue history:', error);
    return [];
  }
};

// Get service point details with queue type capabilities
export const getServicePointDetails = async (servicePointId: string): Promise<any> => {
  try {
    // Get service point details
    const { data: servicePoint, error: servicePointError } = await supabase
      .from('service_points')
      .select('*')
      .eq('id', servicePointId)
      .single();
      
    if (servicePointError) {
      throw servicePointError;
    }
    
    if (!servicePoint) {
      throw new Error('Service point not found');
    }
    
    // Get queue types that this service point can handle
    const { data: queueTypeCapabilities, error: capabilitiesError } = await supabase
      .from('service_point_queue_types')
      .select(`
        queue_type:queue_types(*)
      `)
      .eq('service_point_id', servicePointId);
      
    if (capabilitiesError) {
      throw capabilitiesError;
    }
    
    const queueTypes = queueTypeCapabilities?.map(item => item.queue_type) || [];
    
    return {
      ...servicePoint,
      queueTypes
    };
  } catch (error) {
    console.error('Error getting service point details:', error);
    return null;
  }
};
