
import { UseFormReturn } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';
import { QueueType } from '@/hooks/useQueueTypes';
import { SettingsFormValues } from '@/contexts/SettingsContext';

interface UseQueueTypeActionsProps {
  form: UseFormReturn<SettingsFormValues>;
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
    const newQueueType: QueueType = {
      id: newId,
      code: '',
      name: '',
      prefix: '', // Required field
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
    const currentQueueType = queueTypes[index];
    queueTypes.splice(index, 1);
    form.setValue('queue_types', queueTypes);
    
    // Stop editing if we're removing the queue type we're editing
    if (currentQueueType) {
      // Get editingQueueType directly from form values
      const editingQueueTypeId = form.getValues().queue_types?.find(qt => 
        qt.id === currentQueueType.id
      )?.id;
      
      if (editingQueueTypeId) {
        setEditingQueueType(null);
      }
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
    
    // Create a copy with a new ID and ensure all required fields are present
    const duplicatedQueueType: QueueType = {
      id: uuidv4(),
      code: `${queueTypeToDuplicate.code}_COPY`,
      name: `${queueTypeToDuplicate.name} (Copy)`,
      prefix: queueTypeToDuplicate.prefix, // Ensure prefix is not undefined
      purpose: queueTypeToDuplicate.purpose || '',
      format: queueTypeToDuplicate.format || '00',
      enabled: queueTypeToDuplicate.enabled !== undefined ? queueTypeToDuplicate.enabled : true,
      algorithm: queueTypeToDuplicate.algorithm || QueueAlgorithmType.FIFO,
      priority: queueTypeToDuplicate.priority !== undefined ? queueTypeToDuplicate.priority : 5
    };
    
    queueTypes.splice(index + 1, 0, duplicatedQueueType);
    form.setValue('queue_types', queueTypes);
  };

  const handleQueueTypeChange = (index: number, field: keyof QueueType, value: any) => {
    // Fix: Use form.update method for complex nested arrays
    const queueTypes = [...form.getValues('queue_types')];
    if (queueTypes[index]) {
      queueTypes[index] = {
        ...queueTypes[index],
        [field]: value
      };
      form.setValue('queue_types', queueTypes);
    }
  };

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
