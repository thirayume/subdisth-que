
import * as React from 'react';
import { usePharmacyQueueFetch } from './usePharmacyQueueFetch';
import { usePharmacyQueueActions } from './usePharmacyQueueActions';
import { usePharmacyServiceActions } from './usePharmacyServiceActions';
import { PharmacyQueue, PharmacyService } from './types';

// Re-export the types for backward compatibility
export type { PharmacyQueue, PharmacyService };

export const usePharmacyQueue = () => {
  // Get queue state and fetch functionality - Make sure all custom hooks are called at the top level
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
  
  // Combine errors - Do this after all hook calls
  const error = React.useMemo(() => 
    fetchError || queueActionError || serviceActionError, 
    [fetchError, queueActionError, serviceActionError]
  );

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
