
import * as React from 'react';
import { toast } from 'sonner';
import { usePatientSearch } from './patient/usePatientSearch';
import { usePatientSelection } from './patient/usePatientSelection';
import { useNewPatientCreation } from './patient/useNewPatientCreation';
import { useQueueCreation } from './queue/useQueueCreation';
import { usePatientQueueInfo } from './queue/usePatientQueueInfo';
import { useQueueDialogState } from './queue/useQueueDialogState';
import { QueueType } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useCreateQueue');

export const useCreateQueue = (onOpenChange: (open: boolean) => void, onCreateQueue: (queue: any) => void) => {
  // Custom hooks should be called before all other React hooks
  const {
    phoneNumber,
    setPhoneNumber,
    handlePhoneSearch,
    isSearching,
    matchedPatients,
    showNewPatientForm,
    setShowNewPatientForm
  } = usePatientSearch();
  
  const {
    patientId,
    setPatientId,
    newPatientName,
    setNewPatientName,
    finalPatientName,
    finalPatientPhone,
    finalPatientLineId,
    handleSelectPatient,
    updateFinalPatientInfo,
    resetPatientSelection
  } = usePatientSelection();
  
  const {
    createNewPatient
  } = useNewPatientCreation();
  
  const {
    queueType,
    setQueueType,
    notes,
    setNotes,
    createQueue,
    queueTypePurposes
  } = useQueueCreation();
  
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
  
  // Define callbacks before any useEffects
  const handleCreateNewPatient = React.useCallback(async () => {
    if (!newPatientName || !phoneNumber) {
      toast.error('กรุณากรอกชื่อและเบอร์โทรศัพท์ของผู้ป่วย');
      return;
    }
    
    const newPatient = await createNewPatient(newPatientName, phoneNumber);
    if (newPatient) {
      setPatientId(newPatient.id);
      updateFinalPatientInfo(newPatient.name, newPatient.phone, newPatient.line_id || '');
    }
  }, [newPatientName, phoneNumber, createNewPatient, setPatientId, updateFinalPatientInfo]);
  
  // Handle creating queue
  const handleCreateQueue = React.useCallback(async () => {
    logger.info('Creating queue with patient ID:', patientId);
    
    if (!patientId && newPatientName) {
      await handleCreateNewPatient();
    }
    
    if (!patientId) {
      toast.error('โปรดเลือกผู้ป่วยหรือสร้างผู้ป่วยใหม่');
      return;
    }
    
    try {
      // Create queue using the hook method
      const newQueue = await createQueue(patientId);
      
      if (newQueue) {
        logger.info('Queue created successfully:', newQueue);
        
        // Update QR dialog state
        setQrDialogOpen(true);
        setCreatedQueueNumber(newQueue.number);
        setCreatedQueueType(newQueue.type as QueueType);
        setCreatedPurpose(queueTypePurposes[newQueue.type]);
        
        // Notify parent component
        onCreateQueue(newQueue);
        
        // Show success toast
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
    createQueue, 
    setQrDialogOpen, 
    setCreatedQueueNumber, 
    setCreatedQueueType, 
    setCreatedPurpose, 
    queueTypePurposes,
    onCreateQueue
  ]);
  
  // Helper function to handle adding a new patient
  const handleAddNewPatient = React.useCallback(() => {
    logger.debug('Adding new patient, showing form');
    setShowNewPatientForm(true);
  }, [setShowNewPatientForm]);
  
  const resetState = React.useCallback(() => {
    logger.debug('Resetting all states');
    setPhoneNumber('');
    setPatientId('');
    setNewPatientName('');
    setQueueType('GENERAL' as QueueType);
    setNotes('');
    resetQueueDialog();
    resetPatientSelection();
    setShowNewPatientForm(false);
  }, [
    setPhoneNumber, 
    setPatientId, 
    setNewPatientName,
    setQueueType, 
    setNotes, 
    resetQueueDialog, 
    resetPatientSelection,
    setShowNewPatientForm
  ]);

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
