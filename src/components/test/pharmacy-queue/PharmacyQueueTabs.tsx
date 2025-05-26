
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePharmacyQueueData } from './usePharmacyQueueData';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Users, Pause, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatQueueNumber } from '@/utils/queueFormatters';
import QueueCard from '@/components/queue/QueueCard';
import PatientInfoDialog from '@/components/pharmacy/PatientInfoDialog';
import QueueTransferDialog from './QueueTransferDialog';

interface PharmacyQueueTabsProps {
  servicePointId: string;
  refreshTrigger: number;
}

const PharmacyQueueTabs: React.FC<PharmacyQueueTabsProps> = ({
  servicePointId,
  refreshTrigger
}) => {
  const {
    queuesByStatus,
    getPatientName,
    getPatientData,
    handleCallQueue,
    handleUpdateStatus,
    handleRecallQueue,
    handleHoldQueue,
    handleTransferQueue,
    handleReturnToWaiting,
    handleManualRefresh,
    isLoading,
    servicePoints
  } = usePharmacyQueueData({ servicePointId, refreshTrigger });

  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferQueueId, setTransferQueueId] = useState<string>('');

  // Handle manual refresh when refreshTrigger changes
  React.useEffect(() => {
    if (refreshTrigger > 0) {
      handleManualRefresh();
    }
  }, [refreshTrigger, handleManualRefresh]);

  const handleViewPatientInfo = (queue: any) => {
    const patient = getPatientData(queue.patient_id);
    setSelectedPatient(patient);
    setPatientDialogOpen(true);
  };

  const handleTransferClick = (queueId: string) => {
    setTransferQueueId(queueId);
    setTransferDialogOpen(true);
  };

  const handleTransferConfirm = async (targetServicePointId: string) => {
    if (transferQueueId) {
      await handleTransferQueue(transferQueueId, targetServicePointId);
      setTransferDialogOpen(false);
      setTransferQueueId('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <>
      <Tabs defaultValue="waiting" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="waiting" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            รอ
            <Badge variant="secondary">{queuesByStatus.waiting.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            กำลังบริการ
            <Badge variant="secondary">{queuesByStatus.active.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="paused" className="flex items-center gap-2">
            <Pause className="w-4 h-4" />
            พัก
            <Badge variant="secondary">{queuesByStatus.paused.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="skipped" className="flex items-center gap-2">
            <SkipForward className="w-4 h-4" />
            ข้าม
            <Badge variant="secondary">{queuesByStatus.skipped.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            เสร็จสิ้น
            <Badge variant="secondary">{queuesByStatus.completed.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="waiting" className="space-y-2">
          {queuesByStatus.waiting.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ไม่มีคิวที่รอ
            </div>
          ) : (
            queuesByStatus.waiting.map((queue) => (
              <QueueCard
                key={queue.id}
                queue={queue}
                patientName={getPatientName(queue.patient_id)}
                onCall={() => handleCallQueue(queue.id)}
                onSkip={() => handleUpdateStatus(queue.id, 'SKIPPED')}
                onViewPatientInfo={() => handleViewPatientInfo(queue)}
                isPharmacyInterface={true}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-2">
          {queuesByStatus.active.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ไม่มีคิวที่กำลังบริการ
            </div>
          ) : (
            queuesByStatus.active.map((queue) => (
              <QueueCard
                key={queue.id}
                queue={queue}
                patientName={getPatientName(queue.patient_id)}
                onComplete={() => handleUpdateStatus(queue.id, 'COMPLETED')}
                onRecall={() => handleRecallQueue(queue.id)}
                onHold={() => handleHoldQueue(queue.id)}
                onTransfer={() => handleTransferClick(queue.id)}
                onViewPatientInfo={() => handleViewPatientInfo(queue)}
                isPharmacyInterface={true}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="paused" className="space-y-2">
          {queuesByStatus.paused.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ไม่มีคิวที่พัก
            </div>
          ) : (
            queuesByStatus.paused.map((queue) => (
              <QueueCard
                key={queue.id}
                queue={queue}
                patientName={getPatientName(queue.patient_id)}
                onCall={() => handleCallQueue(queue.id)}
                onViewPatientInfo={() => handleViewPatientInfo(queue)}
                isPharmacyInterface={true}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="skipped" className="space-y-2">
          {queuesByStatus.skipped.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ไม่มีคิวที่ข้าม
            </div>
          ) : (
            queuesByStatus.skipped.map((queue) => (
              <QueueCard
                key={queue.id}
                queue={queue}
                patientName={getPatientName(queue.patient_id)}
                onReturnToWaiting={() => handleReturnToWaiting(queue.id)}
                onViewPatientInfo={() => handleViewPatientInfo(queue)}
                isPharmacyInterface={true}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-2">
          {queuesByStatus.completed.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ไม่มีคิวที่เสร็จสิ้น
            </div>
          ) : (
            queuesByStatus.completed.slice(0, 10).map((queue) => (
              <QueueCard
                key={queue.id}
                queue={queue}
                patientName={getPatientName(queue.patient_id)}
                onReturnToWaiting={() => handleReturnToWaiting(queue.id)}
                onViewPatientInfo={() => handleViewPatientInfo(queue)}
                isPharmacyInterface={true}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Patient Info Dialog */}
      <PatientInfoDialog
        open={patientDialogOpen}
        onOpenChange={setPatientDialogOpen}
        patient={selectedPatient}
        queueNumber={selectedPatient ? formatQueueNumber('GENERAL', selectedPatient.number || 0) : undefined}
      />

      {/* Transfer Dialog */}
      <QueueTransferDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        onTransfer={handleTransferConfirm}
        servicePoints={servicePoints}
        currentServicePointId={servicePointId}
      />
    </>
  );
};

export default PharmacyQueueTabs;
