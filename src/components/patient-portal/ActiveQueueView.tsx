
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Patient, Queue } from '@/integrations/supabase/schema';
import PatientProfile from '@/components/patient-portal/PatientProfile';
import PatientQueueStatus from '@/components/patient-portal/PatientQueueStatus';
import PatientMedications from '@/components/patient-portal/PatientMedications';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface ActiveQueueViewProps {
  patient: Patient;
  queue: Queue;
  patients: Patient[];
  onLogout: () => void;
  onSwitchPatient: () => void;
  onClearQueueHistory?: () => void; // Add this prop
}

const ActiveQueueView: React.FC<ActiveQueueViewProps> = ({ 
  patient, 
  queue, 
  patients, 
  onLogout, 
  onSwitchPatient,
  onClearQueueHistory
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Add a function to determine if the queue is likely outdated
  const isQueueOutdated = () => {
    // If queue is still WAITING or ACTIVE but created more than 24 hours ago
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const queueDate = new Date(queue.created_at);
    
    return queueDate < oneDayAgo && (queue.status === 'WAITING' || queue.status === 'ACTIVE');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-pharmacy-700`}>
          ระบบติดตามคิวผู้ป่วย
        </h1>
        <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={onLogout}>
          ออกจากระบบ
        </Button>
      </div>
      
      <PatientQueueStatus 
        queue={queue} 
        patient={patient} 
        className="mb-3 sm:mb-4" 
      />
      
      {isQueueOutdated() && onClearQueueHistory && (
        <Button 
          variant="outline" 
          onClick={onClearQueueHistory}
          className="mb-3 sm:mb-4 bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
        >
          คิวนี้อาจเป็นคิวเก่า - คลิกเพื่อล้างประวัติคิว
        </Button>
      )}
      
      <div className="flex justify-between items-center mb-2 sm:mb-4">
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-800`}>
          ข้อมูลผู้ป่วย
        </h2>
        {patients.length > 1 && (
          <Button variant="outline" size="sm" onClick={onSwitchPatient}>
            เลือกผู้ป่วยอื่น
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="profile" className="flex-1">
        <TabsList className="mb-3 sm:mb-4 grid grid-cols-2 w-full">
          <TabsTrigger value="profile" className={isMobile ? "text-sm py-1.5" : ""}>
            ข้อมูลส่วนตัว
          </TabsTrigger>
          <TabsTrigger value="medications" className={isMobile ? "text-sm py-1.5" : ""}>
            รายการยา
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <PatientProfile patient={patient} />
        </TabsContent>
        
        <TabsContent value="medications">
          <PatientMedications patientId={patient.id} />
        </TabsContent>
      </Tabs>
      
      {/* <div className="mt-4 sm:mt-6 text-center">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className={isMobile ? "text-sm" : ""}
        >
          กลับไปหน้าหลัก
        </Button>
      </div> */}
    </div>
  );
};

export default ActiveQueueView;
