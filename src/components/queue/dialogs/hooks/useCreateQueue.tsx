
import * as React from 'react';
import { toast } from 'sonner';
import { usePatientSearch } from './patient/usePatientSearch';
import { usePatientSelection } from './patient/usePatientSelection';
import { useNewPatientCreation } from './patient/useNewPatientCreation';
import { useQueueCreation } from './queue/useQueueCreation';

export const useCreateQueue = (
  onOpenChange: (open: boolean) => void,
  onCreateQueue: (queue: any) => void
) => {
  // Get patient search functionality
  const { 
    phoneNumber, 
    setPhoneNumber, 
    isSearching, 
    handlePhoneSearch: searchPatientsByPhone,
    matchedPatients: foundPatients,
    showNewPatientForm: showNewForm,
    setShowNewPatientForm
  } = usePatientSearch();
  
  const [matchedPatients, setMatchedPatients] = React.useState<any[]>([]);
  const [localShowNewPatientForm, setLocalShowNewPatientForm] = React.useState(false);

  React.useEffect(() => {
    setMatchedPatients(foundPatients || []);
    setLocalShowNewPatientForm(showNewForm);
  }, [foundPatients, showNewForm]);

  // Get patient selection functionality
  const {
    patientId,
    setPatientId,
    newPatientName,
    setNewPatientName,
    selectedPatientName,
    selectedPatientPhone,
    selectedPatientLineId,
    finalPatientName,
    finalPatientPhone,
    finalPatientLineId,
    handleSelectPatient: selectPatientFromList,
    updateFinalPatientInfo,
    resetPatientSelection
  } = usePatientSelection();

  // Get new patient creation functionality
  const { createNewPatient } = useNewPatientCreation();

  // Get queue creation functionality
  const {
    queueType,
    setQueueType,
    notes,
    setNotes,
    qrDialogOpen,
    setQrDialogOpen,
    createdQueueNumber,
    createdQueueType,
    createdPurpose,
    queueTypePurposes,
    createQueue,
    resetQueueCreation
  } = useQueueCreation();

  // Reset all state
  const resetState = React.useCallback(() => {
    setPhoneNumber('');
    setMatchedPatients([]);
    setLocalShowNewPatientForm(false);
    setShowNewPatientForm(false);
    resetPatientSelection();
    resetQueueCreation();
  }, [setPhoneNumber, setShowNewPatientForm, resetPatientSelection, resetQueueCreation]);

  // Handle phone search
  const handlePhoneSearch = async () => {
    if (phoneNumber) {
      console.log('[useCreateQueue] Searching for patients with phone:', phoneNumber);
      // Use the hook's function but fetch patient data from the API
      const patients = await searchPatientsByPhone();
      setMatchedPatients(patients || []);
      console.log('[useCreateQueue] Found patients:', patients);
      
      // If no patients found, show new patient form
      if (patients.length === 0) {
        setLocalShowNewPatientForm(true);
        setShowNewPatientForm(true);
        console.log('[useCreateQueue] No patients found, showing new patient form');
      } else {
        setLocalShowNewPatientForm(false);
        setShowNewPatientForm(false);
      }
    }
  };

  // Handle adding a new patient
  const handleAddNewPatient = () => {
    setLocalShowNewPatientForm(true);
    setShowNewPatientForm(true);
    setPatientId('');  // Clear any selected patient
    console.log('[useCreateQueue] Showing new patient form');
  };

  // Handle selecting a patient
  const handleSelectPatient = (id: string) => {
    setLocalShowNewPatientForm(false);
    setShowNewPatientForm(false);
    setPatientId(id);
    selectPatientFromList(id, matchedPatients);
    console.log('[useCreateQueue] Patient selected:', id);
  };

  // Handle creating a queue
  const handleCreateQueue = async () => {
    try {
      console.log('[useCreateQueue] Creating queue...');
      
      if (localShowNewPatientForm && newPatientName) {
        console.log('[useCreateQueue] Creating new patient:', newPatientName);
        // Create new patient first
        const newPatient = await createNewPatient(newPatientName, phoneNumber);
        if (newPatient) {
          console.log('[useCreateQueue] New patient created:', newPatient.id);
          // Create queue for new patient
          await createQueue(
            newPatient.id,
            newPatient.name,
            phoneNumber,
            newPatient.line_id || '',
            updateFinalPatientInfo,
            onCreateQueue,
            onOpenChange
          );
        }
      } else if (patientId) {
        console.log('[useCreateQueue] Creating queue for existing patient:', patientId);
        // Create queue for existing patient
        await createQueue(
          patientId,
          selectedPatientName,
          selectedPatientPhone,
          selectedPatientLineId,
          updateFinalPatientInfo,
          onCreateQueue,
          onOpenChange
        );
      } else {
        console.error('[useCreateQueue] Cannot create queue: No patient selected or created');
        toast.error('ไม่สามารถสร้างคิวได้ โปรดเลือกผู้ป่วยหรือสร้างผู้ป่วยใหม่');
      }
    } catch (error) {
      console.error('[useCreateQueue] Error in handleCreateQueue:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างคิว กรุณาลองใหม่อีกครั้ง');
    }
  };

  return {
    phoneNumber,
    setPhoneNumber,
    isSearching,
    matchedPatients,
    showNewPatientForm: localShowNewPatientForm,
    newPatientName,
    setNewPatientName,
    patientId,
    queueType,
    setQueueType,
    notes,
    setNotes,
    qrDialogOpen,
    setQrDialogOpen,
    createdQueueNumber,
    createdQueueType,
    createdPurpose,
    finalPatientName,
    finalPatientPhone,
    finalPatientLineId,
    queueTypePurposes,
    handlePhoneSearch,
    handleAddNewPatient,
    handleSelectPatient,
    handleCreateQueue,
    resetState
  };
};
