
import * as React from 'react';
import { createLogger } from '@/utils/logger';

const logger = createLogger('usePatientSelection');

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
    logger.debug('Resetting all patient selection state'); // Changed from console.log to logger.debug
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
    logger.info(`Selecting patient with ID: ${id}`); // Changed to info level
    const selectedPatient = patients.find(p => p.id === id);
    
    if (!selectedPatient) {
      logger.error('Selected patient not found!', { id, patients });
      return;
    }
    
    setPatientId(id);
    
    if (selectedPatient) {
      logger.debug('Patient found:', selectedPatient); // Changed from console.log to logger.debug
      setSelectedPatientName(selectedPatient.name);
      setSelectedPatientPhone(selectedPatient.phone || '');
      setSelectedPatientLineId(selectedPatient.line_id || '');
      logger.verbose(`Set name: ${selectedPatient.name}, phone: ${selectedPatient.phone}, lineId: ${selectedPatient.line_id || 'none'}`);
    } else {
      logger.warn('Selected patient not found in patients array');
    }
  };

  const updateFinalPatientInfo = (name: string, phone: string, lineId: string = '') => {
    logger.debug(`Updating final patient info - name: ${name}, phone: ${phone}, lineId: ${lineId}`);
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
