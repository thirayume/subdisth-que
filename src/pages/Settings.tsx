
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
} from '@/components/ui/form';
import {
  TabsContent,
} from '@/components/ui/tabs';
import Layout from '@/components/layout/Layout';
import { toast } from 'sonner';
import GeneralSettings from '@/components/settings/GeneralSettings';
import QueueSettings from '@/components/settings/QueueSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import LineSettings from '@/components/settings/LineSettings';
import SettingsTabs from '@/components/settings/SettingsTabs';
import SettingsFormActions from '@/components/settings/SettingsFormActions';
import { queueSettingsSchema, formatOptions, initialQueueTypes } from '@/components/settings/schemas';
import { useQueueTypes, QueueType } from '@/hooks/useQueueTypes';
import { z } from 'zod';

const Settings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof queueSettingsSchema>>({
    resolver: zodResolver(queueSettingsSchema),
    defaultValues: {
      hospital_name: 'โรงพยาบาลชุมชนตัวอย่าง',
      hospital_address: '123 ถ.สุขุมวิท ต.บางบัว อ.เมือง จ.สมุทรปราการ 10001',
      pharmacy_name: 'ห้องยา ร.พ.ชุมชนตัวอย่าง',
      pharmacy_phone: '02-123-4567',
      pharmacy_email: 'pharmacy@sample-hospital.go.th',
      queue_start_number: 1,
      queue_reset_daily: true,
      queue_announcement_text: 'เชิญหมายเลข {queueNumber} ที่ช่องจ่ายยา {counter}',
      queue_voice_enabled: true,
      line_notification_enabled: true,
      queue_types: initialQueueTypes,
    },
  });
  
  const queueTypes = form.watch('queue_types');
  
  const queueTypeActions = useQueueTypes({ 
    queueTypes, 
    setValue: form.setValue 
  });
  
  const onSubmit = async (data: z.infer<typeof queueSettingsSchema>) => {
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Settings data submitted:', data);
    toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว');
    
    setIsSubmitting(false);
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ตั้งค่าระบบ</h1>
          <p className="text-gray-500">จัดการการตั้งค่าระบบคิวและห้องยา</p>
        </div>
      </div>
      
      <SettingsTabs>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="general" className="space-y-6">
              <GeneralSettings form={form} />
            </TabsContent>
            
            <TabsContent value="queue" className="space-y-6">
              <QueueSettings 
                form={form}
                formatOptions={formatOptions}
                {...queueTypeActions}
              />
            </TabsContent>
            
            <TabsContent value="notification" className="space-y-6">
              <NotificationSettings form={form} />
            </TabsContent>
            
            <TabsContent value="line" className="space-y-6">
              <LineSettings />
            </TabsContent>
            
            <SettingsFormActions isSubmitting={isSubmitting} />
          </form>
        </Form>
      </SettingsTabs>
    </Layout>
  );
};

export default Settings;
