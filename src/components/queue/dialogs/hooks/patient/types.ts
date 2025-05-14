
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
  patientName: string;
  patientPhone: string;
  lineId: string;
}

export interface PatientSelectionActions {
  setPatientId: (value: string) => void;
  setPatientName: (value: string) => void;
  setPatientPhone: (value: string) => void;
  setLineId: (value: string) => void;
  handleSelectPatient: (id: string, patients?: Patient[]) => void;
  resetPatientSelection: () => void;
}

export interface NewPatientCreationState {
  newPatientName: string;
  showNewPatientForm: boolean;
}

export interface NewPatientCreationActions {
  setNewPatientName: (value: string) => void;
  setShowNewPatientForm: (value: boolean) => void;
  handleAddNewPatient: () => Promise<any>;
  resetNewPatientCreation: () => void;
}

export interface NewPatientCreationResult {
  id: string;
  name: string;
  patient_id: string;
  phone: string;
  line_id?: string;
  [key: string]: any;
}
