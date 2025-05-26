
import React, { useState } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { usePharmacyQueueData } from './usePharmacyQueueData';
import PharmacyQueueTabsList from './components/PharmacyQueueTabsList';
import PharmacyQueueTabContent from './components/PharmacyQueueTabContent';
import PharmacyQueueDialogs from './components/PharmacyQueueDialogs';

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
    handleCancelQueue,
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
        <PharmacyQueueTabsList queuesByStatus={queuesByStatus} />

        <PharmacyQueueTabContent
          value="waiting"
          queues={queuesByStatus.waiting}
          emptyMessage="ไม่มีคิวที่รอ"
          getPatientName={getPatientName}
          onViewPatientInfo={handleViewPatientInfo}
          onCallQueue={handleCallQueue}
          onUpdateStatus={handleUpdateStatus}
          onCancelQueue={handleCancelQueue}
        />

        <PharmacyQueueTabContent
          value="active"
          queues={queuesByStatus.active}
          emptyMessage="ไม่มีคิวที่กำลังบริการ"
          getPatientName={getPatientName}
          onViewPatientInfo={handleViewPatientInfo}
          onUpdateStatus={handleUpdateStatus}
          onRecallQueue={handleRecallQueue}
          onHoldQueue={handleHoldQueue}
          onTransferClick={handleTransferClick}
        />

        <PharmacyQueueTabContent
          value="paused"
          queues={queuesByStatus.paused}
          emptyMessage="ไม่มีคิวที่พัก"
          getPatientName={getPatientName}
          onViewPatientInfo={handleViewPatientInfo}
          onCallQueue={handleCallQueue}
        />

        <PharmacyQueueTabContent
          value="skipped"
          queues={queuesByStatus.skipped}
          emptyMessage="ไม่มีคิวที่ข้าม"
          getPatientName={getPatientName}
          onViewPatientInfo={handleViewPatientInfo}
          onReturnToWaiting={handleReturnToWaiting}
        />

        <PharmacyQueueTabContent
          value="completed"
          queues={queuesByStatus.completed}
          emptyMessage="ไม่มีคิวที่เสร็จสิ้น"
          getPatientName={getPatientName}
          onViewPatientInfo={handleViewPatientInfo}
          onReturnToWaiting={handleReturnToWaiting}
          isCompleted={true}
        />
      </Tabs>

      <PharmacyQueueDialogs
        selectedPatient={selectedPatient}
        patientDialogOpen={patientDialogOpen}
        setPatientDialogOpen={setPatientDialogOpen}
        transferDialogOpen={transferDialogOpen}
        setTransferDialogOpen={setTransferDialogOpen}
        onTransferConfirm={handleTransferConfirm}
        servicePoints={servicePoints}
        servicePointId={servicePointId}
      />
    </>
  );
};

export default PharmacyQueueTabs;
