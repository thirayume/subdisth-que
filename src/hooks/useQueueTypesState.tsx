
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { QueueType } from './useQueueTypes';

interface UseQueueTypesStateProps {
  form: UseFormReturn<any>;
}

export const useQueueTypesState = () => {
  const [editingQueueType, setEditingQueueType] = useState<string | null>(null);
  const [newQueueType, setNewQueueType] = useState(false);

  return {
    editingQueueType,
    setEditingQueueType,
    newQueueType,
    setNewQueueType
  };
};
