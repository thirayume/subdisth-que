
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import QueueTypeItem from './QueueTypeItem';
import { FormatOption } from './schemas';
import { QueueType } from '@/hooks/useQueueTypes';

interface QueueTypesListProps {
  queueTypes: QueueType[];
  editingQueueType: string | null;
  formatOptions: FormatOption[];
  onAddQueueType: () => void;
  onRemoveQueueType: (index: number) => void;
  onEditQueueType: (id: string) => void;
  onSaveQueueType: (index: number) => void;
  onCancelEdit: (index: number) => void;
  onDuplicateQueueType: (index: number) => void;
  onQueueTypeChange: (index: number, field: keyof QueueType, value: any) => void;
}

const QueueTypesList: React.FC<QueueTypesListProps> = ({
  queueTypes,
  editingQueueType,
  formatOptions,
  onAddQueueType,
  onRemoveQueueType,
  onEditQueueType,
  onSaveQueueType,
  onCancelEdit,
  onDuplicateQueueType,
  onQueueTypeChange,
}) => {
  return (
    <div className="pt-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium">ประเภทคิวที่เปิดใช้งาน</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAddQueueType}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          เพิ่มประเภทคิว
        </Button>
      </div>
      
      {queueTypes.map((queueType: QueueType, index: number) => (
        <div key={queueType.id} className="mb-4 rounded-lg border p-4">
          <QueueTypeItem
            queueType={queueType}
            index={index}
            isEditing={editingQueueType === queueType.id}
            formatOptions={formatOptions}
            onEdit={onEditQueueType}
            onSave={onSaveQueueType}
            onCancel={onCancelEdit}
            onRemove={onRemoveQueueType}
            onDuplicate={onDuplicateQueueType}
            onChange={onQueueTypeChange}
          />
        </div>
      ))}
    </div>
  );
};

export default QueueTypesList;
