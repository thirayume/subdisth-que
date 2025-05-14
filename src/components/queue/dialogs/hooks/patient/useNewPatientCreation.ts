
import * as React from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import { NewPatientCreationState, NewPatientCreationActions, NewPatientCreationResult } from './types';

const logger = createLogger('useNewPatientCreation');

export const useNewPatientCreation = (): NewPatientCreationState & NewPatientCreationActions => {
  const [showNewPatientForm, setShowNewPatientForm] = React.useState(false);
  const [newPatientName, setNewPatientName] = React.useState('');

  const resetNewPatientCreation = React.useCallback(() => {
    setShowNewPatientForm(false);
    setNewPatientName('');
  }, []);

  const createNewPatient = React.useCallback(async (
    name: string,
    phoneNumber: string
  ): Promise<NewPatientCreationResult | null> => {
    logger.info(`Creating new patient - name: ${name}, phone: ${phoneNumber}`);
    
    try {
      // Generate a patient_id with format P + 4 digits
      const patientIdNum = Math.floor(1000 + Math.random() * 9000);
      const patient_id = `P${patientIdNum}`;
      logger.debug(`Generated patient_id: ${patient_id}`);
      
      logger.debug('Inserting patient into database');
      const { data: newPatientData, error } = await supabase
        .from('patients')
        .insert({
          name: name,
          phone: phoneNumber,
          patient_id: patient_id,
        })
        .select();
      
      if (error) {
        logger.error('Supabase error:', error);
        throw error;
      }
      
      if (newPatientData && newPatientData.length > 0) {
        logger.info('Patient created successfully:', newPatientData[0]);
        toast.success(`สร้างข้อมูลผู้ป่วยใหม่: ${name}`);
        return newPatientData[0] as NewPatientCreationResult;
      }
      
      logger.warn('No patient data returned after insert');
      return null;
    } catch (err) {
      logger.error('Error creating new patient:', err);
      toast.error('ไม่สามารถสร้างข้อมูลผู้ป่วยใหม่ได้');
      return null;
    }
  }, []);

  const handleAddNewPatient = React.useCallback(async (): Promise<NewPatientCreationResult | null> => {
    // This will be called from useCreateQueueHook with appropriate validation
    // The actual implementation is in createNewPatient which requires parameters
    return null;
  }, []);

  return {
    showNewPatientForm,
    setShowNewPatientForm,
    newPatientName,
    setNewPatientName,
    handleAddNewPatient,
    resetNewPatientCreation
  };
};
