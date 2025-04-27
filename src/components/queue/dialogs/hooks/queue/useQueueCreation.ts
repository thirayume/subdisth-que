
import * as React from 'react';
import { toast } from 'sonner';
import { QueueType } from '@/integrations/supabase/schema';
import { useQueues } from '@/hooks/useQueues';
import { useQueueTypesData } from '@/hooks/useQueueTypesData';

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
      // Get the current highest queue number for this type
      const currentDate = new Date().toISOString().split('T')[0];
      
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
        // The queue_date property will be set by the backend or has a default value
      });
      
      if (newQueue) {
        onCreateQueue(newQueue);
        
        // Store created queue info for QR dialog
        setCreatedQueueNumber(nextQueueNumber);
        setCreatedQueueType(queueType);
        setCreatedPurpose(purpose);
        
        // Update patient info in parent component
        updatePatientInfo(patientName, patientPhone, patientLineId);
        
        // Close the create dialog and open QR dialog
        onOpenChange(false);
        setQrDialogOpen(true);
        
        toast.success(`คิวหมายเลข ${nextQueueNumber} ถูกสร้างเรียบร้อยแล้ว`);
      }
    } catch (error) {
      console.error('Error creating queue:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างคิว กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Helper function to get the next queue number
  const getNextQueueNumber = async (queueType: QueueType): Promise<number> => {
    // In a real app, this would call an API to get the next queue number
    // For now, we'll simulate it with a random number between 1-100
    return Math.floor(Math.random() * 100) + 1;
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
