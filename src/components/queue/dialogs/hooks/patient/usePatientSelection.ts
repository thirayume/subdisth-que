
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
    console.log('[usePatientSelection] Resetting all patient selection state');
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
    console.log(`[usePatientSelection] Selecting patient with ID: ${id}`);
    const selectedPatient = patients.find(p => p.id === id);
    
    if (!selectedPatient) {
      console.error('[usePatientSelection] Selected patient not found!', { id, patients });
      return;
    }
    
    setPatientId(id);
    
    if (selectedPatient) {
      console.log('[usePatientSelection] Patient found:', selectedPatient);
      setSelectedPatientName(selectedPatient.name);
      setSelectedPatientPhone(selectedPatient.phone || '');
      setSelectedPatientLineId(selectedPatient.line_id || '');
      console.log(`[usePatientSelection] Set name: ${selectedPatient.name}, phone: ${selectedPatient.phone}, lineId: ${selectedPatient.line_id || 'none'}`);
    } else {
      console.warn('[usePatientSelection] Selected patient not found in patients array');
    }
  };

  const updateFinalPatientInfo = (name: string, phone: string, lineId: string = '') => {
    console.log(`[usePatientSelection] Updating final patient info - name: ${name}, phone: ${phone}, lineId: ${lineId}`);
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
