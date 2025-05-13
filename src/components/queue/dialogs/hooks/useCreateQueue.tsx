
import * as React from 'react';
import { toast } from 'sonner';
import { usePatientSearch } from './patient/usePatientSearch';
import { usePatientSelection } from './patient/usePatientSelection';
import { useNewPatientCreation } from './patient/useNewPatientCreation';
import { useQueueCreation } from './queue/useQueueCreation';
import { useQueueDialogState } from './queue/useQueueDialogState';
import { QueueType } from '@/integrations/supabase/schema';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useCreateQueue');

export const useCreateQueue = (onOpenChange: (open: boolean) => void, onCreateQueue: (queue: any) => void) => {
  // All hooks are called unconditionally at the top level
  const patientSearch = usePatientSearch();
  const patientSelection = usePatientSelection();
  const patientCreation = useNewPatientCreation();
  const queueCreation = useQueueCreation();
  const queueDialogState = useQueueDialogState(onOpenChange);
  
  // Extract values using object destructuring to ensure consistent usage
  const {
    phoneNumber,
    setPhoneNumber,
    handlePhoneSearch: searchByPhone,
    isSearching,
    matchedPatients: foundPatients,
    showNewPatientForm,
    setShowNewPatientForm,
    resetPatientSearch
  } = patientSearch;
  
  const {
    patientId,
    setPatientId,
    newPatientName,
    setNewPatientName,
    finalPatientName,
    finalPatientPhone,
    finalPatientLineId,
    handleSelectPatient: selectPatient,
    updateFinalPatientInfo,
    resetPatientSelection
  } = patientSelection;
  
  const {
    createNewPatient
  } = patientCreation;
  
  const {
    queueType,
    setQueueType,
    notes,
    setNotes,
    createQueue: createNewQueue,
    queueTypePurposes
  } = queueCreation;
  
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
  } = queueDialogState;
  
  // Define handler functions using useCallback
  const handlePhoneSearch = React.useCallback(async () => {
    if (phoneNumber) {
      await searchByPhone();
    } else {
      toast.error('กรุณากรอกเบอร์โทรศัพท์');
    }
  }, [phoneNumber, searchByPhone]);
  
  const handleCreateNewPatient = React.useCallback(async () => {
    if (!newPatientName || !phoneNumber) {
      toast.error('กรุณากรอกชื่อและเบอร์โทรศัพท์ของผู้ป่วย');
      return null;
    }
    
    const newPatient = await createNewPatient(newPatientName, phoneNumber);
    if (newPatient) {
      setPatientId(newPatient.id);
      updateFinalPatientInfo(newPatient.name, newPatient.phone, newPatient.line_id || '');
    }
    return newPatient;
  }, [newPatientName, phoneNumber, createNewPatient, setPatientId, updateFinalPatientInfo]);
  
  const handleCreateQueue = React.useCallback(async () => {
    logger.info('Creating queue with patient ID:', patientId);
    
    let currentPatientId = patientId;
    
    if (!currentPatientId && newPatientName) {
      const newPatient = await handleCreateNewPatient();
      if (newPatient) {
        currentPatientId = newPatient.id;
      }
    }
    
    if (!currentPatientId) {
      toast.error('โปรดเลือกผู้ป่วยหรือสร้างผู้ป่วยใหม่');
      return;
    }
    
    try {
      const newQueue = await createNewQueue(currentPatientId);
      
      if (newQueue) {
        logger.info('Queue created successfully:', newQueue);
        setQrDialogOpen(true);
        setCreatedQueueNumber(newQueue.number);
        setCreatedQueueType(newQueue.type as QueueType);
        setCreatedPurpose(queueTypePurposes[newQueue.type]);
        onCreateQueue(newQueue);
        toast.success(`สร้างคิวหมายเลข ${newQueue.number} สำเร็จ`);
      }
    } catch (err) {
      logger.error('Error in handleCreateQueue:', err);
      toast.error('เกิดข้อผิดพลาดในการสร้างคิว');
    }
  }, [
    patientId, 
    newPatientName, 
    handleCreateNewPatient, 
    createNewQueue,
    setQrDialogOpen, 
    setCreatedQueueNumber, 
    setCreatedQueueType, 
    setCreatedPurpose, 
    queueTypePurposes,
    onCreateQueue
  ]);
  
  const handleAddNewPatient = React.useCallback(() => {
    logger.debug('Adding new patient, showing form');
    setShowNewPatientForm(true);
  }, [setShowNewPatientForm]);
  
  const handleSelectPatient = React.useCallback((id: string) => {
    selectPatient(id, foundPatients || []);
  }, [selectPatient, foundPatients]);
  
  const resetState = React.useCallback(() => {
    logger.debug('Resetting all states');
    setPhoneNumber('');
    setPatientId('');
    setNewPatientName('');
    setQueueType('GENERAL' as QueueType);
    setNotes('');
    resetQueueDialog();
    resetPatientSelection();
    resetPatientSearch();
    setShowNewPatientForm(false);
  }, [
    setPhoneNumber, 
    setPatientId, 
    setNewPatientName, 
    setQueueType, 
    setNotes, 
    resetQueueDialog, 
    resetPatientSelection,
    resetPatientSearch,
    setShowNewPatientForm
  ]);

  // Return a memoized value to ensure consistent return value
  return React.useMemo(() => ({
    // State
    phoneNumber,
    setPhoneNumber,
    isSearching,
    matchedPatients: foundPatients || [],
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
    
    // Actions
    handlePhoneSearch,
    handleAddNewPatient,
    handleSelectPatient,
    handleCreateQueue,
    resetState
  }), [
    phoneNumber,
    setPhoneNumber,
    isSearching,
    foundPatients,
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
  ]);
};
