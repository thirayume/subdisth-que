
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Queue, ServicePoint, Patient } from '@/integrations/supabase/schema';
import { createLogger } from '@/utils/logger';
import { toast } from 'sonner';

const logger = createLogger('useSmsNotifications');

export const useSmsNotifications = () => {
  // Check if SMS is enabled in settings
  const checkSmsEnabled = useCallback(async (): Promise<boolean> => {
    try {
      const { data: settings, error } = await supabase
        .from('settings')
        .select('value')
        .eq('category', 'sms')
        .eq('key', 'enabled')
        .single();

      if (error || !settings) {
        logger.warn('SMS enabled setting not found, defaulting to disabled');
        return false;
      }

      return settings.value === 'true' || settings.value === true;
    } catch (error) {
      logger.error('Error checking SMS enabled status:', error);
      return false;
    }
  }, []);

  // Get message template from settings
  const getMessageTemplate = useCallback(async (): Promise<string | null> => {
    try {
      const { data: settings, error } = await supabase
        .from('settings')
        .select('value')
        .eq('category', 'sms')
        .eq('key', 'message_template')
        .single();

      if (error || !settings) {
        return null;
      }

      // Properly handle Json type conversion to string
      const value = settings.value;
      if (typeof value === 'string') {
        // If it's already a string, check if it's a JSON string that needs parsing
        if (value.startsWith('"') && value.endsWith('"')) {
          return JSON.parse(value);
        }
        return value;
      } else if (value) {
        // If it's not a string but has a value, convert to string
        return String(value);
      }
      
      return null;
    } catch (error) {
      logger.error('Error getting message template:', error);
      return null;
    }
  }, []);

  // Get next 3 waiting queues for each service point
  const getNextQueuesPerServicePoint = useCallback(async (): Promise<{ servicePoint: ServicePoint; queues: Queue[]; patients: Patient[] }[]> => {
    try {
      // Get all service points
      const { data: servicePoints, error: spError } = await supabase
        .from('service_points')
        .select('*')
        .eq('enabled', true);

      if (spError) throw spError;

      if (!servicePoints || servicePoints.length === 0) {
        return [];
      }

      const results = [];

      for (const servicePoint of servicePoints) {
        // Get waiting queues for this service point (today only)
        const today = new Date().toISOString().split('T')[0];
        
        const { data: queues, error: queueError } = await supabase
          .from('queues')
          .select(`
            *,
            patients (*)
          `)
          .eq('status', 'WAITING')
          .eq('queue_date', today)
          .or(`service_point_id.eq.${servicePoint.id},service_point_id.is.null`)
          .is('paused_at', null)
          .order('created_at', { ascending: true })
          .limit(3);

        if (queueError) {
          logger.error(`Error fetching queues for service point ${servicePoint.name}:`, queueError);
          continue;
        }

        if (queues && queues.length > 0) {
          // Extract patients from the queues
          const patients = queues.map(q => q.patients).filter(Boolean) as Patient[];
          
          results.push({
            servicePoint,
            queues: queues as Queue[],
            patients
          });
        }
      }

      return results;
    } catch (error) {
      logger.error('Error getting next queues per service point:', error);
      return [];
    }
  }, []);

  // Send SMS to a single patient
  const sendSmsToPatient = useCallback(async (
    patient: Patient, 
    queue: Queue, 
    servicePoint: ServicePoint
  ): Promise<boolean> => {
    try {
      if (!patient.phone) {
        logger.warn(`No phone number for patient ${patient.name} (Queue ${queue.number})`);
        return false;
      }

      // Get message template from settings
      const messageTemplate = await getMessageTemplate();
      const message = messageTemplate
        ? messageTemplate
            .replace('{queueNumber}', queue.number.toString())
            .replace('{servicePoint}', servicePoint.name)
        : `ท่านกำลังจะได้รับบริการในคิวถัดไป คิวหมายเลข ${queue.number} ที่ ${servicePoint.name}`;

      const { data, error } = await supabase.functions.invoke('send-sms-notification', {
        body: {
          phoneNumber: patient.phone,
          message,
          queueNumber: queue.number.toString(),
          patientName: patient.name
        }
      });

      if (error) {
        logger.error(`SMS error for queue ${queue.number}:`, error);
        return false;
      }

      logger.info(`SMS sent successfully to queue ${queue.number} (${patient.name})`);
      return true;
    } catch (error) {
      logger.error(`Error sending SMS to patient ${patient.name}:`, error);
      return false;
    }
  }, [getMessageTemplate]);

  // Send SMS notifications to next 3 queues for all service points
  const sendSmsToNextQueues = useCallback(async (): Promise<void> => {
    try {
      // Check if SMS is enabled
      const smsEnabled = await checkSmsEnabled();
      if (!smsEnabled) {
        logger.info('SMS notifications are disabled');
        return;
      }

      logger.info('Starting SMS notifications for next queues...');
      
      const servicePointData = await getNextQueuesPerServicePoint();
      
      if (servicePointData.length === 0) {
        logger.info('No service points with waiting queues found');
        return;
      }

      let totalSent = 0;
      let totalQueues = 0;

      for (const { servicePoint, queues, patients } of servicePointData) {
        logger.info(`Processing ${queues.length} queues for service point: ${servicePoint.name}`);
        
        for (let i = 0; i < Math.min(queues.length, patients.length, 3); i++) {
          const queue = queues[i];
          const patient = patients[i];
          
          totalQueues++;
          const success = await sendSmsToPatient(patient, queue, servicePoint);
          if (success) {
            totalSent++;
          }
        }
      }

      const message = `ส่ง SMS แจ้งเตือนไปยัง ${totalSent}/${totalQueues} คิว`;
      if (totalSent > 0) {
        toast.success(message);
      }
      logger.info(message);

    } catch (error) {
      logger.error('Error in sendSmsToNextQueues:', error);
      toast.error('เกิดข้อผิดพลาดในการส่ง SMS แจ้งเตือน');
    }
  }, [checkSmsEnabled, getNextQueuesPerServicePoint, sendSmsToPatient]);

  return {
    sendSmsToNextQueues,
    getNextQueuesPerServicePoint,
    sendSmsToPatient,
    checkSmsEnabled,
    getMessageTemplate
  };
};
