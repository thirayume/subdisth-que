
import * as React from 'react';
import { usePatientsState } from './patients/usePatientsState';
import { usePatientsActions } from './patients/usePatientsActions';
import { usePatientsSearch } from './patients/usePatientsSearch';

export const usePatients = () => {
  const {
    patients,
    loading,
    error,
    fetchPatients,
    updatePatientsState
  } = usePatientsState();

  const {
    actionError,
    addPatient,
    updatePatient,
    deletePatient
  } = usePatientsActions(patients, updatePatientsState);

  const {
    searchLoading,
    searchError,
    searchPatients,
    findPatientByPhone
  } = usePatientsSearch();

  return {
    // State
    patients,
    loading,
    error: error || actionError || searchError,
    
    // Actions
    fetchPatients,
    addPatient,
    updatePatient,
    deletePatient,
    
    // Search
    searchPatients,
    findPatientByPhone,
    searchLoading
  };
};
