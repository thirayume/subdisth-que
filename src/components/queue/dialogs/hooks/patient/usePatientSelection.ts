
import * as React from 'react';
import { createLogger } from '@/utils/logger';
import { Patient } from '@/integrations/supabase/schema';
import { PatientSelectionState, PatientSelectionActions } from './types';

const logger = createLogger('usePatientSelection');

export const usePatientSelection = (): PatientSelectionState & PatientSelectionActions => {
  const [patientId, setPatientId] = React.useState('');
  const [newPatientName, setNewPatientName] = React.useState('');
  const [selectedPatientName, setSelectedPatientName] = React.useState('');
  const [selectedPatientPhone, setSelectedPatientPhone] = React.useState('');
  const [selectedPatientLineId, setSelectedPatientLineId] = React.useState('');
  const [finalPatientName, setFinalPatientName] = React.useState('');
  const [finalPatientPhone, setFinalPatientPhone] = React.useState('');
  const [finalPatientLineId, setFinalPatientLineId] = React.useState('');

  const resetPatientSelection = React.useCallback(() => {
    logger.debug('Resetting all patient selection state');
    setPatientId('');
    setNewPatientName('');
    setSelectedPatientName('');
    setSelectedPatientPhone('');
    setSelectedPatientLineId('');
    setFinalPatientName('');
    setFinalPatientPhone('');
    setFinalPatientLineId('');
  }, []);

  const handleSelectPatient = React.useCallback((id: string, patients: Patient[]) => {
    logger.info(`Selecting patient with ID: ${id}`);
    const selectedPatient = patients.find(p => p.id === id);
    
    if (!selectedPatient) {
      logger.error('Selected patient not found!', { id, patientCount: patients.length });
      return;
    }
    
    setPatientId(id);
    
    logger.debug('Patient found:', selectedPatient);
    setSelectedPatientName(selectedPatient.name);
    setSelectedPatientPhone(selectedPatient.phone || '');
    setSelectedPatientLineId(selectedPatient.line_id || '');
    logger.verbose(`Set name: ${selectedPatient.name}, phone: ${selectedPatient.phone}, lineId: ${selectedPatient.line_id || 'none'}`);
  }, []);

  const updateFinalPatientInfo = React.useCallback((name: string, phone: string, lineId: string = '') => {
    logger.debug(`Updating final patient info - name: ${name}, phone: ${phone}, lineId: ${lineId}`);
    setFinalPatientName(name);
    setFinalPatientPhone(phone);
    setFinalPatientLineId(lineId);
  }, []);

  return {
    patientId,
    setPatientId,
    newPatientName,
    setNewPatientName,
    selectedPatientName,
    selectedPatientPhone,
    selectedPatientLineId,
    finalPatientName,
    finalPatientPhone,
    finalPatientLineId,
    handleSelectPatient,
    updateFinalPatientInfo,
    resetPatientSelection
  };
};
