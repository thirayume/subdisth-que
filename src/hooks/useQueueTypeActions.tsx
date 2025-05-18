
import { UseFormReturn } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';

interface UseQueueTypeActionsProps {
  form: UseFormReturn<any>;
  setEditingQueueType: (id: string | null) => void;
  setNewQueueType: (value: boolean) => void;
  newQueueType: boolean;
}

export const useQueueTypeActions = ({
  form,
  setEditingQueueType,
  setNewQueueType,
  newQueueType
}: UseQueueTypeActionsProps) => {
  const handleAddQueueType = () => {
    const queueTypes = form.getValues('queue_types') || [];
    
    // Create a new queue type with a random ID
    const newId = uuidv4();
    const newQueueType = {
      id: newId,
      code: '',
      name: '',
      prefix: '',
      purpose: '',
      format: '00',
      enabled: true,
      algorithm: QueueAlgorithmType.FIFO,
      priority: 5
    };
    
    // Update the form with the new queue type
    form.setValue('queue_types', [...queueTypes, newQueueType]);
    
    // Start editing the new queue type
    setEditingQueueType(newId);
    setNewQueueType(true);
  };

  const handleRemoveQueueType = (index: number) => {
    const queueTypes = [...form.getValues('queue_types')];
    queueTypes.splice(index, 1);
    form.setValue('queue_types', queueTypes);
    
    // Stop editing if we're removing the queue type we're editing
    if (editingQueueType === form.getValues(`queue_types.${index}.id`)) {
      setEditingQueueType(null);
    }
  };

  const handleEditQueueType = (id: string) => {
    setEditingQueueType(id);
    setNewQueueType(false);
  };

  const handleSaveQueueType = (index: number) => {
    // Validate the queue type before saving
    const queueType = form.getValues(`queue_types.${index}`);
    if (!queueType.code || !queueType.name || !queueType.prefix) {
      return;
    }
    
    setEditingQueueType(null);
    setNewQueueType(false);
  };

  const handleCancelEdit = (index: number) => {
    const queueTypes = [...form.getValues('queue_types')];
    
    if (newQueueType) {
      // If we're canceling a new queue type, remove it
      queueTypes.splice(index, 1);
      form.setValue('queue_types', queueTypes);
    }
    
    setEditingQueueType(null);
    setNewQueueType(false);
  };

  const handleDuplicateQueueType = (index: number) => {
    const queueTypes = [...form.getValues('queue_types')];
    const queueTypeToDuplicate = queueTypes[index];
    
    // Create a copy with a new ID
    const duplicatedQueueType = {
      ...queueTypeToDuplicate,
      id: uuidv4(),
      code: `${queueTypeToDuplicate.code}_COPY`,
      name: `${queueTypeToDuplicate.name} (Copy)`,
    };
    
    queueTypes.splice(index + 1, 0, duplicatedQueueType);
    form.setValue('queue_types', queueTypes);
  };

  const handleQueueTypeChange = (index: number, field: keyof any, value: any) => {
    form.setValue(`queue_types.${index}.${field}`, value);
  };

  const editingQueueType = form.watch('editingQueueType');

  return {
    handleAddQueueType,
    handleRemoveQueueType,
    handleEditQueueType,
    handleSaveQueueType,
    handleCancelEdit,
    handleDuplicateQueueType,
    handleQueueTypeChange
  };
};
