
import * as React from 'react';
import { usePatientSearch } from '../patient/usePatientSearch';
import { usePatientSelection } from '../patient/usePatientSelection';
import { useNewPatientCreation } from '../patient/useNewPatientCreation';
import { toast } from 'sonner';

export const usePatientQueueInfo = () => {
  // First, declare all hooks unconditionally at the top level
  const patientSearch = usePatientSearch();
  const patientSelection = usePatientSelection();
  const patientCreation = useNewPatientCreation();
  
  // Now, declare all state variables
  const [matchedPatients, setMatchedPatients] = React.useState<any[]>([]);
  const [localShowNewPatientForm, setLocalShowNewPatientForm] = React.useState(false);
  
  // Extract values from hooks using destructuring
  const { 
    phoneNumber, 
    setPhoneNumber, 
    isSearching, 
    handlePhoneSearch: searchPatientsByPhone,
    matchedPatients: foundPatients,
    showNewPatientForm: searchShowNewPatientForm,
    setShowNewPatientForm,
    resetPatientSearch
  } = patientSearch;
  
  const {
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
    handleSelectPatient: selectPatientFromList,
    updateFinalPatientInfo,
    resetPatientSelection
  } = patientSelection;

  const {
    createNewPatient
  } = patientCreation;
  
  // Effects come after hook declarations and state definitions
  React.useEffect(() => {
    if (foundPatients) {
      setMatchedPatients(foundPatients);
    }
  }, [foundPatients]);
  
  React.useEffect(() => {
    setLocalShowNewPatientForm(searchShowNewPatientForm);
  }, [searchShowNewPatientForm]);

  // Define all handlers with useCallback
  const handlePhoneSearch = React.useCallback(async () => {
    if (phoneNumber) {
      console.log('⭐ [usePatientQueueInfo] Searching for patients with phone:', phoneNumber);
      const patients = await searchPatientsByPhone();
      if (patients) {
        setMatchedPatients(patients);
      }
      
      if (!patients || patients.length === 0) {
        setLocalShowNewPatientForm(true);
        setShowNewPatientForm(true);
      } else {
        setLocalShowNewPatientForm(false);
        setShowNewPatientForm(false);
      }
      return patients || [];
    } else {
      toast.error('กรุณากรอกเบอร์โทรศัพท์');
      return [];
    }
  }, [phoneNumber, searchPatientsByPhone, setShowNewPatientForm]);

  const handleAddNewPatient = React.useCallback(() => {
    setLocalShowNewPatientForm(true);
    setShowNewPatientForm(true);
    setPatientId('');
  }, [setShowNewPatientForm, setPatientId]);

  const handleSelectPatient = React.useCallback((id: string) => {
    setLocalShowNewPatientForm(false);
    setShowNewPatientForm(false);
    setPatientId(id);
    selectPatientFromList(id, matchedPatients);
  }, [matchedPatients, selectPatientFromList, setPatientId, setShowNewPatientForm]);

  const resetAll = React.useCallback(() => {
    resetPatientSearch();
    resetPatientSelection();
    setMatchedPatients([]);
    setLocalShowNewPatientForm(false);
  }, [resetPatientSearch, resetPatientSelection]);

  // Return a memoized object to prevent unnecessary re-renders
  return React.useMemo(() => ({
    phoneNumber,
    setPhoneNumber,
    isSearching,
    matchedPatients,
    showNewPatientForm: localShowNewPatientForm,
    newPatientName,
    setNewPatientName,
    patientId,
    selectedPatientName,
    selectedPatientPhone,
    selectedPatientLineId,
    finalPatientName,
    finalPatientPhone,
    finalPatientLineId,
    handlePhoneSearch,
    handleAddNewPatient,
    handleSelectPatient,
    createNewPatient,
    updateFinalPatientInfo,
    resetAll
  }), [
    phoneNumber,
    setPhoneNumber,
    isSearching,
    matchedPatients,
    localShowNewPatientForm,
    newPatientName,
    setNewPatientName,
    patientId,
    selectedPatientName,
    selectedPatientPhone,
    selectedPatientLineId,
    finalPatientName,
    finalPatientPhone,
    finalPatientLineId,
    handlePhoneSearch,
    handleAddNewPatient,
    handleSelectPatient,
    createNewPatient,
    updateFinalPatientInfo,
    resetAll
  ]);
};
