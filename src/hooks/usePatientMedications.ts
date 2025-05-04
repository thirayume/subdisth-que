
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { speakText } from '@/utils/textToSpeech';

interface PatientMedication {
  id: string;
  patient_id: string;
  medication_id: string;
  dosage: string;
  instructions?: string;
  start_date: string;
  end_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  medication?: {
    name: string;
    description?: string;
    unit: string;
  };
}

export const usePatientMedications = (patientId: string) => {
  const [medications, setMedications] = useState<PatientMedication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatientMedications = async (patientId: string) => {
    try {
      console.log('Fetching medications for patient:', patientId);
      
      // Get the current session to include the auth token
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        setError('ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบก่อนใช้งาน');
        setLoading(false);
        return [];
      }
      
      const response = await fetch(
        'https://lkclreldnbejfubzhube.supabase.co/functions/v1/get_patient_medications',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({ patientId }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `Failed with status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Received data:', responseData);
      return responseData.data;
    } catch (error) {
      console.error('Error fetching patient medications:', error);
      throw error;
    }
  };

  const addPatientMedication = async (medicationData: Omit<PatientMedication, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase.functions.invoke<any>("add_patient_medication", {
        body: { 
          p_patient_id: patientId,
          p_medication_id: medicationData.medication_id,
          p_dosage: medicationData.dosage,
          p_instructions: medicationData.instructions || null,
          p_start_date: medicationData.start_date,
          p_end_date: medicationData.end_date || null,
          p_notes: medicationData.notes || null
        }
      });

      if (error) throw error;
      
      // Refresh the medications list after adding
      fetchPatientMedications();
      toast.success('เพิ่มข้อมูลยาสำหรับผู้ป่วยเรียบร้อยแล้ว');
      return data;
    } catch (err: any) {
      console.error('Error adding patient medication:', err);
      toast.error('ไม่สามารถเพิ่มข้อมูลยาสำหรับผู้ป่วยได้');
      return null;
    }
  };

  const updatePatientMedication = async (
    id: string,
    medicationData: Partial<PatientMedication>
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke<any>("update_patient_medication", {
        body: {
          p_id: id,
          p_medication_id: medicationData.medication_id,
          p_dosage: medicationData.dosage,
          p_instructions: medicationData.instructions,
          p_start_date: medicationData.start_date,
          p_end_date: medicationData.end_date,
          p_notes: medicationData.notes
        }
      });

      if (error) throw error;
      
      // Refresh the medications list after updating
      fetchPatientMedications();
      toast.success('อัปเดตข้อมูลยาสำหรับผู้ป่วยเรียบร้อยแล้ว');
      return data;
    } catch (err: any) {
      console.error('Error updating patient medication:', err);
      toast.error('ไม่สามารถอัปเดตข้อมูลยาสำหรับผู้ป่วยได้');
      return null;
    }
  };

  const deletePatientMedication = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke<any>("delete_patient_medication", {
        body: { p_id: id }
      });

      if (error) throw error;

      // Refresh the medications list after deleting
      fetchPatientMedications();
      toast.success('ลบข้อมูลยาสำหรับผู้ป่วยเรียบร้อยแล้ว');
      return true;
    } catch (err: any) {
      console.error('Error deleting patient medication:', err);
      toast.error('ไม่สามารถลบข้อมูลยาสำหรับผู้ป่วยได้');
      return false;
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    if (patientId) {
      fetchPatientMedications();
    }
  }, [patientId]);

  // Function to speak medication instructions with enhanced Thai support
  const speakMedicationInstructions = (medication: PatientMedication) => {
    if (!medication || !medication.medication) {
      toast.error('ไม่พบข้อมูลยาที่จะอ่าน');
      return;
    }
    
    const text = `ยา${medication.medication.name} ขนาด ${medication.dosage} ${medication.medication.unit || ''} ${medication.instructions || ''}`;
    
    // Enhanced options for Thai voice
    speakText(text, {
      language: 'th-TH',
      rate: 0.8,  // Slightly slower for better Thai pronunciation
      pitch: 1.0,
      volume: 1.0
    }).catch(error => {
      console.error('Error speaking text:', error);
      toast.error('ไม่สามารถอ่านข้อมูลยาได้ กรุณาตรวจสอบการตั้งค่าเสียงของเบราว์เซอร์');
    });
  };

  return {
    medications,
    loading,
    error,
    fetchPatientMedications,
    addPatientMedication,
    updatePatientMedication,
    deletePatientMedication,
    speakMedicationInstructions
  };
};

// Remove the duplicate function outside the hook
