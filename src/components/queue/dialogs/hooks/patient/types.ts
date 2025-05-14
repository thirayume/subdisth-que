
import { Patient } from '@/integrations/supabase/schema';

export interface PatientSearchState {
  phoneNumber: string;
  isSearching: boolean;
  matchedPatients: Patient[];
  showNewPatientForm: boolean;
}

export interface PatientSearchActions {
  setPhoneNumber: (value: string) => void;
  setShowNewPatientForm: (value: boolean) => void;
  handlePhoneSearch: () => Promise<Patient[]>;
  resetPatientSearch: () => void;
}

export interface PatientSelectionState {
  patientId: string;
  newPatientName: string;
  selectedPatientName: string;
  selectedPatientPhone: string;
  selectedPatientLineId: string;
  finalPatientName: string;
  finalPatientPhone: string;
  finalPatientLineId: string;
}

export interface PatientSelectionActions {
  setPatientId: (value: string) => void;
  setNewPatientName: (value: string) => void;
  handleSelectPatient: (id: string, patients: Patient[]) => void;
  updateFinalPatientInfo: (name: string, phone: string, lineId?: string) => void;
  resetPatientSelection: () => void;
}

export interface NewPatientCreationResult {
  id: string;
  name: string;
  patient_id: string;
  phone: string;
  line_id?: string;
  [key: string]: any;
}

export interface NewPatientCreationActions {
  createNewPatient: (name: string, phone: string) => Promise<NewPatientCreationResult | null>;
}
