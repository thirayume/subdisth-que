
export interface Patient {
  id: string;
  patient_id: string;
  name: string;
  phone: string;
  line_id?: string;
  address?: string;
  gender?: string;
  birth_date?: string;
  distance_from_hospital?: number;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export type QueueType = 'GENERAL' | 'PRIORITY' | 'ELDERLY' | 'FOLLOW_UP';
export type QueueStatus = 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'SKIPPED';

export interface Queue {
  id: string;
  number: number;
  patient_id: string;
  type: QueueType;
  status: QueueStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  called_at?: string;
  completed_at?: string;
}

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  patient_id: string;
  date: string;
  purpose: string;
  notes?: string;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  id: string;
  code: string;
  name: string;
  description?: string;
  unit: string;
  stock: number;
  min_stock: number;
  created_at: string;
  updated_at: string;
}
