
import React from 'react';
import { FormatOption } from './schemas';
import { QueueType } from '@/hooks/useQueueTypes';
import QueueTypeEditForm from './QueueTypeEditForm';
import QueueTypeDisplay from './QueueTypeDisplay';

interface QueueTypeItemProps {
  queueType: QueueType;
  index: number;
  isEditing: boolean;
  formatOptions: FormatOption[];
  onEdit: (id: string) => void;
  onSave: (index: number) => void;
  onCancel: (index: number) => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
  onChange: (index: number, field: keyof QueueType, value: any) => void;
}

const QueueTypeItem: React.FC<QueueTypeItemProps> = ({
  queueType,
  index,
  isEditing,
  formatOptions,
  onEdit,
  onSave,
  onCancel,
  onRemove,
  onDuplicate,
  onChange,
}) => {
  if (isEditing) {
    return (
      <QueueTypeEditForm
        queueType={queueType}
        index={index}
        formatOptions={formatOptions}
        onSave={onSave}
        onCancel={onCancel}
        onChange={onChange}
      />
    );
  }
  
  return (
    <QueueTypeDisplay
      queueType={queueType}
      index={index}
      formatOptions={formatOptions}
      onEdit={onEdit}
      onRemove={onRemove}
      onDuplicate={onDuplicate}
      onChange={onChange}
    />
  );
};

export default QueueTypeItem;
