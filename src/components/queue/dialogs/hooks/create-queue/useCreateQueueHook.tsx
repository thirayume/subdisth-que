
import * as React from 'react';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';
import { usePatientSearch, usePatientSelection, useNewPatientCreation } from '../patient';
import { useQueueCreation, useQueueDialogState, queueTypePurposes } from '../queue';
import { CreateQueueHookProps, CreateQueueHookReturn } from './types';

const logger = createLogger('useCreateQueueHook');

export const useCreateQueueHook = (
  onOpenChange: (open: boolean) => void,
  onCreateQueue: (queue: any) => void
): CreateQueueHookReturn => {
  logger.verbose('Hook initialized with:', { onOpenChange, onCreateQueue });

  // Patient search & selection state
  const {
    phoneNumber,
    setPhoneNumber,
    isSearching,
    matchedPatients,
    handlePhoneSearch
  } = usePatientSearch();

  // Patient selection state
  const {
    patientId,
    setPatientId,
    patientName,
    setPatientName,
    patientPhone,
    setPatientPhone,
    lineId,
    setLineId,
    handleSelectPatient
  } = usePatientSelection();

  // New patient state
  const {
    showNewPatientForm,
    setShowNewPatientForm,
    newPatientName,
    setNewPatientName,
    handleAddNewPatient
  } = useNewPatientCreation(setPatientId, setPatientName, setPatientPhone);

  // Queue creation state
  const {
    queueType,
    setQueueType,
    notes,
    setNotes,
    resetQueueCreation,
    createQueue
  } = useQueueCreation();

  // Queue dialog state
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

  // Create the final values for the patient information
  const finalPatientName = patientName || newPatientName;
  const finalPatientPhone = patientPhone || phoneNumber;
  const finalPatientLineId = lineId || '';

  // Method to create a queue
  const handleCreateQueue = async () => {
    logger.verbose('Creating queue');
    
    try {
      let finalPatientId = patientId;
      
      // If we're creating a new patient
      if (showNewPatientForm) {
        if (!newPatientName) {
          toast.error('กรุณากรอกชื่อผู้ป่วย');
          return;
        }
        
        if (!phoneNumber) {
          toast.error('กรุณากรอกเบอร์โทรศัพท์');
          return;
        }
        
        const newPatient = await handleAddNewPatient();
        if (!newPatient) {
          logger.error('Failed to create patient');
          toast.error('ไม่สามารถสร้างผู้ป่วยใหม่ได้');
          return;
        }
        
        finalPatientId = newPatient.id;
      }
      
      // Create the queue
      logger.debug('Creating queue for patient ID:', finalPatientId);
      const queue = await createQueue(finalPatientId);
      
      if (queue) {
        logger.info('Queue created successfully:', queue);
        toast.success('สร้างคิวสำเร็จ');
        
        // Set the info for the QR dialog
        const queueTypeName = queueTypePurposes[queue.type] || '';
        
        setCreatedQueueNumber(queue.number);
        setCreatedQueueType(queue.type);
        setCreatedPurpose(queueTypeName);
        setQrDialogOpen(true);
        
        // Call the callback
        onCreateQueue(queue);
      } else {
        logger.error('No queue returned from createQueue');
        toast.error('ไม่สามารถสร้างคิวได้');
      }
    } catch (error) {
      logger.error('Error creating queue:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างคิว');
    }
  };

  // Reset all state when unmounting
  React.useEffect(() => {
    return () => {
      resetQueueCreation();
      resetQueueDialog();
    };
  }, [resetQueueCreation, resetQueueDialog]);

  // Reset all state for a new create operation
  const resetState = React.useCallback(() => {
    logger.debug('Resetting all state');
    setPhoneNumber('');
    setPatientId('');
    setPatientName('');
    setPatientPhone('');
    setLineId('');
    setShowNewPatientForm(false);
    setNewPatientName('');
    resetQueueCreation();
    resetQueueDialog();
  }, [
    setPhoneNumber, 
    setPatientId, 
    setPatientName, 
    setPatientPhone, 
    setLineId,
    setShowNewPatientForm, 
    setNewPatientName, 
    resetQueueCreation, 
    resetQueueDialog
  ]);

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
