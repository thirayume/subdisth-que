
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { queueSettingsSchema } from '@/components/settings/schemas';
import { useSettings } from '@/hooks/useSettings';
import { useQueueTypesData } from '@/hooks/useQueueTypesData';
import { QueueType } from '@/hooks/useQueueTypes';
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';

interface SettingsContextType {
  form: UseFormReturn<z.infer<typeof queueSettingsSchema>>;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  settings: any;
  loading: boolean;
  loadingQueueTypes: boolean;
  editingQueueType: string | null;
  setEditingQueueType: (id: string | null) => void;
  newQueueType: boolean;
  setNewQueueType: (value: boolean) => void;
  onSubmit: (data: z.infer<typeof queueSettingsSchema>) => Promise<void>;
  updateMultipleSettings: (data: any) => Promise<boolean>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { settings, loading, updateMultipleSettings } = useSettings('general_settings');
  const { queueTypes: dbQueueTypes, loading: loadingQueueTypes } = useQueueTypesData();
  
  // For queue types management
  const [editingQueueType, setEditingQueueType] = useState<string | null>(null);
  const [newQueueType, setNewQueueType] = useState(false);

  // Define the form with explicit typing
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
      queue_types: [],
      enable_wait_time_prediction: true,
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
      
      // Save queue algorithm to localStorage for use in other components
      localStorage.setItem('queue_algorithm', data.queue_algorithm);
      
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const value = {
    form,
    isSubmitting,
    setIsSubmitting,
    settings,
    loading,
    loadingQueueTypes,
    editingQueueType,
    setEditingQueueType,
    newQueueType,
    setNewQueueType,
    onSubmit,
    updateMultipleSettings
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};
