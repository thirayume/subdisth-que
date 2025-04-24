
import React from 'react';
import { toast } from 'sonner';
import { QueueType, QueueStatus } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';

// Add debug logging
console.log("[DEBUG] useQueueCreation importing React:", React);

// Define the queue type purpose mapping
export const queueTypePurposes = {
  'GENERAL': 'รับยาทั่วไป',
  'PRIORITY': 'กรณีเร่งด่วน',
  'ELDERLY': 'รับยาสำหรับผู้สูงอายุ',
  'FOLLOW_UP': 'ติดตามการรักษา'
};

export const useQueueCreation = () => {
  const [queueType, setQueueType] = React.useState<QueueType>('GENERAL');
  const [notes, setNotes] = React.useState('');
  const [qrDialogOpen, setQrDialogOpen] = React.useState(false);
  const [createdQueueNumber, setCreatedQueueNumber] = React.useState<number | null>(null);
  const [createdQueueType, setCreatedQueueType] = React.useState<QueueType>('GENERAL');
  const [createdPurpose, setCreatedPurpose] = React.useState('');

  const resetQueueCreation = () => {
    setQueueType('GENERAL');
    setNotes('');
    setCreatedQueueType('GENERAL');
    setCreatedPurpose('');
  };

  const createQueue = async (
    patientId: string, 
    patientName: string, 
    patientPhone: string, 
    updateFinalPatientInfo: (name: string, phone: string) => void,
    onCreateQueue: (queue: any) => void,
    onOpenChange: (open: boolean) => void
  ) => {
    if (!patientId) {
      toast.error('กรุณาเลือกผู้ป่วย');
      return;
    }

    // Set the final patient information
    updateFinalPatientInfo(patientName, patientPhone);

    const purpose = queueTypePurposes[queueType];
    const queueNumber = Math.floor(Math.random() * 100) + 1;

    // Ensure queue_date is today
    const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

    try {
      const { data, error } = await supabase
        .from('queues')
        .insert([{
          number: queueNumber,
          patient_id: patientId,
          type: queueType,
          status: 'WAITING' as QueueStatus,
          notes: notes,
          queue_date: today
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
  };
};
