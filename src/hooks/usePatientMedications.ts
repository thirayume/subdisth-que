
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

      const { data, error } = await supabase
        .from('patient_medications')
        .select(`
          *,
          medication:medications (
            name,
            description,
            unit
          )
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

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
      const { data, error } = await supabase
        .from('patient_medications')
        .insert([{
          ...medicationData,
          patient_id: patientId
        }])
        .select(`
          *,
          medication:medications (
            name,
            description,
            unit
          )
        `)
        .single();

      if (error) throw error;

      setMedications(prev => [data, ...prev]);
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
      const { data, error } = await supabase
        .from('patient_medications')
        .update(medicationData)
        .eq('id', id)
        .select(`
          *,
          medication:medications (
            name,
            description,
            unit
          )
        `)
        .single();

      if (error) throw error;

      setMedications(prev =>
        prev.map(med => (med.id === id ? data : med))
      );
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
      const { error } = await supabase
        .from('patient_medications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMedications(prev => prev.filter(med => med.id !== id));
      toast.success('ลบข้อมูลยาสำหรับผู้ป่วยเรียบร้อยแล้ว');
      return true;
    } catch (err: any) {
      console.error('Error deleting patient medication:', err);
      toast.error('ไม่สามารถลบข้อมูลยาสำหรับผู้ป่วยได้');
      return false;
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchPatientMedications();

    // Subscribe to changes
    const channel = supabase
      .channel('patient-medications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patient_medications',
          filter: `patient_id=eq.${patientId}`
        },
        () => {
          fetchPatientMedications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
