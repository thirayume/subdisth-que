
import React, { useState, useEffect } from 'react';
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
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';

const Settings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Define the form with explicit typing for the form values
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
      sms_notification_enabled: false,
      appointment_notifications_enabled: true,
      voice_notifications_enabled: true,
      notify_day_before: true,
      notify_hours_before: true,
      notify_hour_before: false,
      notify_queue_position: true,
      notify_queue_waiting_time: true,
      queue_algorithm: QueueAlgorithmType.MULTILEVEL_FEEDBACK,
      queue_types: initialQueueTypes,
    },
  });
  
  // Watch the queue_types field with explicit QueueType[] typing
  const queueTypes = form.watch('queue_types') as QueueType[];
  
  const queueTypeActions = useQueueTypes({ 
    queueTypes, 
    setValue: form.setValue 
  });

  // Load saved LINE settings on mount
  useEffect(() => {
    const savedLineSettings = localStorage.getItem('lineSettings');
    if (!savedLineSettings) {
      // Initialize default LINE settings if not present
      const defaultLineSettings = {
        channelId: "1234567890",
        channelSecret: "abcdefghijklmnopqrstuvwxyz",
        accessToken: "12345678901234567890123456789012345678901234567890",
        welcomeMessage: "ยินดีต้อนรับสู่ระบบคิวห้องยา โรงพยาบาลชุมชนตัวอย่าง",
        queueReceivedMessage: "คุณได้รับคิวหมายเลข {queueNumber} ประเภท: {queueType}\nระยะเวลารอโดยประมาณ: {estimatedWaitTime} นาที",
        queueCalledMessage: "เรียนคุณ {patientName}\nถึงคิวของคุณแล้ว! กรุณามาที่ช่องบริการ {counter}\nหมายเลขคิวของคุณคือ: {queueNumber}"
      };
      localStorage.setItem('lineSettings', JSON.stringify(defaultLineSettings));
    }
  }, []);
  
  const onSubmit = async (data: z.infer<typeof queueSettingsSchema>) => {
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Settings data submitted:', data);
    
    // Save queue algorithm to localStorage for use in other components
    localStorage.setItem('queue_algorithm', data.queue_algorithm);
    
    // Save queue types with algorithms to localStorage
    localStorage.setItem('queue_types', JSON.stringify(data.queue_types));
    
    // Save notification settings
    localStorage.setItem('notification_settings', JSON.stringify({
      line_notification_enabled: data.line_notification_enabled,
      sms_notification_enabled: data.sms_notification_enabled,
      appointment_notifications_enabled: data.appointment_notifications_enabled,
      voice_notifications_enabled: data.voice_notifications_enabled,
      notify_day_before: data.notify_day_before,
      notify_hours_before: data.notify_hours_before,
      notify_hour_before: data.notify_hour_before,
      notify_queue_position: data.notify_queue_position,
      notify_queue_waiting_time: data.notify_queue_waiting_time,
    }));
    
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
