
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
import LoggingSettingsSection from '@/components/settings/LoggingSettingsSection';
import { queueSettingsSchema, formatOptions, initialQueueTypes } from '@/components/settings/schemas';
import { useQueueTypes, QueueType } from '@/hooks/useQueueTypes';
import { z } from 'zod';
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';
import { useSettings } from '@/hooks/useSettings';
import { useQueueTypesData } from '@/hooks/useQueueTypesData';

const Settings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { settings, loading, updateMultipleSettings } = useSettings('general_settings');
  const { queueTypes: dbQueueTypes, loading: loadingQueueTypes } = useQueueTypesData();
  
  // For queue types management
  const [editingQueueType, setEditingQueueType] = useState<string | null>(null);
  const [newQueueType, setNewQueueType] = useState(false);
  
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
  
  // Load settings from Supabase on component mount
  useEffect(() => {
    if (!loading && settings) {
      // Update form with saved settings
      if (settings.general) {
        form.setValue('hospital_name', settings.general.hospital_name || 'โรงพยาบาลชุมชนตัวอย่าง');
        form.setValue('hospital_address', settings.general.hospital_address || '123 ถ.สุขุมวิท ต.บางบัว อ.เมือง จ.สมุทรปราการ 10001');
        form.setValue('pharmacy_name', settings.general.pharmacy_name || 'ห้องยา ร.พ.ชุมชนตัวอย่าง');
        form.setValue('pharmacy_phone', settings.general.pharmacy_phone || '02-123-4567');
        form.setValue('pharmacy_email', settings.general.pharmacy_email || 'pharmacy@sample-hospital.go.th');
      }
      
      if (settings.queue) {
        form.setValue('queue_start_number', settings.queue.queue_start_number || 1);
        form.setValue('queue_reset_daily', settings.queue.queue_reset_daily !== false);
        form.setValue('queue_announcement_text', settings.queue.queue_announcement_text || 'เชิญหมายเลข {queueNumber} ที่ช่องจ่ายยา {counter}');
        form.setValue('queue_voice_enabled', settings.queue.queue_voice_enabled !== false);
        form.setValue('queue_algorithm', settings.queue.queue_algorithm || QueueAlgorithmType.MULTILEVEL_FEEDBACK);
        form.setValue('enable_wait_time_prediction', settings.queue.enable_wait_time_prediction !== false);
      }
      
      if (settings.notification) {
        form.setValue('line_notification_enabled', settings.notification.line_notification_enabled !== false);
        form.setValue('sms_notification_enabled', settings.notification.sms_notification_enabled === true);
        form.setValue('appointment_notifications_enabled', settings.notification.appointment_notifications_enabled !== false);
        form.setValue('voice_notifications_enabled', settings.notification.voice_notifications_enabled !== false);
        form.setValue('notify_day_before', settings.notification.notify_day_before !== false);
        form.setValue('notify_hours_before', settings.notification.notify_hours_before !== false);
        form.setValue('notify_hour_before', settings.notification.notify_hour_before === true);
        form.setValue('notify_queue_position', settings.notification.notify_queue_position !== false);
        form.setValue('notify_queue_waiting_time', settings.notification.notify_queue_waiting_time !== false);
      }
    }
  }, [loading, settings, form]);

  // Load queue types from database
  useEffect(() => {
    if (!loadingQueueTypes && dbQueueTypes.length > 0) {
      form.setValue('queue_types', dbQueueTypes);
    }
  }, [loadingQueueTypes, dbQueueTypes, form]);
  
  // Watch the queue_types field with explicit QueueType[] typing
  const queueTypes = form.watch('queue_types') as QueueType[];
  
  const queueTypeActions = useQueueTypes({ 
    queueTypes, 
    setValue: form.setValue 
  });
  
  const onSubmit = async (data: z.infer<typeof queueSettingsSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Save general settings to Supabase
      await updateMultipleSettings({
        general: {
          hospital_name: data.hospital_name,
          hospital_address: data.hospital_address,
          pharmacy_name: data.pharmacy_name,
          pharmacy_phone: data.pharmacy_phone,
          pharmacy_email: data.pharmacy_email,
        },
        queue: {
          queue_start_number: data.queue_start_number,
          queue_reset_daily: data.queue_reset_daily,
          queue_announcement_text: data.queue_announcement_text,
          queue_voice_enabled: data.queue_voice_enabled,
          queue_algorithm: data.queue_algorithm,
          enable_wait_time_prediction: data.enable_wait_time_prediction
        },
        notification: {
          line_notification_enabled: data.line_notification_enabled,
          sms_notification_enabled: data.sms_notification_enabled,
          appointment_notifications_enabled: data.appointment_notifications_enabled,
          voice_notifications_enabled: data.voice_notifications_enabled,
          notify_day_before: data.notify_day_before,
          notify_hours_before: data.notify_hours_before,
          notify_hour_before: data.notify_hour_before,
          notify_queue_position: data.notify_queue_position,
          notify_queue_waiting_time: data.notify_queue_waiting_time,
        }
      });
      
      // Note: Queue types are saved individually through the QueueTypesList component
      
      console.log('Settings data submitted:', data);
      
      // Save queue algorithm to localStorage for use in other components
      localStorage.setItem('queue_algorithm', data.queue_algorithm);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || loadingQueueTypes) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin w-10 h-10 border-4 border-gray-300 border-t-pharmacy-600 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูลการตั้งค่า...</p>
          </div>
        </div>
      </Layout>
    );
  }

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
                editingQueueType={editingQueueType}
                setEditingQueueType={setEditingQueueType}
                newQueueType={newQueueType}
                setNewQueueType={setNewQueueType}
                {...queueTypeActions}
              />
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <NotificationSettings form={form} />
            </TabsContent>
            
            <TabsContent value="line" className="space-y-6">
              <LineSettings />
            </TabsContent>
            
            <TabsContent value="developer" className="space-y-6">
              <LoggingSettingsSection />
            </TabsContent>
            
            <SettingsFormActions isSubmitting={isSubmitting} />
          </form>
        </Form>
      </SettingsTabs>
    </Layout>
  );
};

export default Settings;
