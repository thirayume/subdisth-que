
import { supabase } from '@/integrations/supabase/client';
import { Queue, ServicePoint, Patient } from '@/integrations/supabase/schema';
import { createLogger } from '@/utils/logger';
import { getMessageTemplate } from './smsSettings';
import { formatQueueNumber } from '@/utils/queueFormatters';

const logger = createLogger('smsService');

export const sendSmsToPatient = async (
  patient: Patient,
  queue: Queue,
  servicePoint?: ServicePoint
): Promise<boolean> => {
  try {
    if (!patient.phone) {
      logger.warn(`No phone number for patient ${patient.name} (Queue ${queue.number})`);
      return false;
    }
    console.log("run sendSmsToPatient");
    // Format the queue number properly (A001, E007, etc.)
    const formattedQueueNumber = formatQueueNumber(queue.type as any, queue.number);

    // Get message template from settings
    const messageTemplate = await getMessageTemplate();
    const message = messageTemplate
      ? messageTemplate
          .replace('{queueNumber}', formattedQueueNumber)
          .replace('{servicePoint}', servicePoint?.name || '')
      : `ท่านกำลังจะได้รับบริการในคิวถัดไป คิวหมายเลข ${formattedQueueNumber}${servicePoint?.name ? ` ที่ช่องบริการ ${servicePoint.name}` : ''} `;

    const { data, error } = await supabase.functions.invoke('send-sms-notification', {
      body: {
        phoneNumber: patient.phone,
        message,
        queueNumber: formattedQueueNumber,
        patientName: patient.name,
        servicePointName: servicePoint?.name
      }
    });

    if (error) {
      logger.error(`SMS error for queue ${formattedQueueNumber}:`, error);
      return false;
    }

    logger.info(`SMS sent successfully to queue ${formattedQueueNumber} (${patient.name})`);

    // Update notification timestamp on the queue
    const { error: updateError } = await supabase
      .from('queues')
      .update({ noti_at: new Date().toISOString() })
      .eq('id', queue.id);

    if (updateError) {
      logger.error(`Failed to update noti_at for queue ${formattedQueueNumber} (id=${queue.id}):`, updateError);
    } else {
      logger.info(`Updated noti_at for queue ${formattedQueueNumber} (id=${queue.id})`);
    }

    return true;
  } catch (error) {
    logger.error(`Error sending SMS to patient ${patient.name}:`, error);
    return false;
  }
};
