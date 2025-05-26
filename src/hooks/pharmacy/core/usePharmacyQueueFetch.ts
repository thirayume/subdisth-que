
import * as React from 'react';
import { PharmacyQueue } from '../types';
import { usePharmacyState } from './usePharmacyState';
import { usePharmacyDataFetch } from './usePharmacyDataFetch';
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

  // Removed usePharmacyRealtime to prevent conflicting subscriptions
  // Real-time updates are now handled by the global manager

  // Initial fetch only
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
