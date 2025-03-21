import { useState } from 'react';
import { toast } from 'sonner';
import { queueSettingsSchema } from '@/components/settings/schemas';

export type QueueType = {
  id: string;
  code: string;
  name: string;
  prefix: string;
  purpose: string;
  format: '0' | '00' | '000';
  enabled: boolean;
};

export type UseQueueTypesProps = {
  queueTypes: QueueType[];
  setValue: (name: string, value: any) => void;
};

export const useQueueTypes = ({ queueTypes, setValue }: UseQueueTypesProps) => {
  const [editingQueueType, setEditingQueueType] = useState<string | null>(null);
  const [newQueueType, setNewQueueType] = useState(false);

  const handleAddQueueType = () => {
    setNewQueueType(true);
    const newId = `CUSTOM_${Date.now()}`;
    const newQueueTypeItem: QueueType = {
      id: newId,
      code: '',
      name: '',
      prefix: '',
      purpose: '',
      format: '0' as const,
      enabled: true,
    };
    
    setValue('queue_types', [...queueTypes, newQueueTypeItem]);
    setEditingQueueType(newId);
  };
  
  const handleRemoveQueueType = (index: number) => {
    const updatedQueueTypes = [...queueTypes];
    updatedQueueTypes.splice(index, 1);
    setValue('queue_types', updatedQueueTypes);
    toast.success('ลบประเภทคิวเรียบร้อยแล้ว');
  };
  
  const handleEditQueueType = (id: string) => {
    setEditingQueueType(id);
  };
  
  const handleSaveQueueType = (index: number) => {
    const queueType = queueTypes[index];
    const result = queueSettingsSchema.shape.queue_types.element.safeParse(queueType);
    
    if (!result.success) {
      const errors = result.error.errors;
      errors.forEach(error => {
        toast.error(`ข้อผิดพลาด: ${error.message}`);
      });
      return;
    }
    
    setEditingQueueType(null);
    setNewQueueType(false);
    toast.success('บันทึกประเภทคิวเรียบร้อยแล้ว');
  };
  
  const handleCancelEdit = (index: number) => {
    if (newQueueType) {
      const updatedQueueTypes = [...queueTypes];
      updatedQueueTypes.splice(index, 1);
      setValue('queue_types', updatedQueueTypes);
      setNewQueueType(false);
    }
    setEditingQueueType(null);
  };
  
  const handleDuplicateQueueType = (index: number) => {
    const queueTypeToDuplicate = { ...queueTypes[index] };
    queueTypeToDuplicate.id = `CUSTOM_${Date.now()}`;
    queueTypeToDuplicate.name = `${queueTypeToDuplicate.name} (สำเนา)`;
    
    const updatedQueueTypes = [...queueTypes, queueTypeToDuplicate];
    setValue('queue_types', updatedQueueTypes);
    toast.success('คัดลอกประเภทคิวเรียบร้อยแล้ว');
  };
  
  const handleQueueTypeChange = (index: number, field: keyof QueueType, value: any) => {
    const updatedQueueTypes = [...queueTypes];
    updatedQueueTypes[index] = {
      ...updatedQueueTypes[index],
      [field]: value,
    };
    setValue('queue_types', updatedQueueTypes);
  };

  return {
    editingQueueType,
    setEditingQueueType,
    newQueueType,
    setNewQueueType,
    handleAddQueueType,
    handleRemoveQueueType,
    handleEditQueueType,
    handleSaveQueueType,
    handleCancelEdit,
    handleDuplicateQueueType,
    handleQueueTypeChange
  };
};
