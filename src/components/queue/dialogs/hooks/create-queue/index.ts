
import { useCreateQueueHook } from './useCreateQueueHook';
import { usePatientInfoHook } from './usePatientInfoHook';
import { useQueueActions } from './useQueueActions';

export const useCreateQueue = (
  onOpenChange: (open: boolean) => void,
  onCreateQueue: (queue: any) => void
) => useCreateQueueHook(onOpenChange, onCreateQueue);

export {
  usePatientInfoHook,
  useQueueActions
};

export * from './types';
