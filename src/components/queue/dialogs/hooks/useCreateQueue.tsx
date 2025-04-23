
import * as React from 'react';
import { toast } from 'sonner';
import { usePatientSearch } from './patient/usePatientSearch';
import { usePatientSelection } from './patient/usePatientSelection';
import { useQueueCreation } from './queue/useQueueCreation';
import { useNewPatientCreation } from './patient/useNewPatientCreation';

// Add debug logging
console.log("[DEBUG] useCreateQueue importing React:", React);

export const useCreateQueue = (onOpenChange: (open: boolean) => void, onCreateQueue: (queue: any) => void) => {
  const {
    phoneNumber,
    setPhoneNumber,
    isSearching,
    matchedPatients,
    showNewPatientForm,
    handlePhoneSearch,
    handleAddNewPatient,
    resetPatientSearch
  } = usePatientSearch();

  const {
    patientId,
    setPatientId,
    newPatientName,
    setNewPatientName,
    selectedPatientName,
    selectedPatientPhone,
    finalPatientName,
    finalPatientPhone,
    handleSelectPatient,
    updateFinalPatientInfo,
    resetPatientSelection
  } = usePatientSelection();

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

  const { createNewPatient } = useNewPatientCreation();

  // Reset state when dialog is closed
  const resetState = () => {
    resetPatientSearch();
    resetPatientSelection();
    resetQueueCreation();
  };

  // Handle patient selection
  const handleSelectPatientWrapper = (id: string) => {
    handleSelectPatient(id, matchedPatients);
  };

  // Handle queue creation
  const handleCreateQueue = async () => {
    if (!patientId && !newPatientName) {
      toast.error('กรุณาเลือกผู้ป่วยหรือกรอกชื่อผู้ป่วยใหม่');
      return;
    }

    let selectedPatientId = patientId;
    let patientNameToUse = selectedPatientName;
    let patientPhoneToUse = selectedPatientPhone;

    if (showNewPatientForm && newPatientName) {
      const newPatient = await createNewPatient(newPatientName, phoneNumber);
      
      if (newPatient) {
        selectedPatientId = newPatient.id;
        patientNameToUse = newPatientName;
        patientPhoneToUse = phoneNumber;
      } else {
        return; // Don't proceed if patient creation failed
      }
    }

    await createQueue(
      selectedPatientId, 
      patientNameToUse, 
      patientPhoneToUse,
      updateFinalPatientInfo,
      onCreateQueue,
      onOpenChange
    );
  };

  return {
    // Patient search
    phoneNumber,
    setPhoneNumber,
    isSearching,
    matchedPatients,
    showNewPatientForm,
    
    // Patient selection
    newPatientName,
    setNewPatientName,
    patientId,
    
    // Queue creation
    queueType,
    setQueueType,
    notes,
    setNotes,
    qrDialogOpen,
    setQrDialogOpen,
    createdQueueNumber,
    createdQueueType,
    createdPurpose,
    
    // Patient information
    finalPatientName,
    finalPatientPhone,
    
    // Constants
    queueTypePurposes,
    
    // Handlers
    handlePhoneSearch,
    handleAddNewPatient,
    handleSelectPatient: handleSelectPatientWrapper,
    handleCreateQueue,
    
    // State management
    resetState
  };
};
