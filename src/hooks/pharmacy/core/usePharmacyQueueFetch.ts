
import * as React from 'react';
import { PharmacyQueue } from '../types';
import { usePharmacyState } from './usePharmacyState';
import { usePharmacyDataFetch } from './usePharmacyDataFetch';
import { usePharmacyRealtime } from './usePharmacyRealtime';
import { usePharmacyErrorHandler } from './usePharmacyErrorHandler';
import { createLogger } from '@/utils/logger';

const logger = createLogger('PharmacyQueueFetch');

export const usePharmacyQueueFetch = () => {
  const {
    queues,
    activeQueue,
    loading,
    setQueues,
    setActiveQueue,
    setLoading
  } = usePharmacyState();

  const { error } = usePharmacyErrorHandler();
  const { fetchPharmacyQueues, findActiveServiceQueue } = usePharmacyDataFetch();

  const refreshQueues = React.useCallback(async (): Promise<PharmacyQueue[]> => {
    try {
      setLoading(true);
      logger.info('Refreshing pharmacy queues');

      const queueData = await fetchPharmacyQueues();
      if (!queueData) return [];

      setQueues(queueData);
      
      // Set active queue if there's one already in service
      const inServiceQueue = findActiveServiceQueue(queueData);
      setActiveQueue(inServiceQueue);
      
      logger.info(`Refreshed ${queueData.length} pharmacy queues`);
      return queueData;
    } catch (err) {
      logger.error('Error refreshing queues:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetchPharmacyQueues, findActiveServiceQueue, setQueues, setActiveQueue, setLoading]);

  // Set up real-time subscription
  usePharmacyRealtime({
    onQueueChange: React.useCallback(() => {
      logger.debug('Real-time change detected, refreshing queues');
      refreshQueues();
    }, [refreshQueues]),
    enabled: true,
    debounceMs: 300
  });

  // Initial fetch
  React.useEffect(() => {
    refreshQueues();
  }, [refreshQueues]);

  return {
    queues,
    activeQueue,
    setActiveQueue,
    loading,
    error: error?.message || null,
    fetchPharmacyQueues: refreshQueues
  };
};
