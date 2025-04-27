
import * as React from 'react';
import { toast } from 'sonner';
import { QueueType } from '@/integrations/supabase/schema';
import { useQueues } from '@/hooks/useQueues';
import { useQueueTypesData } from '@/hooks/useQueueTypesData';
import { supabase } from '@/integrations/supabase/client';

export const useQueueCreation = () => {
  const [queueType, setQueueType] = React.useState<QueueType>('GENERAL');
  const [notes, setNotes] = React.useState('');
  const [qrDialogOpen, setQrDialogOpen] = React.useState(false);
  const [createdQueueNumber, setCreatedQueueNumber] = React.useState<number | null>(null);
  const [createdQueueType, setCreatedQueueType] = React.useState<QueueType>('GENERAL');
  const [createdPurpose, setCreatedPurpose] = React.useState('');

  const { addQueue } = useQueues();
  const { queueTypes } = useQueueTypesData();

  // Create a lookup for queue type purposes
  const queueTypePurposes = React.useMemo(() => {
    const purposes: Record<string, string> = {};
    if (queueTypes) {
      queueTypes.forEach(type => {
        purposes[type.code] = type.name || type.code;
      });
    }
    return purposes;
  }, [queueTypes]);

  // Reset queue creation state
  const resetQueueCreation = React.useCallback(() => {
    setQueueType('GENERAL');
    setNotes('');
    setQrDialogOpen(false);
    setCreatedQueueNumber(null);
    setCreatedQueueType('GENERAL');
    setCreatedPurpose('');
  }, []);

  // Get the next queue number based on the highest number for the day
  const getNextQueueNumber = async (queueType: QueueType): Promise<number> => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { data: existingQueues, error } = await supabase
        .from('queues')
        .select('number')
        .eq('queue_date', today)
        .eq('type', queueType)
        .order('number', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching latest queue number:', error);
        throw new Error('Could not get next queue number');
      }

      const highestNumber = existingQueues && existingQueues[0]?.number || 0;
      return highestNumber + 1;
    } catch (error) {
      console.error('Error in getNextQueueNumber:', error);
      throw error;
    }
  };

  // Create a queue for a patient
  const createQueue = async (
    patientId: string,
    patientName: string,
    patientPhone: string,
    patientLineId: string,
    updatePatientInfo: (name: string, phone: string, lineId: string) => void,
    onCreateQueue: (queue: any) => void,
    onOpenChange: (open: boolean) => void
  ) => {
    try {
      // Get the purpose text based on queue type
      const purpose = queueTypePurposes[queueType] || '';
      
      // Get the next queue number
      const nextQueueNumber = await getNextQueueNumber(queueType);
      
      // Create the queue
      const newQueue = await addQueue({
        patient_id: patientId,
        number: nextQueueNumber,
        type: queueType,
        status: 'WAITING',
        notes
      });
      
      if (newQueue) {
        // Update created queue info for QR dialog
        setCreatedQueueNumber(nextQueueNumber);
        setCreatedQueueType(queueType);
        setCreatedPurpose(purpose);
        
        // Update patient info for display
        updatePatientInfo(patientName, patientPhone, patientLineId);
        
        // Close the create dialog and open QR dialog
        onOpenChange(false);
        setQrDialogOpen(true);
        
        toast.success(`คิวหมายเลข ${nextQueueNumber} ถูกสร้างเรียบร้อยแล้ว`);
        onCreateQueue(newQueue);
      }
    } catch (error) {
      console.error('Error creating queue:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างคิว กรุณาลองใหม่อีกครั้ง');
      throw error; // Let the error bubble up
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
