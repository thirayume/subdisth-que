
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X } from 'lucide-react';
import { FormatOption, AlgorithmOption, algorithmOptions } from './schemas';
import QueueTypeFormats from './QueueTypeFormats';
import { QueueType } from '@/hooks/useQueueTypes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

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
      
      <div>
        <Label htmlFor={`queueType_${index}_algorithm`}>อัลกอริทึมการเรียกคิว</Label>
        <Select
          value={queueType.algorithm || 'FIFO'}
          onValueChange={(value) => onChange(index, 'algorithm', value)}
        >
          <SelectTrigger id={`queueType_${index}_algorithm`} className="w-full">
            <SelectValue placeholder="เลือกอัลกอริทึม" />
          </SelectTrigger>
          <SelectContent>
            {algorithmOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                <div>
                  <div>{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <div className="flex justify-between">
          <Label htmlFor={`queueType_${index}_priority`}>ความสำคัญ ({queueType.priority || 5}/10)</Label>
        </div>
        <Slider
          id={`queueType_${index}_priority`}
          min={1}
          max={10}
          step={1}
          value={[queueType.priority || 5]}
          onValueChange={([value]) => onChange(index, 'priority', value)}
          className="py-4"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>ต่ำ</span>
          <span>ปานกลาง</span>
          <span>สูง</span>
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
};

export default QueueTypeEditForm;
