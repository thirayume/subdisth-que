
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
