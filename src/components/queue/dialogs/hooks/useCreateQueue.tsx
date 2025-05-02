
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
    matchedPatients,
    showNewPatientForm,
    setShowNewPatientForm
  } = usePatientSearch();
  
  const {
    patientId,
    setPatientId,
    finalPatientName,
    finalPatientPhone,
    finalPatientLineId,
    handleSelectPatient,
    updateFinalPatientInfo,
    resetPatientSelection
  } = usePatientSelection();
  
  // Create a local state for the new patient name to avoid dependency issues
  const [newPatientName, setNewPatientName] = React.useState('');
  
  const {
    createNewPatient
  } = useNewPatientCreation();
  
  const {
    queueType,
    setQueueType,
    notes,
    setNotes,
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
  
  // Handle creating new patient
  const handleCreateNewPatient = async () => {
    if (!newPatientName || !phoneNumber) {
      toast.error('กรุณากรอกชื่อและเบอร์โทรศัพท์ของผู้ป่วย');
      return;
    }
    
    const newPatient = await createNewPatient(newPatientName, phoneNumber);
    if (newPatient) {
      setPatientId(newPatient.id);
      updateFinalPatientInfo(newPatient.name, newPatient.phone, newPatient.line_id || '');
    }
  };
  
  // Handle creating queue
  const handleCreateQueue = async () => {
    logger.info('Creating queue with patient ID:', patientId);
    
    if (!patientId && newPatientName) {
      await handleCreateNewPatient();
    }
    
    if (!patientId) {
      toast.error('โปรดเลือกผู้ป่วยหรือสร้างผู้ป่วยใหม่');
      return;
    }
    
    try {
      // Create queue in Supabase
      const { data: queueData, error } = await supabase
        .from('queues')
        .insert([
          {
            patient_id: patientId,
            type: queueType,
            status: 'WAITING',
            notes: notes
          }
        ])
        .select();
      
      if (error) {
        logger.error('Error creating queue:', error);
        toast.error('ไม่สามารถสร้างคิวได้');
        return;
      }
      
      if (queueData && queueData.length > 0) {
        const newQueue = queueData[0];
        logger.info('Queue created successfully:', newQueue);
        
        // Update QR dialog state
        setQrDialogOpen(true);
        setCreatedQueueNumber(newQueue.number);
        setCreatedQueueType(newQueue.type);
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
  };
  
  // Helper function to handle adding a new patient
  const handleAddNewPatient = () => {
    logger.debug('Adding new patient, showing form');
    setShowNewPatientForm(true);
  };
  
  const resetState = React.useCallback(() => {
    logger.debug('Resetting all states');
    setPhoneNumber('');
    setPatientId(null);
    setNewPatientName('');
    setQueueType('GENERAL');
    setNotes('');
    resetQueueDialog();
    resetPatientSelection();
    setShowNewPatientForm(false);
  }, [
    setPhoneNumber, 
    setPatientId, 
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
