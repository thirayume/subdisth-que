
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { queueSettingsSchema, initialQueueTypes } from '@/components/settings/schemas';
import { useSettings } from './useSettings';
import { z } from 'zod';
import { useQueueTypesData } from './useQueueTypesData';
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';

type SettingsState = Array<{
  key: string;
  value: any;
}>;

const defaultValues = {
  hospital_name: 'โรงพยาบาลตัวอย่าง',
  hospital_address: '123 ถนนกรุงเทพ เขตปทุมวัน กรุงเทพฯ 10330',
  hospital_phone: '02-123-4567',
  hospital_website: 'https://example-hospital.com',
  pharmacy_name: 'ห้องยาโรงพยาบาลตัวอย่าง',
  pharmacy_phone: '02-123-4568',
  pharmacy_email: 'pharmacy@example-hospital.com',
  queue_types: initialQueueTypes,
  queue_reset_daily: true,
  queue_start_number: 1,
  queue_algorithm: QueueAlgorithmType.FIFO,
  enable_wait_time_prediction: true,
  queue_announcement_enabled: true,
  queue_announcement_text: 'ขอเชิญหมายเลข {queueNumber} ที่ช่องบริการ {counter}',
  queue_voice_enabled: true,
  queue_voice_speed: 0.8,
  queue_voice_pitch: 1,
  line_notification_enabled: true,
  sms_notification_enabled: false,
  appointment_notifications_enabled: true,
  voice_notifications_enabled: true,
  notify_day_before: true,
  notify_hours_before: true,
  notify_hour_before: false,
  notify_queue_position: true,
  notify_queue_waiting_time: true,
};

export const useSettingsForm = () => {
  const [loading, setLoading] = useState(true);
  const { settings, updateSettings } = useSettings();
  const { queueTypes, loading: loadingQueueTypes } = useQueueTypesData();
  // Add a state to track if queue types are initialized
  const [queueTypesInitialized, setQueueTypesInitialized] = useState(false);

  // Create form with default values
  const form = useForm<z.infer<typeof queueSettingsSchema>>({
    resolver: zodResolver(queueSettingsSchema),
    defaultValues,
  });

  // Update form values when settings load
  useEffect(() => {
    if (settings) {
      let mergedValues = { ...defaultValues };
      
      // Process each setting based on its key
      for (const setting of settings as SettingsState) {
        try {
          if (setting.key === 'queue_algorithm') {
            // Handle queue algorithm setting
            const algorithm = setting.value as unknown as string;
            if (algorithm && Object.values(QueueAlgorithmType).includes(algorithm as QueueAlgorithmType)) {
              mergedValues.queue_algorithm = algorithm as QueueAlgorithmType;
            }
          } else if (setting.key === 'queue_types') {
            // Handle queue types if they're in settings
            // This is just for backward compatibility
          } else if (setting.key in defaultValues) {
            // Handle other recognized settings
            mergedValues = {
              ...mergedValues,
              [setting.key]: setting.value,
            };
          }
        } catch (error) {
          console.error(`Error processing setting ${setting.key}:`, error);
        }
      }
      
      // Reset form with merged values
      form.reset(mergedValues);
      setLoading(false);
    }
  }, [settings, form]);
  
  // Handle queue types from the database
  useEffect(() => {
    if (!loadingQueueTypes && queueTypes && queueTypes.length > 0) {
      form.setValue('queue_types', queueTypes);
      setQueueTypesInitialized(true);
    }
  }, [loadingQueueTypes, queueTypes, form]);

  // Function to update multiple settings at once
  const updateMultipleSettings = async (data: any) => {
    try {
      const updates = [];
      for (const [key, value] of Object.entries(data)) {
        if (key === 'queue_types') continue; // Skip queue types as they are handled separately
        
        updates.push({
          category: 'general',
          key,
          value,
        });
      }
      
      if (updates.length > 0) {
        await updateSettings(updates);
      }
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  };

  return {
    form,
    settings: {
      form,
    },
    loading,
    loadingQueueTypes,
    updateMultipleSettings,
    initialized: queueTypesInitialized, // Add this to track initialization
  };
};
