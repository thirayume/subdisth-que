
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2, CopyPlus } from 'lucide-react';
import { FormatOption } from './schemas';
import { QueueType } from '@/hooks/useQueueTypes';

interface QueueTypeDisplayProps {
  queueType: QueueType;
  index: number;
  formatOptions: FormatOption[];
  onEdit: (id: string) => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
  onChange: (index: number, field: keyof QueueType, value: any) => void;
}

const QueueTypeDisplay = ({
  queueType,
  index,
  formatOptions,
  onEdit,
  onRemove,
  onDuplicate,
  onChange,
}: QueueTypeDisplayProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <h4 className="font-medium text-lg">{queueType.name}</h4>
          <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {queueType.code}
          </div>
          <Switch
            checked={queueType.enabled}
            onCheckedChange={(checked) => onChange(index, 'enabled', checked)}
          />
        </div>
        <div className="text-sm text-gray-500">
          จุดประสงค์: {queueType.purpose}
        </div>
        <div className="text-sm flex space-x-3">
          <span className="text-gray-500">
            <strong>Prefix:</strong> {queueType.prefix}
          </span>
          <span className="text-gray-500">
            <strong>รูปแบบ:</strong> {
              formatOptions.find(opt => opt.value === queueType.format)?.label.split(' ')[0] || 
              queueType.format
            }
          </span>
          <span className="text-gray-500">
            <strong>ตัวอย่าง:</strong> {
              queueType.prefix + 
              (queueType.format === '0' ? '1' : 
                queueType.format === '00' ? '01' : '001')
            }
          </span>
        </div>
      </div>
      <div className="flex space-x-1 mt-3 md:mt-0">
        <Button 
          variant="outline" 
          size="icon"
          className="h-8 w-8"
          onClick={() => onDuplicate(index)}
        >
          <CopyPlus className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => onEdit(queueType.id)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default QueueTypeDisplay;
