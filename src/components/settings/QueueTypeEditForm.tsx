
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X } from 'lucide-react';
import { FormatOption } from './schemas';
import QueueTypeFormats from './QueueTypeFormats';
import { QueueType } from '@/hooks/useQueueTypes';

interface QueueTypeEditFormProps {
  queueType: QueueType;
  index: number;
  formatOptions: FormatOption[];
  onSave: (index: number) => void;
  onCancel: (index: number) => void;
  onChange: (index: number, field: keyof QueueType, value: any) => void;
}

const QueueTypeEditForm = ({ 
  queueType, 
  index, 
  formatOptions, 
  onSave, 
  onCancel, 
  onChange 
}: QueueTypeEditFormProps) => {
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
        <QueueTypeFormats 
          index={index}
          format={queueType.format}
          formatOptions={formatOptions}
          onChange={(value) => onChange(index, 'format', value)}
        />
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
};

export default QueueTypeEditForm;
