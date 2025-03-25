
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Patient, Queue } from '@/integrations/supabase/schema';
import PatientProfile from '@/components/patient-portal/PatientProfile';
import PatientQueueStatus from '@/components/patient-portal/PatientQueueStatus';
import PatientMedications from '@/components/patient-portal/PatientMedications';
import { useNavigate } from 'react-router-dom';

interface ActiveQueueViewProps {
  patient: Patient;
  queue: Queue;
  patients: Patient[];
  onLogout: () => void;
  onSwitchPatient: () => void;
}

const ActiveQueueView: React.FC<ActiveQueueViewProps> = ({ 
  patient, 
  queue, 
  patients, 
  onLogout, 
  onSwitchPatient 
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-pharmacy-700">ระบบติดตามคิวผู้ป่วย</h1>
        <Button variant="outline" size="sm" onClick={onLogout}>
          ออกจากระบบ
        </Button>
      </div>
      
      <PatientQueueStatus 
        queue={queue} 
        patient={patient} 
        className="mb-4" 
      />
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">ข้อมูลผู้ป่วย</h2>
        {patients.length > 1 && (
          <Button variant="outline" size="sm" onClick={onSwitchPatient}>
            เลือกผู้ป่วยอื่น
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">ข้อมูลส่วนตัว</TabsTrigger>
          <TabsTrigger value="medications">รายการยา</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <PatientProfile patient={patient} />
        </TabsContent>
        
        <TabsContent value="medications">
          <PatientMedications patientId={patient.id} />
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 text-center">
        <Button variant="outline" onClick={() => navigate('/')}>
          กลับไปหน้าหลัก
        </Button>
      </div>
    </div>
  );
};

export default ActiveQueueView;
