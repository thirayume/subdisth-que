import { QueueType } from '@/integrations/supabase/schema';

export const getQueueTypeLabel = (type: QueueType): string => {
  switch (type) {
    case 'GENERAL': return 'ทั่วไป';
    case 'URGENT': return 'ด่วน';
    case 'ELDERLY': return 'ผู้สูงอายุ';
    case 'APPOINTMENT': return 'นัดหมาย';
    default: return 'ไม่ระบุ';
  }
};

export const getAllQueueTypes = (): QueueType[] => {
  return ['GENERAL', 'URGENT', 'ELDERLY', 'APPOINTMENT'];
};