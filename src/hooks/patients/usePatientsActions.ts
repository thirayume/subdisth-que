
import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/integrations/supabase/schema';
import { toast } from 'sonner';

export const usePatientsActions = (
  patients: Patient[],
  updatePatientsState: (patients: Patient[]) => void
) => {
  const [actionError, setActionError] = React.useState<string | null>(null);

  // Add a new patient
  const addPatient = async (patientData: Partial<Patient>) => {
    try {
      setActionError(null);
      
      // Generate a patient_id with format P + 4 digits
      const patientIdNum = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
      const patient_id = `P${patientIdNum}`;
      
      // Ensure required fields are present
      if (!patientData.name || !patientData.phone) {
        throw new Error('Name and phone are required fields');
      }
      
      const { data, error } = await supabase
        .from('patients')
        .insert([{ 
          ...patientData, 
          patient_id,
          name: patientData.name,
          phone: patientData.phone
        }])
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        updatePatientsState([data[0], ...patients]);
        toast.success(`เพิ่มข้อมูลผู้ป่วย ${patientData.name} เรียบร้อยแล้ว`);
        return data[0];
      }
    } catch (err: any) {
      console.error('Error adding patient:', err);
      setActionError(err.message || 'Failed to add patient');
      toast.error('ไม่สามารถเพิ่มข้อมูลผู้ป่วยได้');
      return null;
    }
  };

  // Update an existing patient
  const updatePatient = async (id: string, patientData: Partial<Patient>) => {
    try {
      setActionError(null);
      
      const { data, error } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const updatedPatients = patients.map(patient => 
          patient.id === id ? { ...patient, ...data[0] } : patient
        );
        updatePatientsState(updatedPatients);
        toast.success(`อัปเดตข้อมูลผู้ป่วย ${patientData.name} เรียบร้อยแล้ว`);
        return data[0];
      }
    } catch (err: any) {
      console.error('Error updating patient:', err);
      setActionError(err.message || 'Failed to update patient');
      toast.error('ไม่สามารถอัปเดตข้อมูลผู้ป่วยได้');
      return null;
    }
  };

  // Delete a patient
  const deletePatient = async (id: string) => {
    try {
      setActionError(null);
      
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      const filteredPatients = patients.filter(patient => patient.id !== id);
      updatePatientsState(filteredPatients);
      toast.success('ลบข้อมูลผู้ป่วยเรียบร้อยแล้ว');
      return true;
    } catch (err: any) {
      console.error('Error deleting patient:', err);
      setActionError(err.message || 'Failed to delete patient');
      toast.error('ไม่สามารถลบข้อมูลผู้ป่วยได้');
      return false;
    }
  };

  return {
    actionError,
    addPatient,
    updatePatient,
    deletePatient
  };
};
