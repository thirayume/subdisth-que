
import * as React from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useNewPatientCreation');

export const useNewPatientCreation = () => {
  const createNewPatient = async (
    newPatientName: string,
    phoneNumber: string
  ) => {
    logger.info(`Creating new patient - name: ${newPatientName}, phone: ${phoneNumber}`);
    
    try {
      // Generate a patient_id with format P + 4 digits
      const patientIdNum = Math.floor(1000 + Math.random() * 9000);
      const patient_id = `P${patientIdNum}`;
      logger.debug(`Generated patient_id: ${patient_id}`);
      
      logger.debug('Inserting patient into database');
      const { data: newPatientData, error } = await supabase
        .from('patients')
        .insert({
          name: newPatientName,
          phone: phoneNumber,
          patient_id: patient_id,
          // Make sure we're only inserting fields that exist in the Patient schema
        })
        .select();
      
      if (error) {
        logger.error('Supabase error:', error);
        throw error;
      }
      
      if (newPatientData && newPatientData.length > 0) {
        logger.info('Patient created successfully:', newPatientData[0]);
        toast.success(`สร้างข้อมูลผู้ป่วยใหม่: ${newPatientName}`);
        return newPatientData[0];
      }
      
      logger.warn('No patient data returned after insert');
      return null;
    } catch (err) {
      logger.error('Error creating new patient:', err);
      toast.error('ไม่สามารถสร้างข้อมูลผู้ป่วยใหม่ได้');
      return null;
    }
  };

  return {
    createNewPatient
  };
};
