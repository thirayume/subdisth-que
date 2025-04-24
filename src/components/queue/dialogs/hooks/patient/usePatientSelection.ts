
import * as React from 'react';

export const usePatientSelection = () => {
  const [patientId, setPatientId] = React.useState('');
  const [newPatientName, setNewPatientName] = React.useState('');
  const [selectedPatientName, setSelectedPatientName] = React.useState('');
  const [selectedPatientPhone, setSelectedPatientPhone] = React.useState('');
  const [finalPatientName, setFinalPatientName] = React.useState('');
  const [finalPatientPhone, setFinalPatientPhone] = React.useState('');

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
