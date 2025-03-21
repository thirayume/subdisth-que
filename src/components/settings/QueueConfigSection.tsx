
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';

interface QueueConfigSectionProps {
  form: UseFormReturn<any>;
}

const QueueConfigSection: React.FC<QueueConfigSectionProps> = ({ form }) => {
  return (
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
  );
};

export default QueueConfigSection;
