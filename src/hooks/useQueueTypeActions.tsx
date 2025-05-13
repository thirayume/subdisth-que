
import { useCallback } from 'react';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { QueueType } from '@/hooks/useQueueTypes';
import { v4 as uuidv4 } from 'uuid';
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';

export const useQueueTypeActions = () => {
  const { form, setEditingQueueType, setNewQueueType } = useSettingsContext();
  
  const queueTypes = form.watch('queue_types') as QueueType[];
  
  const handleAddQueueType = useCallback(() => {
    const newQueueType: QueueType = {
      id: uuidv4(),
      code: 'NEW',
      name: 'ประเภทคิวใหม่',
      prefix: 'N',
      purpose: '',
      format: '00',
      enabled: true,
      algorithm: QueueAlgorithmType.FIFO,
      priority: 5
    };
    
    form.setValue('queue_types', [...queueTypes, newQueueType]);
    setEditingQueueType(newQueueType.id);
    setNewQueueType(true);
  }, [queueTypes, form, setEditingQueueType, setNewQueueType]);

  const handleRemoveQueueType = useCallback((index: number) => {
    const newQueueTypes = [...queueTypes];
    newQueueTypes.splice(index, 1);
    form.setValue('queue_types', newQueueTypes);
  }, [queueTypes, form]);

  const handleEditQueueType = useCallback((id: string) => {
    setEditingQueueType(id);
    setNewQueueType(false);
  }, [setEditingQueueType, setNewQueueType]);

  const handleSaveQueueType = useCallback((index: number) => {
    setEditingQueueType(null);
    setNewQueueType(false);
  }, [setEditingQueueType, setNewQueueType]);

  const handleCancelEdit = useCallback((index: number) => {
    setEditingQueueType(null);
    setNewQueueType(false);
    
    // If this was a new queue type being added, remove it
    if (newQueueType) {
      const newQueueTypes = [...queueTypes];
      newQueueTypes.splice(index, 1);
      form.setValue('queue_types', newQueueTypes);
    }
  }, [queueTypes, form, newQueueType, setEditingQueueType, setNewQueueType]);

  const handleDuplicateQueueType = useCallback((index: number) => {
    const queueTypeToDuplicate = queueTypes[index];
    const duplicatedQueueType = {
      ...queueTypeToDuplicate,
      id: uuidv4(),
      code: `${queueTypeToDuplicate.code}_COPY`,
      name: `${queueTypeToDuplicate.name} (สำเนา)`
    };
    
    const newQueueTypes = [...queueTypes];
    newQueueTypes.splice(index + 1, 0, duplicatedQueueType);
    form.setValue('queue_types', newQueueTypes);
  }, [queueTypes, form]);

  const handleQueueTypeChange = useCallback((index: number, field: keyof QueueType, value: any) => {
    const newQueueTypes = [...queueTypes];
    newQueueTypes[index] = {
      ...newQueueTypes[index],
      [field]: value
    };
    form.setValue('queue_types', newQueueTypes);
  }, [queueTypes, form]);

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
