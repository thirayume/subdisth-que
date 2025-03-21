import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2, Check, X, CopyPlus } from 'lucide-react';
import { FormatOption } from './schemas';
import { QueueType } from '@/hooks/useQueueTypes';

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
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`queueType_${index}_code`}>รหัสประเภทคิว</Label>
            <Input
              id={`queueType_${index}_code`}
              value={queueType.code}
              onChange={(e) => onChange(index, 'code', e.target.value)}
              placeholder="เช่น GENERAL, PRIORITY"
            />
          </div>
          <div>
            <Label htmlFor={`queueType_${index}_name`}>ชื่อประเภทคิว</Label>
            <Input
              id={`queueType_${index}_name`}
              value={queueType.name}
              onChange={(e) => onChange(index, 'name', e.target.value)}
              placeholder="เช่น ทั่วไป, ด่วน"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`queueType_${index}_prefix`}>Prefix</Label>
            <Input
              id={`queueType_${index}_prefix`}
              value={queueType.prefix}
              onChange={(e) => onChange(index, 'prefix', e.target.value)}
              placeholder="เช่น A, B, C"
            />
          </div>
          <div>
            <Label htmlFor={`queueType_${index}_purpose`}>จุดประสงค์</Label>
            <Input
              id={`queueType_${index}_purpose`}
              value={queueType.purpose}
              onChange={(e) => onChange(index, 'purpose', e.target.value)}
              placeholder="เช่น รับยาทั่วไป, กรณีเร่งด่วน"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor={`queueType_${index}_format`}>รูปแบบหมายเลขคิว</Label>
          <div className="space-y-2">
            {formatOptions.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`queueType_${index}_format_${option.value}`}
                  name={`queueType_${index}_format`}
                  className="mr-2"
                  checked={queueType.format === option.value}
                  onChange={() => onChange(index, 'format', option.value)}
                />
                <label htmlFor={`queueType_${index}_format_${option.value}`} className="text-sm">
                  {option.label}
                  <div className="text-xs text-gray-500">ตัวอย่าง: {option.example}</div>
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCancel(index)}
          >
            <X className="h-4 w-4 mr-1" />
            ยกเลิก
          </Button>
          <Button
            size="sm"
            className="bg-pharmacy-600 hover:bg-pharmacy-700"
            onClick={() => onSave(index)}
          >
            <Check className="h-4 w-4 mr-1" />
            บันทึก
          </Button>
        </div>
      </div>
    );
  }
  
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

export default QueueTypeItem;
