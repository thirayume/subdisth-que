
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { QueueType, QueueStatus } from '@/integrations/supabase/schema';
import { Patient } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';

// Define the queue type purpose mapping
const queueTypePurposes = {
  'GENERAL': 'รับยาทั่วไป',
  'PRIORITY': 'กรณีเร่งด่วน',
  'ELDERLY': 'รับยาสำหรับผู้สูงอายุ',
  'FOLLOW_UP': 'ติดตามการรักษา'
};

export const useCreateQueue = (onOpenChange: (open: boolean) => void, onCreateQueue: (queue: any) => void) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchedPatients, setMatchedPatients] = useState<Patient[]>([]);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  
  const [newPatientName, setNewPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [queueType, setQueueType] = useState<QueueType>('GENERAL');
  const [notes, setNotes] = useState('');
  
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [createdQueueNumber, setCreatedQueueNumber] = useState<number | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [selectedPatientPhone, setSelectedPatientPhone] = useState('');
  const [createdQueueType, setCreatedQueueType] = useState<QueueType>('GENERAL');
  const [createdPurpose, setCreatedPurpose] = useState('');
  const [finalPatientName, setFinalPatientName] = useState('');
  const [finalPatientPhone, setFinalPatientPhone] = useState('');

  const resetState = () => {
    setPhoneNumber('');
    setIsSearching(false);
    setMatchedPatients([]);
    setShowNewPatientForm(false);
    setNewPatientName('');
    setPatientId('');
    setQueueType('GENERAL');
    setNotes('');
    setSelectedPatientName('');
    setSelectedPatientPhone('');
    setFinalPatientName('');
    setFinalPatientPhone('');
  };

  const handlePhoneSearch = async () => {
    if (!phoneNumber) {
      toast.error('กรุณากรอกเบอร์โทรศัพท์');
      return;
    }

    setIsSearching(true);
    
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .ilike('phone', `%${phoneNumber}%`);
        
      if (error) {
        throw error;
      }
      
      setMatchedPatients(data || []);
      
      if (data.length === 0) {
        setShowNewPatientForm(true);
      } else {
        setShowNewPatientForm(false);
      }
    } catch (err: any) {
      console.error('Error searching for patients:', err);
      toast.error('ไม่สามารถค้นหาข้อมูลผู้ป่วยได้');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddNewPatient = () => {
    setShowNewPatientForm(true);
  };

  const handleSelectPatient = (id: string) => {
    const selectedPatient = matchedPatients.find(p => p.id === id);
    setPatientId(id);
    
    if (selectedPatient) {
      setSelectedPatientName(selectedPatient.name);
      setSelectedPatientPhone(selectedPatient.phone || '');
    }
    
    setShowNewPatientForm(false);
  };

  const handleCreateQueue = async () => {
    if (!patientId && !newPatientName) {
      toast.error('กรุณาเลือกผู้ป่วยหรือกรอกชื่อผู้ป่วยใหม่');
      return;
    }

    let selectedPatientId = patientId;
    let patientNameToUse = selectedPatientName;
    let patientPhoneToUse = selectedPatientPhone;

    if (showNewPatientForm && newPatientName) {
      try {
        // Generate a patient_id with format P + 4 digits
        const patientIdNum = Math.floor(1000 + Math.random() * 9000);
        const patient_id = `P${patientIdNum}`;
        
        const { data: newPatientData, error } = await supabase
          .from('patients')
          .insert([{
            name: newPatientName,
            phone: phoneNumber,
            patient_id: patient_id,
          }])
          .select();
        
        if (error) {
          throw error;
        }
        
        if (newPatientData && newPatientData.length > 0) {
          selectedPatientId = newPatientData[0].id;
          patientNameToUse = newPatientName;
          patientPhoneToUse = phoneNumber;
          
          toast.success(`สร้างข้อมูลผู้ป่วยใหม่: ${newPatientName}`);
        }
      } catch (err) {
        console.error('Error creating new patient:', err);
        toast.error('ไม่สามารถสร้างข้อมูลผู้ป่วยใหม่ได้');
        return;
      }
    }

    // Set the final patient information
    setFinalPatientName(patientNameToUse);
    setFinalPatientPhone(patientPhoneToUse);

    const purpose = queueTypePurposes[queueType];
    
    const queueNumber = Math.floor(Math.random() * 100) + 1;
    
    try {
      const { data, error } = await supabase
        .from('queues')
        .insert([{
          number: queueNumber,
          patient_id: selectedPatientId,
          type: queueType,
          status: 'WAITING' as QueueStatus,
          notes: notes
        }])
        .select();
        
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        onCreateQueue(data[0]);
        toast.success(`สร้างคิวหมายเลข ${queueNumber} เรียบร้อยแล้ว`);
        
        setCreatedQueueNumber(queueNumber);
        setCreatedQueueType(queueType);
        setCreatedPurpose(purpose);
        setQrDialogOpen(true);
        
        onOpenChange(false);
      }
    } catch (err) {
      console.error('Error creating queue:', err);
      toast.error('ไม่สามารถสร้างคิวได้');
    }
  };

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
    queueTypePurposes,
    handlePhoneSearch,
    handleAddNewPatient,
    handleSelectPatient,
    handleCreateQueue,
    resetState
  };
};
