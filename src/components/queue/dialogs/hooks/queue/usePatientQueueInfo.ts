
import * as React from 'react';
import { usePatientSearch } from '../patient/usePatientSearch';
import { usePatientSelection } from '../patient/usePatientSelection';
import { useNewPatientCreation } from '../patient/useNewPatientCreation';
import { toast } from 'sonner';

export const usePatientQueueInfo = () => {
  const { 
    phoneNumber, 
    setPhoneNumber, 
    isSearching, 
    handlePhoneSearch: searchPatientsByPhone,
    matchedPatients: foundPatients,
    showNewPatientForm: showNewForm,
    setShowNewPatientForm,
    resetPatientSearch
  } = usePatientSearch();
  
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
  } = usePatientSelection();

  const { createNewPatient } = useNewPatientCreation();

  React.useEffect(() => {
    setMatchedPatients(foundPatients || []);
    setLocalShowNewPatientForm(showNewForm);
  }, [foundPatients, showNewForm]);

  const handlePhoneSearch = async () => {
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
  };

  const handleAddNewPatient = () => {
    setLocalShowNewPatientForm(true);
    setShowNewPatientForm(true);
    setPatientId('');
  };

  const handleSelectPatient = (id: string) => {
    setLocalShowNewPatientForm(false);
    setShowNewPatientForm(false);
    setPatientId(id);
    selectPatientFromList(id, matchedPatients);
  };

  const resetAll = () => {
    resetPatientSearch();
    resetPatientSelection();
    setMatchedPatients([]);
    setLocalShowNewPatientForm(false);
  };

  return {
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
  };
};
