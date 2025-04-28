
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
  console.log('⭐ [useCreateQueue] Hook initialized');
  
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
    console.log(`⭐ [useCreateQueue] foundPatients updated: ${foundPatients?.length || 0} patients`);
    console.log(`⭐ [useCreateQueue] showNewForm updated: ${showNewForm}`);
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
    console.log('⭐ [useCreateQueue] Resetting all state');
    setPhoneNumber('');
    setMatchedPatients([]);
    setLocalShowNewPatientForm(false);
    setShowNewPatientForm(false);
    resetPatientSelection();
    resetQueueCreation();
  }, [setPhoneNumber, setShowNewPatientForm, resetPatientSelection, resetQueueCreation]);

  // Handle phone search
  const handlePhoneSearch = async () => {
    console.log(`----------------------------------------`);
    console.log(`⭐ [useCreateQueue] PHONE SEARCH INITIATED`);
    console.log(`----------------------------------------`);
    console.log(`Phone: "${phoneNumber}"`);
    
    if (phoneNumber) {
      console.log('⭐ [useCreateQueue] Searching for patients with phone:', phoneNumber);
      // Use the hook's function but fetch patient data from the API
      const patients = await searchPatientsByPhone();
      setMatchedPatients(patients || []);
      console.log('⭐ [useCreateQueue] Found patients:', patients);
      
      // If no patients found, show new patient form
      if (patients.length === 0) {
        console.log('⭐ [useCreateQueue] No patients found, showing new patient form');
        setLocalShowNewPatientForm(true);
        setShowNewPatientForm(true);
      } else {
        console.log('⭐ [useCreateQueue] Patients found, hiding new patient form');
        setLocalShowNewPatientForm(false);
        setShowNewPatientForm(false);
      }
    } else {
      console.log('⭐ [useCreateQueue] Phone number is empty, not searching');
      toast.error('กรุณากรอกเบอร์โทรศัพท์');
    }
  };

  // Handle adding a new patient
  const handleAddNewPatient = () => {
    console.log('⭐ [useCreateQueue] handleAddNewPatient called');
    setLocalShowNewPatientForm(true);
    setShowNewPatientForm(true);
    setPatientId('');  // Clear any selected patient
    console.log('⭐ [useCreateQueue] Showing new patient form');
  };

  // Handle selecting a patient
  const handleSelectPatient = (id: string) => {
    console.log(`⭐ [useCreateQueue] handleSelectPatient called with id: ${id}`);
    setLocalShowNewPatientForm(false);
    setShowNewPatientForm(false);
    setPatientId(id);
    selectPatientFromList(id, matchedPatients);
    console.log('⭐ [useCreateQueue] Patient selected:', id);
  };

  // Handle creating a queue
  const handleCreateQueue = async () => {
    console.log(`----------------------------------------`);
    console.log(`⭐ [useCreateQueue] CREATE QUEUE INITIATED`);
    console.log(`----------------------------------------`);
    console.log(`Patient ID: ${patientId}`);
    console.log(`Show new patient form: ${localShowNewPatientForm}`);
    console.log(`New patient name: ${newPatientName}`);
    
    try {
      toast.loading("กำลังสร้างคิว...");
      
      if (localShowNewPatientForm && newPatientName) {
        console.log('⭐ [useCreateQueue] Creating new patient:', newPatientName);
        // Create new patient first
        const newPatient = await createNewPatient(newPatientName, phoneNumber);
        if (newPatient) {
          console.log('⭐ [useCreateQueue] New patient created:', newPatient.id);
          console.log('⭐ [useCreateQueue] New patient details:', newPatient);
          
          // Create queue for new patient
          const newQueue = await createQueue(
            newPatient.id,
            newPatient.name,
            phoneNumber,
            newPatient.line_id || '',
            updateFinalPatientInfo,
            onCreateQueue,
            onOpenChange
          );
          
          console.log('⭐ [useCreateQueue] After createQueue call for new patient');
          console.log(`- Queue created:`, newQueue);
          console.log(`- QR dialog open: ${qrDialogOpen}`);
          console.log(`- Created queue number: ${createdQueueNumber}`);
        } else {
          console.error('⭐ [useCreateQueue] Failed to create new patient');
          toast.error('ไม่สามารถสร้างผู้ป่วยใหม่ได้');
        }
      } else if (patientId) {
        console.log('⭐ [useCreateQueue] Creating queue for existing patient:', patientId);
        console.log(`⭐ [useCreateQueue] Patient info - name: ${selectedPatientName}, phone: ${selectedPatientPhone}`);
        
        // Create queue for existing patient
        const newQueue = await createQueue(
          patientId,
          selectedPatientName,
          selectedPatientPhone,
          selectedPatientLineId,
          updateFinalPatientInfo,
          onCreateQueue,
          onOpenChange
        );
        
        console.log('⭐ [useCreateQueue] After createQueue call for existing patient');
        console.log(`- Queue created:`, newQueue);
        console.log(`- QR dialog open: ${qrDialogOpen}`);
        console.log(`- Created queue number: ${createdQueueNumber}`);
      } else {
        console.error('⭐ [useCreateQueue] Cannot create queue: No patient selected or created');
        toast.error('ไม่สามารถสร้างคิวได้ โปรดเลือกผู้ป่วยหรือสร้างผู้ป่วยใหม่');
      }
    } catch (error) {
      console.error('⭐ [useCreateQueue] Error in handleCreateQueue:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างคิว กรุณาลองใหม่อีกครั้ง');
    }
  };

  React.useEffect(() => {
    console.log(`⭐ [useCreateQueue] State update:`);
    console.log(`- patientId: ${patientId}`);
    console.log(`- queueType: ${queueType}`);
    console.log(`- qrDialogOpen: ${qrDialogOpen}`);
    console.log(`- createdQueueNumber: ${createdQueueNumber}`);
    console.log(`- finalPatientName: ${finalPatientName}`);
  }, [patientId, queueType, qrDialogOpen, createdQueueNumber, finalPatientName]);

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
