
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

  const handleCreateQueue = async () => {
    try {
      const patientId = document.getElementById('patientId')?.getAttribute('data-patient-id');
      const selectedPatientName = document.getElementById('patientId')?.getAttribute('data-patient-name') || '';
      const selectedPatientPhone = document.getElementById('patientId')?.getAttribute('data-patient-phone') || '';
      const selectedPatientLineId = document.getElementById('patientId')?.getAttribute('data-patient-line-id') || '';
      const showNewPatientForm = document.getElementById('newPatientForm')?.getAttribute('data-show') === 'true';
      const newPatientName = (document.getElementById('newPatientName') as HTMLInputElement)?.value || '';
      const phoneNumber = (document.getElementById('phoneNumber') as HTMLInputElement)?.value || '';
      
      toast.loading("กำลังสร้างคิว...", { id: "create-queue" });
      
      if (showNewPatientForm && newPatientName) {
        // Logic for creating new patient
        const createNewPatient = async (name: string, phone: string) => {
          try {
            // Implementation would go here
            return { id: "new-id", name, phone, line_id: "" };
          } catch (error) {
            console.error("Error creating new patient:", error);
            return null;
          }
        };

        const newPatient = await createNewPatient(newPatientName, phoneNumber);
        if (newPatient) {
          await createQueue(
            newPatient.id,
            newPatient.name,
            phoneNumber,
            newPatient.line_id || '',
            (name, phone, lineId) => {
              // Update final patient info
            },
            onCreateQueue,
            onOpenChange
          );
        } else {
          toast.error('ไม่สามารถสร้างผู้ป่วยใหม่ได้', { id: "create-queue" });
        }
      } else if (patientId) {
        await createQueue(
          patientId,
          selectedPatientName,
          selectedPatientPhone,
          selectedPatientLineId,
          (name, phone, lineId) => {
            // Update final patient info
          },
          onCreateQueue,
          onOpenChange
        );
      } else {
        toast.error('ไม่สามารถสร้างคิวได้ โปรดเลือกผู้ป่วยหรือสร้างผู้ป่วยใหม่', { id: "create-queue" });
      }
    } catch (error) {
      console.error('⭐ [useQueueHandler] Error in handleCreateQueue:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างคิว กรุณาลองใหม่อีกครั้ง', { id: "create-queue" });
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
