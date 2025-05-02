
import * as React from 'react';
import { toast } from 'sonner';
import { QueueType } from '@/integrations/supabase/schema';
import { useQueues } from '@/hooks/useQueues';
import { useQueueTypesData } from '@/hooks/useQueueTypesData';
import { supabase } from '@/integrations/supabase/client';

export const useQueueCreation = () => {
  console.log('🔄 [useQueueCreation] Hook initialized');
  
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
    if (queueTypes && Array.isArray(queueTypes)) {
      queueTypes.forEach(type => {
        purposes[type.code] = type.name || type.code;
      });
    }
    console.log('🔄 [useQueueCreation] Queue type purposes initialized:', purposes);
    return purposes;
  }, [queueTypes]);

  // Reset queue creation state
  const resetQueueCreation = React.useCallback(() => {
    console.log('🔄 [useQueueCreation] Resetting queue creation state');
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
      console.log(`🔄 [useQueueCreation] Getting next queue number for ${queueType} on ${today}`);
      
      const { data: existingQueues, error } = await supabase
        .from('queues')
        .select('number')
        .eq('queue_date', today)
        .eq('type', queueType)
        .order('number', { ascending: false })
        .limit(1);

      if (error) {
        console.error('🔄 [useQueueCreation] Error fetching latest queue number:', error);
        throw new Error('Could not get next queue number');
      }

      // Handle case when no queues exist yet
      const highestNumber = existingQueues && existingQueues.length > 0 ? existingQueues[0]?.number || 0 : 0;
      const nextNumber = highestNumber + 1;
      console.log(`🔄 [useQueueCreation] Highest existing number: ${highestNumber}, Next queue number: ${nextNumber}`);
      return nextNumber;
    } catch (error) {
      console.error('🔄 [useQueueCreation] Error in getNextQueueNumber:', error);
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
      console.log(`🔄 [useQueueCreation] CREATING QUEUE`);
      console.log(`Patient ID: ${patientId}`);
      console.log(`Patient Name: ${patientName}`);
      console.log(`Patient Phone: ${patientPhone}`);
      console.log(`Patient Line ID: ${patientLineId || 'none'}`);
      console.log(`Queue Type: ${queueType}`);
      console.log(`Notes: ${notes || 'none'}`);
      
      // Get the purpose text based on queue type
      const purpose = queueTypePurposes[queueType] || '';
      console.log(`🔄 [useQueueCreation] Queue purpose: ${purpose}`);
      
      // Get the next queue number
      const nextQueueNumber = await getNextQueueNumber(queueType);
      console.log(`🔄 [useQueueCreation] Next queue number acquired: ${nextQueueNumber}`);
      
      // Create the queue
      console.log('🔄 [useQueueCreation] Calling addQueue to create queue in database');
      const newQueue = await addQueue({
        patient_id: patientId,
        number: nextQueueNumber,
        type: queueType,
        status: 'WAITING',
        notes
      });
      
      if (newQueue) {
        console.log(`🔄 [useQueueCreation] Queue created successfully:`, newQueue);
        
        // First update all the state needed for the QR dialog
        setCreatedQueueNumber(nextQueueNumber);
        setCreatedQueueType(queueType);
        setCreatedPurpose(purpose);
        
        // Update patient info for display
        updatePatientInfo(patientName, patientPhone, patientLineId);
        
        // Close the create dialog
        onOpenChange(false);
        
        // Show success toast
        toast.success(`คิวหมายเลข ${nextQueueNumber} ถูกสร้างเรียบร้อยแล้ว`, { id: "create-queue" });
        
        // Notify parent component
        onCreateQueue(newQueue);
        
        // Use a more reliable approach with a slightly longer delay to ensure 
        // the create dialog has fully closed before opening the QR dialog
        setTimeout(() => {
          setQrDialogOpen(true);
        }, 300);
        
        return newQueue;
      } else {
        toast.error('ไม่สามารถสร้างคิว กรุณาลองใหม่อีกครั้ง', { id: "create-queue" });
        throw new Error('Failed to create queue, no queue was returned');
      }
    } catch (error) {
      console.error('🔄 [useQueueCreation] Error creating queue:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างคิว กรุณาลองใหม่อีกครั้ง', { id: "create-queue" });
      throw error;
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
