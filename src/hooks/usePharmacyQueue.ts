
import * as React from 'react';
import { usePharmacyQueueFetch } from './pharmacy/usePharmacyQueueFetch';
import { usePharmacyQueueActions } from './pharmacy/usePharmacyQueueActions';
import { usePharmacyServiceActions } from './pharmacy/usePharmacyServiceActions';
import { PharmacyQueue, PharmacyService } from './pharmacy/types';

// Re-export the types for backward compatibility
export type { PharmacyQueue, PharmacyService };

export const usePharmacyQueue = () => {
  // Get queue state and fetch functionality
  const {
    queues,
    activeQueue,
    setActiveQueue,
    loading,
    error: fetchError,
    fetchPharmacyQueues
  } = usePharmacyQueueFetch();
  
  // Get queue actions (callNextQueue)
  const {
    loadingNext,
    error: queueActionError,
    callNextQueue
  } = usePharmacyQueueActions({
    activeQueue,
    setActiveQueue,
    fetchPharmacyQueues
  });
  
  // Get service actions (complete, forward)
  const {
    error: serviceActionError,
    completeService,
    forwardService
  } = usePharmacyServiceActions({
    activeQueue,
    setActiveQueue,
    fetchPharmacyQueues
  });
  
  // Combine errors to maintain the same API as before
  const error = fetchError || queueActionError || serviceActionError;

  return {
    queues,
    activeQueue,
    loading,
    loadingNext,
    error,
    fetchPharmacyQueues,
    callNextQueue,
    completeService,
    forwardService
  };
};
