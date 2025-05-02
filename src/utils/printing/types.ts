
import { QueueType } from '@/integrations/supabase/schema';

export interface PrintQueueOptions {
  queueNumber: number;
  queueType: QueueType;
  patientName?: string;
  patientPhone?: string;
  patientLineId?: string;
  purpose?: string;
  estimatedWaitTime?: number;
}
