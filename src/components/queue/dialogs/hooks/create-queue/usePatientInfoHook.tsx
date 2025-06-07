
import * as React from 'react';
import { createLogger } from '@/utils/logger';
import { usePatientSearch, usePatientSelection, useNewPatientCreation } from '../patient';
import { PatientInfo } from './types';

const logger = createLogger('usePatientInfoHook');

export const usePatientInfoHook = (): {
  patientSearchState: ReturnType<typeof usePatientSearch>;
  patientSelectionState: ReturnType<typeof usePatientSelection>;
  newPatientCreationState: ReturnType<typeof useNewPatientCreation>;
  patientInfo: PatientInfo;
  handleSelectPatient: (id: string) => void;
  resetPatientState: () => void;
} => {
  // Patient search & selection state
  const patientSearchState = usePatientSearch();
  const {
    phoneNumber,
    setPhoneNumber,
    showNewPatientForm: searchShowNewPatientForm,
    setShowNewPatientForm,
    matchedPatients,
    resetPatientSearch
  } = patientSearchState;

  // Patient selection state
  const patientSelectionState = usePatientSelection();
  const {
    patientId,
    setPatientId,
    patientName,
    setPatientName,
    patientPhone, 
    setPatientPhone,
    lineId,
    setLineId,
    handleSelectPatient: selectPatient,
    resetPatientSelection
  } = patientSelectionState;

  // New patient state
  const newPatientCreationState = useNewPatientCreation();
  const {
    showNewPatientForm: newPatientFormVisible,
    setShowNewPatientForm: setNewPatientFormVisible,
    newPatientName,
    setNewPatientName,
    resetNewPatientCreation
  } = newPatientCreationState;

  // Create the final values for the patient information
  const finalPatientName = patientName || newPatientName;
  const finalPatientPhone = patientPhone || phoneNumber;
  const finalPatientLineId = lineId || '';

  // Sync up the showNewPatientForm state between the two hooks
  React.useEffect(() => {
    setNewPatientFormVisible(searchShowNewPatientForm);
  }, [searchShowNewPatientForm, setNewPatientFormVisible]);

  const handleSelectPatient = React.useCallback((id: string) => {
    logger.verbose(`Selecting patient with ID: ${id}`);
    selectPatient(id, matchedPatients);
  }, [selectPatient, matchedPatients]);

  // Enhanced reset function that clears everything
  const resetPatientState = React.useCallback(() => {
    logger.debug('Resetting patient state completely');
    
    // Reset search state
    resetPatientSearch();
    
    // Reset selection state  
    resetPatientSelection();
    
    // Reset new patient state
    resetNewPatientCreation();
    
    // Additional manual resets to ensure clean state
    setPhoneNumber('');
    setPatientId('');
    setPatientName('');
    setPatientPhone('');
    setLineId('');
    setShowNewPatientForm(false);
    setNewPatientName('');
  }, [
    resetPatientSearch,
    resetPatientSelection, 
    resetNewPatientCreation,
    setPhoneNumber, 
    setPatientId, 
    setPatientName, 
    setPatientPhone, 
    setLineId,
    setShowNewPatientForm, 
    setNewPatientName
  ]);

  const patientInfo: PatientInfo = {
    patientId,
    patientName,
    patientPhone,
    lineId,
    newPatientName,
    finalPatientName,
    finalPatientPhone,
    finalPatientLineId
  };

  return {
    patientSearchState,
    patientSelectionState,
    newPatientCreationState,
    patientInfo,
    handleSelectPatient,
    resetPatientState
  };
};
