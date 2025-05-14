
import * as React from 'react';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';
import { queueTypePurposes, useQueueCreation, useQueueDialogState } from '../queue';
import { PatientInfo, CreatedQueueInfo } from './types';

const logger = createLogger('useQueueActions');

interface UseQueueActionsProps {
  onOpenChange: (open: boolean) => void;
  onCreateQueue: (queue: any) => void;
  createNewPatient: (name?: string, phone?: string) => Promise<any>;
  patientInfo: PatientInfo;
  showNewPatientForm: boolean;
  phoneNumber: string;
}

export const useQueueActions = ({
  onOpenChange, 
  onCreateQueue,
  createNewPatient,
  patientInfo,
  showNewPatientForm,
  phoneNumber
}: UseQueueActionsProps) => {
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

  const createdQueueInfo: CreatedQueueInfo = {
    queueNumber: createdQueueNumber,
    queueType: createdQueueType,
    purpose: createdPurpose
  };

  const handleAddNewPatient = React.useCallback(async () => {
    logger.debug('Adding new patient');
    
    if (!patientInfo.newPatientName) {
      toast.error('กรุณากรอกชื่อผู้ป่วย');
      return null;
    }
    
    if (!phoneNumber) {
      toast.error('กรุณากรอกเบอร์โทรศัพท์');
      return null;
    }
    
    const newPatient = await createNewPatient(patientInfo.newPatientName, phoneNumber);
    return newPatient;
  }, [createNewPatient, patientInfo.newPatientName, phoneNumber]);

  // Method to create a queue
  const handleCreateQueue = async () => {
    logger.verbose('Creating queue');
    
    try {
      let finalPatientId = patientInfo.patientId;
      
      // If we're creating a new patient
      if (showNewPatientForm) {
        if (!patientInfo.newPatientName) {
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

  // Reset all queue state
  const resetQueueState = React.useCallback(() => {
    logger.debug('Resetting queue state');
    resetQueueCreation();
    resetQueueDialog();
  }, [resetQueueCreation, resetQueueDialog]);

  return {
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
  };
};
