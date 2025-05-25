
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle } from 'lucide-react';
import QueueCard from '@/components/queue/QueueCard';
import PatientInfoDialog from '@/components/pharmacy/PatientInfoDialog';
import { Patient } from '@/integrations/supabase/schema';
import { usePharmacyQueueData } from './usePharmacyQueueData';

interface PharmacyQueueTabsProps {
  servicePointId: string;
  refreshTrigger?: number;
}

const PharmacyQueueTabs: React.FC<PharmacyQueueTabsProps> = ({
  servicePointId,
  refreshTrigger = 0
}) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedQueueNumber, setSelectedQueueNumber] = useState<string>('');
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);

  const {
    queuesByStatus,
    getPatientName,
    handleCallQueue,
    handleUpdateStatus,
    handleRecallQueue,
    isLoading
  } = usePharmacyQueueData({ servicePointId, refreshTrigger });

  const handleViewPatientInfo = (queue: any) => {
    // This would need to fetch patient data based on queue.patient_id
    // For now, we'll use a mock patient object
    const mockPatient: Patient = {
      id: queue.patient_id,
      name: getPatientName(queue.patient_id),
      patient_id: `P${String(queue.number).padStart(4, '0')}`,
      phone: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setSelectedPatient(mockPatient);
    setSelectedQueueNumber(String(queue.number));
    setPatientDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">กำลังโหลดข้อมูลคิว...</div>
      </div>
    );
  }

  return (
    <>
      <Tabs defaultValue="waiting" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="waiting" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            รอคิว
            <Badge variant="secondary">{queuesByStatus.waiting.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            กำลังให้บริการ
            <Badge variant="secondary">{queuesByStatus.active.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            เสร็จสิ้น
            <Badge variant="secondary">{queuesByStatus.completed.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="waiting" className="space-y-4">
          {queuesByStatus.waiting.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ไม่มีคิวที่รอการให้บริการ
            </div>
          ) : (
            <div className="grid gap-4">
              {queuesByStatus.waiting.map((queue) => (
                <QueueCard
                  key={queue.id}
                  queue={queue}
                  patientName={getPatientName(queue.patient_id)}
                  onCall={() => handleCallQueue(queue.id)}
                  onSkip={() => handleUpdateStatus(queue.id, 'SKIPPED')}
                  isPharmacyInterface={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {queuesByStatus.active.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ไม่มีคิวที่กำลังให้บริการ
            </div>
          ) : (
            <div className="grid gap-4">
              {queuesByStatus.active.map((queue) => (
                <QueueCard
                  key={queue.id}
                  queue={queue}
                  patientName={getPatientName(queue.patient_id)}
                  onComplete={() => handleUpdateStatus(queue.id, 'COMPLETED')}
                  onSkip={() => handleUpdateStatus(queue.id, 'SKIPPED')}
                  onRecall={() => handleRecallQueue(queue.id)}
                  onViewPatientInfo={() => handleViewPatientInfo(queue)}
                  isPharmacyInterface={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {queuesByStatus.completed.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ไม่มีคิวที่เสร็จสิ้นแล้ว
            </div>
          ) : (
            <div className="grid gap-4">
              {queuesByStatus.completed.map((queue) => (
                <QueueCard
                  key={queue.id}
                  queue={queue}
                  patientName={getPatientName(queue.patient_id)}
                  onViewPatientInfo={() => handleViewPatientInfo(queue)}
                  isPharmacyInterface={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <PatientInfoDialog
        open={patientDialogOpen}
        onOpenChange={setPatientDialogOpen}
        patient={selectedPatient}
        queueNumber={selectedQueueNumber}
      />
    </>
  );
};

export default PharmacyQueueTabs;
