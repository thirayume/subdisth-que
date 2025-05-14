
import * as React from 'react';
import { createLogger } from '@/utils/logger';
import { Patient } from '@/integrations/supabase/schema';
import { PatientSelectionState, PatientSelectionActions } from './types';

const logger = createLogger('usePatientSelection');

export const usePatientSelection = (): PatientSelectionState & PatientSelectionActions => {
  const [patientId, setPatientId] = React.useState<string>('');
  const [patientName, setPatientName] = React.useState<string>('');
  const [patientPhone, setPatientPhone] = React.useState<string>('');
  const [lineId, setLineId] = React.useState<string>('');

  const handleSelectPatient = React.useCallback((id: string, patients?: Patient[]) => {
    logger.debug(`Selecting patient ID: ${id}`);
    setPatientId(id);
    
    if (patients && patients.length > 0) {
      const patient = patients.find(p => p.id === id);
      if (patient) {
        logger.debug(`Found patient:`, patient);
        setPatientName(patient.name || '');
        setPatientPhone(patient.phone || '');
        setLineId(patient.line_id || '');
      } else {
        logger.warn(`Patient with ID ${id} not found in the provided list`);
      }
    } else {
      logger.warn('No patients provided to select from');
    }
  }, []);

  const resetPatientSelection = React.useCallback(() => {
    logger.debug('Resetting patient selection state');
    setPatientId('');
    setPatientName('');
    setPatientPhone('');
    setLineId('');
  }, []);

  return {
    patientId,
    patientName,
    patientPhone,
    lineId,
    setPatientId,
    setPatientName,
    setPatientPhone,
    setLineId,
    handleSelectPatient,
    resetPatientSelection
  };
};
