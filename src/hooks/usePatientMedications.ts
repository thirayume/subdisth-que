
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  const fetchPatientMedications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use raw SQL query to fetch data instead of table name that might not be in the types
      const { data, error: queryError } = await supabase
        .rpc('get_patient_medications', { p_patient_id: patientId });

      if (queryError) throw queryError;
      
      setMedications(data || []);
    } catch (err: any) {
      console.error('Error fetching patient medications:', err);
      setError(err.message);
      toast.error('ไม่สามารถดึงข้อมูลยาของผู้ป่วยได้');
    } finally {
      setLoading(false);
    }
  };

  const addPatientMedication = async (medicationData: Partial<PatientMedication>) => {
    try {
      // Use raw SQL query to insert data
      const { data, error } = await supabase
        .rpc('add_patient_medication', { 
          p_patient_id: patientId,
          p_medication_id: medicationData.medication_id,
          p_dosage: medicationData.dosage,
          p_instructions: medicationData.instructions,
          p_start_date: medicationData.start_date,
          p_end_date: medicationData.end_date,
          p_notes: medicationData.notes
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
      // Use raw SQL query to update data
      const { data, error } = await supabase
        .rpc('update_patient_medication', {
          p_id: id,
          p_medication_id: medicationData.medication_id,
          p_dosage: medicationData.dosage,
          p_instructions: medicationData.instructions,
          p_start_date: medicationData.start_date,
          p_end_date: medicationData.end_date,
          p_notes: medicationData.notes
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
      // Use raw SQL query to delete data
      const { error } = await supabase
        .rpc('delete_patient_medication', { p_id: id });

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
    fetchPatientMedications();
  }, [patientId]);

  return {
    medications,
    loading,
    error,
    fetchPatientMedications,
    addPatientMedication,
    updatePatientMedication,
    deletePatientMedication
  };
};
