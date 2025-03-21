
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';

interface QueueAnnouncementSectionProps {
  form: UseFormReturn<any>;
}

const QueueAnnouncementSection: React.FC<QueueAnnouncementSectionProps> = ({ form }) => {
  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default QueueAnnouncementSection;
