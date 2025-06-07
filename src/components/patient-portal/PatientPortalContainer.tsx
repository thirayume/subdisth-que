
import React from 'react';
import { usePatientPortalState } from '@/hooks/patient-portal/usePatientPortalState';
import { usePatientPortalActions } from '@/hooks/patient-portal/usePatientPortalActions';
import PatientPortalLoading from '@/components/patient-portal/PatientPortalLoading';
import PatientPortalAuth from '@/components/patient-portal/PatientPortalAuth';
import ActiveQueueView from '@/components/patient-portal/ActiveQueueView';
import PatientSelectionView from '@/components/patient-portal/PatientSelectionView';
import PatientQueueSelector from '@/components/patient-portal/PatientQueueSelector';

const PatientPortalContainer: React.FC = () => {
  const {
    isAuthenticated,
    loading,
    selectedPatient,
    patients,
    activeQueue,
    availableQueues,
    phoneNumber,
    isStaffMode,
    setIsAuthenticated,
    setSelectedPatient,
    setPatients,
    setActiveQueue,
    setAvailableQueues,
    setPhoneNumber,
    setIsStaffMode,
    checkForActiveQueues
  } = usePatientPortalState();

  const {
    handlePatientSelect,
    handleLineLoginSuccess,
    handlePatientFound,
    handleLogout,
    handleSwitchPatient,
    handleSwitchQueue,
    handleSelectQueue,
    handleClearQueueHistory
  } = usePatientPortalActions({
    patients,
    setSelectedPatient,
    setActiveQueue,
    setAvailableQueues,
    setIsAuthenticated,
    setIsStaffMode,
    setPhoneNumber,
    setPatients,
    checkForActiveQueues
  });

  if (loading) {
    return <PatientPortalLoading />;
  }

  if (!isAuthenticated) {
    return (
      <PatientPortalAuth 
        onLoginSuccess={handleLineLoginSuccess} 
        onPatientSelect={handlePatientFound}
      />
    );
  }

  // Show queue selector when multiple queues are available but none selected
  if (availableQueues.length > 1 && !activeQueue) {
    return (
      <PatientQueueSelector
        queues={availableQueues}
        patients={patients}
        onSelectQueue={handleSelectQueue}
        onLogout={handleLogout}
      />
    );
  }

  // Show active queue view when a queue is selected
  if (activeQueue && selectedPatient) {
    return (
      <ActiveQueueView
        patient={selectedPatient}
        queue={activeQueue}
        patients={patients}
        availableQueues={availableQueues}
        onLogout={handleLogout}
        onSwitchPatient={handleSwitchPatient}
        onSwitchQueue={availableQueues.length > 1 ? handleSwitchQueue : undefined}
        onClearQueueHistory={() => handleClearQueueHistory(selectedPatient)}
      />
    );
  }

  // Show patient selection view when no active queues
  return (
    <PatientSelectionView
      patients={patients}
      selectedPatient={selectedPatient}
      onSelectPatient={handlePatientSelect}
      onLogout={handleLogout}
      onClearQueueHistory={() => handleClearQueueHistory(selectedPatient)}
    />
  );
};

export default PatientPortalContainer;
