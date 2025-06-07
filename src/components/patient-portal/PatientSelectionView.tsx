
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { Patient } from '@/integrations/supabase/schema';
import { usePatientQueues } from '@/hooks/patient-portal/usePatientQueues';
import PatientSelectionHeader from './PatientSelectionHeader';
import PatientList from './PatientList';
import SelectedPatientInfo from './SelectedPatientInfo';

interface PatientSelectionViewProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  onLogout: () => void;
  onClearQueueHistory?: () => void;
}

const PatientSelectionView: React.FC<PatientSelectionViewProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  onLogout,
  onClearQueueHistory
}) => {
  const {
    patientQueues,
    loading,
    cancellingQueue,
    handleCancelQueue
  } = usePatientQueues({ patients });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-2 sm:p-4">
      <PatientSelectionHeader onLogout={onLogout} />
      
      <Card className="mb-3 sm:mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            เลือกผู้ป่วย
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PatientList
            patients={patients}
            selectedPatient={selectedPatient}
            patientQueues={patientQueues}
            loading={loading}
            cancellingQueue={cancellingQueue}
            onSelectPatient={onSelectPatient}
            onCancelQueue={handleCancelQueue}
          />
        </CardContent>
      </Card>
      
      {selectedPatient && (
        <SelectedPatientInfo
          patient={selectedPatient}
          onClearQueueHistory={onClearQueueHistory}
        />
      )}
    </div>
  );
};

export default PatientSelectionView;
