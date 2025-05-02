
import * as React from 'react';
import { useQueueDialogState } from './queue/useQueueDialogState';
import { usePatientQueueInfo } from './queue/usePatientQueueInfo';
import { useQueueHandler } from './queue/useQueueHandler';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useCreateQueue');

export const useCreateQueue = (
  onOpenChange: (open: boolean) => void,
  onCreateQueue: (queue: any) => void
) => {
  const {
    qrDialogOpen,
    setQrDialogOpen,
    createdQueueNumber,
    createdQueueType,
    createdPurpose,
    resetQueueDialog
  } = useQueueDialogState(onOpenChange);

  const patientInfo = usePatientQueueInfo();
  
  const {
    queueType,
    setQueueType,
    notes,
    setNotes,
    queueTypePurposes,
    handleCreateQueue: baseHandleCreateQueue,
    resetQueueCreation
  } = useQueueHandler(onOpenChange, onCreateQueue);

  // Reset all state
  const resetState = React.useCallback(() => {
    logger.debug('Resetting all state');
    patientInfo.resetAll();
    resetQueueCreation();
    resetQueueDialog();
  }, [patientInfo, resetQueueCreation, resetQueueDialog]);

  const handleCreateQueue = async () => {
    try {
      await baseHandleCreateQueue();
    } catch (error) {
      logger.error('Error in handleCreateQueue:', error);
    }
  };

  return {
    // Phone search related props
    phoneNumber: patientInfo.phoneNumber,
    setPhoneNumber: patientInfo.setPhoneNumber,
    isSearching: patientInfo.isSearching,
    matchedPatients: patientInfo.matchedPatients,
    
    // Patient form related props
    showNewPatientForm: patientInfo.showNewPatientForm,
    newPatientName: patientInfo.newPatientName,
    setNewPatientName: patientInfo.setNewPatientName,
    patientId: patientInfo.patientId,
    
    // Queue related props
    queueType,
    setQueueType,
    notes,
    setNotes,
    qrDialogOpen,
    setQrDialogOpen,
    createdQueueNumber,
    createdQueueType,
    createdPurpose,
    
    // Patient info
    finalPatientName: patientInfo.finalPatientName,
    finalPatientPhone: patientInfo.finalPatientPhone,
    finalPatientLineId: patientInfo.finalPatientLineId,
    
    // Queue type purposes
    queueTypePurposes,
    
    // Handlers
    handlePhoneSearch: patientInfo.handlePhoneSearch,
    handleAddNewPatient: patientInfo.handleAddNewPatient,
    handleSelectPatient: patientInfo.handleSelectPatient,
    handleCreateQueue,
    
    // Reset
    resetState
  };
};
