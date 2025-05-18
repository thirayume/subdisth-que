
import * as React from 'react';
import { QueueAlgorithmType, QueueTypeWithAlgorithm, ServicePointCapability } from '@/utils/queueAlgorithms';
import { sortQueuesByAlgorithm } from '@/utils/queueAlgorithms';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import { Queue } from '@/integrations/supabase/schema';

const logger = createLogger('useQueueAlgorithm');

export const useQueueAlgorithm = () => {
  // Load algorithm and queue types from localStorage and Supabase
  const [queueAlgorithm, setQueueAlgorithm] = React.useState<QueueAlgorithmType>(QueueAlgorithmType.FIFO);
  const [queueTypes, setQueueTypes] = React.useState<QueueTypeWithAlgorithm[]>([]);
  
  React.useEffect(() => {
    logger.info('Loading queue algorithm and types');
    
    // Load algorithm from settings
    const fetchQueueAlgorithm = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('category', 'queue')
          .eq('key', 'queue_algorithm')
          .single();
          
        if (error) {
          logger.error('Error fetching queue algorithm from database:', error);
          // Fall back to localStorage
          const savedAlgorithm = localStorage.getItem('queue_algorithm') as QueueAlgorithmType | null;
          if (savedAlgorithm) {
            setQueueAlgorithm(savedAlgorithm);
          }
          return;
        }
        
        if (data?.value) {
          const algorithm = data.value as QueueAlgorithmType;
          setQueueAlgorithm(algorithm);
          // Update localStorage as well
          localStorage.setItem('queue_algorithm', algorithm);
        }
      } catch (err) {
        logger.error('Error in fetchQueueAlgorithm:', err);
        // Fall back to localStorage
        const savedAlgorithm = localStorage.getItem('queue_algorithm') as QueueAlgorithmType | null;
        if (savedAlgorithm) {
          setQueueAlgorithm(savedAlgorithm);
        }
      }
    };
    
    // Load queue types from settings
    const fetchQueueTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('queue_types')
          .select('*')
          .eq('enabled', true);
          
        if (error) {
          logger.error('Error fetching queue types from database:', error);
          // Fall back to localStorage
          const savedQueueTypes = localStorage.getItem('queue_types');
          if (savedQueueTypes) {
            try {
              const parsedQueueTypes = JSON.parse(savedQueueTypes);
              setQueueTypes(parsedQueueTypes);
            } catch (error) {
              logger.error('Error parsing queue types from localStorage:', error);
            }
          }
          return;
        }
        
        if (data && data.length > 0) {
          setQueueTypes(data as QueueTypeWithAlgorithm[]);
          // Update localStorage as well
          localStorage.setItem('queue_types', JSON.stringify(data));
        }
      } catch (err) {
        logger.error('Error in fetchQueueTypes:', err);
        // Fall back to localStorage
        const savedQueueTypes = localStorage.getItem('queue_types');
        if (savedQueueTypes) {
          try {
            const parsedQueueTypes = JSON.parse(savedQueueTypes);
            setQueueTypes(parsedQueueTypes);
          } catch (error) {
            logger.error('Error parsing queue types from localStorage:', error);
          }
        }
      }
    };
    
    fetchQueueAlgorithm();
    fetchQueueTypes();
  }, []);
  
  // Sort queues by the selected algorithm
  const sortQueues = (
    queuesToSort: Queue[],
    servicePointCapabilities: ServicePointCapability[] = [],
    selectedServicePointId?: string
  ) => {
    return sortQueuesByAlgorithm(
      queuesToSort, 
      queueTypes, 
      queueAlgorithm, 
      servicePointCapabilities,
      selectedServicePointId
    );
  };

  return {
    queueAlgorithm,
    setQueueAlgorithm,
    queueTypes,
    sortQueues
  };
};
