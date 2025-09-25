import { Medication } from '@/integrations/supabase/schema';

export interface CurrentMedication {
  id: string;
  medication: Medication;
  dosage: string;
  instructions: string;
  dispensed: number;
}

export interface PatientMedication {
  id: string;
  patient_id: string;
  medication_id: string;
  medication?: Medication;
  dosage: string;
  dispensed: number;
  instructions?: string;
  notes?: string;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}