
import { Patient, QueueTypeEnum, QueueStatus } from '@/integrations/supabase/schema';

export interface PharmacyService {
  id: string;
  queue_id: string;
  pharmacist_notes?: string | null;
  service_start_at: string;
  service_end_at?: string | null;
  forwarded_to?: string | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FORWARDED';
  created_at: string;
  updated_at: string;
}

export interface PharmacyQueue {
  id: string;
  number: number;
  patient_id: string;
  type: QueueTypeEnum;
  status: QueueStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  called_at?: string;
  completed_at?: string;
  queue_date?: string;
  patient?: Patient;
  service?: PharmacyService;
}
