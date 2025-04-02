
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useNewPatientCreation = () => {
  const createNewPatient = async (
    newPatientName: string,
    phoneNumber: string
  ) => {
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
        toast.success(`สร้างข้อมูลผู้ป่วยใหม่: ${newPatientName}`);
        return newPatientData[0];
      }
      
      return null;
    } catch (err) {
      console.error('Error creating new patient:', err);
      toast.error('ไม่สามารถสร้างข้อมูลผู้ป่วยใหม่ได้');
      return null;
    }
  };

  return {
    createNewPatient
  };
};
