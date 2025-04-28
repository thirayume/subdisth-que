
import * as React from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useNewPatientCreation = () => {
  const createNewPatient = async (
    newPatientName: string,
    phoneNumber: string
  ) => {
    console.log(`[useNewPatientCreation] Creating new patient - name: ${newPatientName}, phone: ${phoneNumber}`);
    
    try {
      // Generate a patient_id with format P + 4 digits
      const patientIdNum = Math.floor(1000 + Math.random() * 9000);
      const patient_id = `P${patientIdNum}`;
      console.log(`[useNewPatientCreation] Generated patient_id: ${patient_id}`);
      
      console.log('[useNewPatientCreation] Inserting patient into database');
      const { data: newPatientData, error } = await supabase
        .from('patients')
        .insert([{
          name: newPatientName,
          phone: phoneNumber,
          patient_id: patient_id,
        }])
        .select();
      
      if (error) {
        console.error('[useNewPatientCreation] Supabase error:', error);
        throw error;
      }
      
      if (newPatientData && newPatientData.length > 0) {
        console.log('[useNewPatientCreation] Patient created successfully:', newPatientData[0]);
        toast.success(`สร้างข้อมูลผู้ป่วยใหม่: ${newPatientName}`);
        return newPatientData[0];
      }
      
      console.warn('[useNewPatientCreation] No patient data returned after insert');
      return null;
    } catch (err) {
      console.error('[useNewPatientCreation] Error creating new patient:', err);
      toast.error('ไม่สามารถสร้างข้อมูลผู้ป่วยใหม่ได้');
      return null;
    }
  };

  return {
    createNewPatient
  };
};
