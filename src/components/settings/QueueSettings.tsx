import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Plus } from 'lucide-react';
import QueueTypeItem from './QueueTypeItem';
import { FormatOption } from './schemas';

interface QueueType {
  id: string;
  code: string;
  name: string;
  prefix: string;
  purpose: string;
  format: '0' | '00' | '000';
  enabled: boolean;
}

interface QueueSettingsProps {
  form: UseFormReturn<any>;
  editingQueueType: string | null;
  setEditingQueueType: React.Dispatch<React.SetStateAction<string | null>>;
  newQueueType: boolean;
  setNewQueueType: React.Dispatch<React.SetStateAction<boolean>>;
  formatOptions: FormatOption[];
  handleAddQueueType: () => void;
  handleRemoveQueueType: (index: number) => void;
  handleEditQueueType: (id: string) => void;
  handleSaveQueueType: (index: number) => void;
  handleCancelEdit: (index: number) => void;
  handleDuplicateQueueType: (index: number) => void;
  handleQueueTypeChange: (index: number, field: keyof QueueType, value: any) => void;
}

const QueueSettings: React.FC<QueueSettingsProps> = ({
  form,
  editingQueueType,
  setEditingQueueType,
  newQueueType,
  setNewQueueType,
  formatOptions,
  handleAddQueueType,
  handleRemoveQueueType,
  handleEditQueueType,
  handleSaveQueueType,
  handleCancelEdit,
  handleDuplicateQueueType,
  handleQueueTypeChange,
}) => {
  const queueTypes = form.watch('queue_types');

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>การตั้งค่าคิว</CardTitle>
          <CardDescription>
            กำหนดค่าการทำงานของระบบคิว
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="queue_start_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>เริ่มนับคิวจากหมายเลข</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormDescription>
                    กำหนดหมายเลขเริ่มต้นของคิวในแต่ละวัน
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="queue_reset_daily"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">รีเซ็ตคิวรายวัน</FormLabel>
                    <FormDescription>
                      ระบบจะรีเซ็ตหมายเลขคิวใหม่ทุกวัน
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <div className="pt-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-medium">ประเภทคิวที่เปิดใช้งาน</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddQueueType}
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
                  onEdit={handleEditQueueType}
                  onSave={handleSaveQueueType}
                  onCancel={handleCancelEdit}
                  onRemove={handleRemoveQueueType}
                  onDuplicate={handleDuplicateQueueType}
                  onChange={handleQueueTypeChange}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>การประกาศเรียกคิว</CardTitle>
          <CardDescription>
            ตั้งค่าการแสดงผลและเสียงประกาศเรียกคิว
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="queue_announcement_text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ข้อความประกาศเรียกคิว</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormDescription>
                  ใช้ {'{queueNumber}'} สำหรับหมายเลขคิว และ {'{counter}'} สำหรับช่องบริการ
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="queue_voice_enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">เปิดใช้งานเสียงเรียกคิว</FormLabel>
                  <FormDescription>
                    ระบบจะประกาศเสียงเมื่อมีการเรียกคิว
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default QueueSettings;
