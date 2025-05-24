
import * as React from 'react';
import { QueueAlgorithmType, QueueTypeWithAlgorithm, ServicePointCapability, sortQueuesByAlgorithm } from '@/utils/queueAlgorithms';
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
          .maybeSingle(); // Use maybeSingle instead of single to handle no results
          
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
          // Handle JSON value from database with proper type conversion
          let algorithm: QueueAlgorithmType;
          
          if (typeof data.value === 'string') {
            // If it's a JSON string, parse it
            try {
              algorithm = JSON.parse(data.value) as QueueAlgorithmType;
            } catch (parseError) {
              logger.error('Error parsing queue algorithm JSON:', parseError);
              algorithm = QueueAlgorithmType.FIFO;
            }
          } else {
            // If it's already a value, convert through unknown for type safety
            algorithm = data.value as unknown as QueueAlgorithmType;
          }
          
          setQueueAlgorithm(algorithm);
          // Update localStorage as well
          localStorage.setItem('queue_algorithm', algorithm);
        } else {
          // No data found, use default FIFO algorithm
          logger.info('No queue algorithm setting found, using default FIFO');
          setQueueAlgorithm(QueueAlgorithmType.FIFO);
          localStorage.setItem('queue_algorithm', QueueAlgorithmType.FIFO);
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
        } else {
          // No queue types found, log warning
          logger.warn('No enabled queue types found in database');
          setQueueTypes([]);
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
  ): Queue[] => {
    return sortQueuesByAlgorithm(
      queuesToSort, 
      queueTypes, 
      queueAlgorithm, 
      servicePointCapabilities,
      selectedServicePointId
    ) as Queue[];  // Type assertion to ensure compatibility
  };

  return {
    queueAlgorithm,
    setQueueAlgorithm,
    queueTypes,
    sortQueues
  };
};
