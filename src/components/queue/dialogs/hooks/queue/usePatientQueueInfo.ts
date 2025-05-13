
import * as React from 'react';
import { usePatientSearch } from '../patient/usePatientSearch';
import { usePatientSelection } from '../patient/usePatientSelection';
import { useNewPatientCreation } from '../patient/useNewPatientCreation';
import { toast } from 'sonner';

export const usePatientQueueInfo = () => {
  // First, declare all hooks at the top level
  const patientSearch = usePatientSearch();
  const patientSelection = usePatientSelection();
  const { createNewPatient } = useNewPatientCreation();
  
  // Then, extract values from the hooks
  const { 
    phoneNumber, 
    setPhoneNumber, 
    isSearching, 
    handlePhoneSearch: searchPatientsByPhone,
    matchedPatients: foundPatients,
    showNewPatientForm: showNewForm,
    setShowNewPatientForm,
    resetPatientSearch
  } = patientSearch;
  
  // Declare all state at the top level
  const [matchedPatients, setMatchedPatients] = React.useState<any[]>([]);
  const [localShowNewPatientForm, setLocalShowNewPatientForm] = React.useState(false);

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

  // Effects come after all hooks and state declarations
  React.useEffect(() => {
    setMatchedPatients(foundPatients || []);
    setLocalShowNewPatientForm(showNewForm);
  }, [foundPatients, showNewForm]);

  // Define all handlers after hooks and effects
  const handlePhoneSearch = React.useCallback(async () => {
    if (phoneNumber) {
      console.log('⭐ [usePatientQueueInfo] Searching for patients with phone:', phoneNumber);
      const patients = await searchPatientsByPhone();
      setMatchedPatients(patients || []);
      
      if (patients.length === 0) {
        setLocalShowNewPatientForm(true);
        setShowNewPatientForm(true);
      } else {
        setLocalShowNewPatientForm(false);
        setShowNewPatientForm(false);
      }
    } else {
      toast.error('กรุณากรอกเบอร์โทรศัพท์', { id: "phone-search" });
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
  }, [setShowNewPatientForm, setPatientId, selectPatientFromList, matchedPatients]);

  const resetAll = React.useCallback(() => {
    resetPatientSearch();
    resetPatientSelection();
    setMatchedPatients([]);
    setLocalShowNewPatientForm(false);
  }, [resetPatientSearch, resetPatientSelection]);

  // Return a memoized value to prevent unnecessary re-renders
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
