// Update just the queueTypePurposes constant to fix type error

import * as React from 'react';
import { toast } from 'sonner';
import { usePatientSearch } from './patient/usePatientSearch';
import { usePatientSelection } from './patient/usePatientSelection';
import { useNewPatientCreation } from './patient/useNewPatientCreation';
import { useQueueCreation } from './queue/useQueueCreation';
import { usePatientQueueInfo } from './queue/usePatientQueueInfo';
import { useQueueDialogState } from './queue/useQueueDialogState';
import { QueueType } from '@/integrations/supabase/schema';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useCreateQueue');

// Fix the queueTypePurposes to use string values instead of arrays
const queueTypePurposes: Record<string, string> = {
  'GENERAL': 'ทั่วไป',
  'PRIORITY': 'กรณีเร่งด่วน',
  'ELDERLY': 'ผู้สูงอายุ 60 ปีขึ้นไป',
  'FOLLOW_UP': 'ติดตามการรักษา'
};

export const useCreateQueue = (onOpenChange: (open: boolean) => void, onCreateQueue: (queue: any) => void) => {
  const {
    phoneNumber,
    setPhoneNumber,
    handlePhoneSearch,
    isSearching,
    matchedPatients
  } = usePatientSearch();
  
  const {
    patientId,
    setPatientId,
    finalPatientName,
    finalPatientPhone,
    finalPatientLineId,
    handleSelectPatient,
    handleAddNewPatient,
    showNewPatientForm,
  } = usePatientSelection();
  
  const {
    newPatientName,
    setNewPatientName,
    handleCreateNewPatient
  } = useNewPatientCreation(setPatientId);
  
  const {
    queueType,
    setQueueType,
    notes,
    setNotes,
  } = usePatientQueueInfo();
  
  const {
    qrDialogOpen,
    setQrDialogOpen,
    createdQueueNumber,
    setCreatedQueueNumber,
    createdQueueType,
    setCreatedQueueType,
    createdPurpose,
    setCreatedPurpose,
    resetQueueDialog
  } = useQueueDialogState(onOpenChange);
  
  const {
    handleCreateQueue
  } = useQueueCreation(
    patientId,
    newPatientName,
    queueType,
    notes,
    setQrDialogOpen,
    setCreatedQueueNumber,
    setCreatedQueueType,
    setCreatedPurpose,
    onCreateQueue
  );
  
  const resetState = React.useCallback(() => {
    logger.debug('Resetting all states');
    setPhoneNumber('');
    setPatientId(null);
    setNewPatientName('');
    setQueueType('GENERAL');
    setNotes('');
    resetQueueDialog();
  }, [setPhoneNumber, setPatientId, setNewPatientName, setQueueType, setNotes, resetQueueDialog]);

  return {
    phoneNumber,
    setPhoneNumber,
    isSearching,
    matchedPatients,
    showNewPatientForm,
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
