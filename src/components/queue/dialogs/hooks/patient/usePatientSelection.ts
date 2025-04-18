
import { useState } from 'react';

export const usePatientSelection = () => {
  const [patientId, setPatientId] = useState('');
  const [newPatientName, setNewPatientName] = useState('');
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [selectedPatientPhone, setSelectedPatientPhone] = useState('');
  const [finalPatientName, setFinalPatientName] = useState('');
  const [finalPatientPhone, setFinalPatientPhone] = useState('');

  const resetPatientSelection = () => {
    setPatientId('');
    setNewPatientName('');
    setSelectedPatientName('');
    setSelectedPatientPhone('');
    setFinalPatientName('');
    setFinalPatientPhone('');
  };

  const handleSelectPatient = (id: string, patients: any[]) => {
    const selectedPatient = patients.find(p => p.id === id);
    setPatientId(id);
    
    if (selectedPatient) {
      setSelectedPatientName(selectedPatient.name);
      setSelectedPatientPhone(selectedPatient.phone || '');
    }
  };

  const updateFinalPatientInfo = (name: string, phone: string) => {
    setFinalPatientName(name);
    setFinalPatientPhone(phone);
  };

  return {
    patientId,
    setPatientId,
    newPatientName,
    setNewPatientName,
    selectedPatientName,
    selectedPatientPhone,
    finalPatientName,
    finalPatientPhone,
    handleSelectPatient,
    updateFinalPatientInfo,
    resetPatientSelection
  };
};
