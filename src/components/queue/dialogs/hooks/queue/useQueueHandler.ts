
import { QueueType } from '@/integrations/supabase/schema';
import { useQueueCreation } from './useQueueCreation';
import { toast } from 'sonner';

export const useQueueHandler = (
  onOpenChange: (open: boolean) => void,
  onCreateQueue: (queue: any) => void
) => {
  const {
    queueType,
    setQueueType,
    notes,
    setNotes,
    createQueue,
    queueTypePurposes,
    resetQueueCreation
  } = useQueueCreation();

  const handleCreateQueue = async (
    patientId: string,
    selectedPatientName: string,
    selectedPatientPhone: string,
    selectedPatientLineId: string,
    showNewPatientForm: boolean,
    newPatientName: string,
    phoneNumber: string,
    createNewPatient: (name: string, phone: string) => Promise<any>,
    updateFinalPatientInfo: (name: string, phone: string, lineId: string) => void,
  ) => {
    try {
      toast.loading("กำลังสร้างคิว...");
      
      if (showNewPatientForm && newPatientName) {
        const newPatient = await createNewPatient(newPatientName, phoneNumber);
        if (newPatient) {
          await createQueue(
            newPatient.id,
            newPatient.name,
            phoneNumber,
            newPatient.line_id || '',
            updateFinalPatientInfo,
            onCreateQueue,
            onOpenChange
          );
        } else {
          toast.error('ไม่สามารถสร้างผู้ป่วยใหม่ได้');
        }
      } else if (patientId) {
        await createQueue(
          patientId,
          selectedPatientName,
          selectedPatientPhone,
          selectedPatientLineId,
          updateFinalPatientInfo,
          onCreateQueue,
          onOpenChange
        );
      } else {
        toast.error('ไม่สามารถสร้างคิวได้ โปรดเลือกผู้ป่วยหรือสร้างผู้ป่วยใหม่');
      }
    } catch (error) {
      console.error('⭐ [useQueueHandler] Error in handleCreateQueue:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างคิว กรุณาลองใหม่อีกครั้ง');
    }
  };

  return {
    queueType,
    setQueueType,
    notes,
    setNotes,
    queueTypePurposes,
    handleCreateQueue,
    resetQueueCreation
  };
};
