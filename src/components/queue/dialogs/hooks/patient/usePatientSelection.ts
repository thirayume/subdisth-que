
import * as React from 'react';

export const usePatientSelection = () => {
  const [patientId, setPatientId] = React.useState('');
  const [newPatientName, setNewPatientName] = React.useState('');
  const [selectedPatientName, setSelectedPatientName] = React.useState('');
  const [selectedPatientPhone, setSelectedPatientPhone] = React.useState('');
  const [selectedPatientLineId, setSelectedPatientLineId] = React.useState('');
  const [finalPatientName, setFinalPatientName] = React.useState('');
  const [finalPatientPhone, setFinalPatientPhone] = React.useState('');
  const [finalPatientLineId, setFinalPatientLineId] = React.useState('');

  const resetPatientSelection = () => {
    setPatientId('');
    setNewPatientName('');
    setSelectedPatientName('');
    setSelectedPatientPhone('');
    setSelectedPatientLineId('');
    setFinalPatientName('');
    setFinalPatientPhone('');
    setFinalPatientLineId('');
  };

  const handleSelectPatient = (id: string, patients: any[]) => {
    const selectedPatient = patients.find(p => p.id === id);
    setPatientId(id);
    
    if (selectedPatient) {
      setSelectedPatientName(selectedPatient.name);
      setSelectedPatientPhone(selectedPatient.phone || '');
      setSelectedPatientLineId(selectedPatient.line_id || '');
    }
  };

  const updateFinalPatientInfo = (name: string, phone: string, lineId: string = '') => {
    setFinalPatientName(name);
    setFinalPatientPhone(phone);
    setFinalPatientLineId(lineId);
  };

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
