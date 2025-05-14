
import { useCreateQueueHook } from './useCreateQueueHook';

export const useCreateQueue = (
  onOpenChange: (open: boolean) => void,
  onCreateQueue: (queue: any) => void
) => useCreateQueueHook(onOpenChange, onCreateQueue);
