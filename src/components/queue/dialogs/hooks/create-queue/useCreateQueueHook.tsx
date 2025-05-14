
import * as React from 'react';
import { createLogger } from '@/utils/logger';
import { UseCreateQueueProps, UseCreateQueueState } from './types';
import { usePatientInfoHook } from './usePatientInfoHook';
import { useQueueActions } from './useQueueActions';

const logger = createLogger('useCreateQueueHook');

export const useCreateQueueHook = (
  onOpenChange: (open: boolean) => void,
  onCreateQueue: (queue: any) => void
): UseCreateQueueState => {
  logger.verbose('Hook initialized with:', { onOpenChange, onCreateQueue });

  // Use the patient info hook to handle all patient-related state
  const {
    patientSearchState,
    patientSelectionState,
    newPatientCreationState,
    patientInfo,
    handleSelectPatient,
    resetPatientState
  } = usePatientInfoHook();

  const {
    phoneNumber,
    setPhoneNumber,
    isSearching,
    matchedPatients,
    showNewPatientForm,
    handlePhoneSearch
  } = patientSearchState;

  const { patientId } = patientSelectionState;
  
  const {
    newPatientName,
    setNewPatientName,
    createNewPatient
  } = newPatientCreationState;

  // Use the queue actions hook for all queue-related logic
  const queueActions = useQueueActions({
    onOpenChange,
    onCreateQueue,
    createNewPatient,
    patientInfo,
    showNewPatientForm,
    phoneNumber
  });

  const {
    queueType,
    setQueueType,
    notes,
    setNotes,
    queueTypePurposes,
    qrDialogOpen,
    setQrDialogOpen,
    createdQueueInfo,
    handleAddNewPatient,
    handleCreateQueue,
    resetQueueState
  } = queueActions;

  // Extract created queue info
  const { queueNumber: createdQueueNumber, queueType: createdQueueType, purpose: createdPurpose } = createdQueueInfo;

  // Extract patient info
  const { finalPatientName, finalPatientPhone, finalPatientLineId } = patientInfo;

  // Reset all state when unmounting
  React.useEffect(() => {
    return () => {
      resetPatientState();
      resetQueueState();
    };
  }, [resetPatientState, resetQueueState]);

  // Reset all state for a new create operation
  const resetState = React.useCallback(() => {
    logger.debug('Resetting all state');
    resetPatientState();
    resetQueueState();
  }, [resetPatientState, resetQueueState]);

  return {
    // Patient search
    phoneNumber,
    setPhoneNumber,
    isSearching,
    matchedPatients,
    handlePhoneSearch,
    
    // Patient selection
    patientId,
    handleSelectPatient,
    
    // New patient
    showNewPatientForm,
    newPatientName,
    setNewPatientName,
    handleAddNewPatient,
    
    // Queue creation
    queueType,
    setQueueType,
    notes,
    setNotes,
    queueTypePurposes,
    
    // Queue dialog
    qrDialogOpen,
    setQrDialogOpen,
    createdQueueNumber,
    createdQueueType,
    createdPurpose,
    
    // Final patient info
    finalPatientName,
    finalPatientPhone,
    finalPatientLineId,
    
    // Actions
    handleCreateQueue,
    resetState
  };
};
