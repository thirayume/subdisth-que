
import React from 'react';
import { useQueueManagement } from '@/hooks/queue/useQueueManagement';
import QueueTabsContainer from '@/components/queue/management/QueueTabsContainer';
import QueueTransferDialogContainer from '@/components/queue/management/QueueTransferDialogContainer';
import { useQueueTransferDialog } from '@/components/queue/transfer/useQueueTransfer';

interface PharmacyQueueTabsProps {
  servicePointId?: string;
  refreshTrigger: number;
}

const PharmacyQueueTabs: React.FC<PharmacyQueueTabsProps> = ({
  servicePointId,
  refreshTrigger
}) => {
  const {
    waitingQueues,
    activeQueues,
    completedQueues,
    skippedQueues,
    patients,
    queueTypes,
    selectedServicePoint,
    servicePoints,
    handleRecallQueue,
    handleCallQueue,
    handleTransferQueue,
    handleHoldQueue,
    handleReturnToWaiting,
    updateQueueStatus,
    getIntelligentServicePointSuggestion
  } = useQueueManagement();

  const {
    transferDialogOpen,
    queueToTransfer,
    openTransferDialog,
    closeTransferDialog
  } = useQueueTransferDialog();

  // Handler for opening transfer dialog
  const handleTransferQueueClick = (queueId: string) => {
    const queue = [...waitingQueues, ...activeQueues, ...completedQueues, ...skippedQueues]
      .find(q => q.id === queueId);
    if (queue) {
      openTransferDialog(queue);
    }
  };

  // Handler for patient info (can be implemented later)
  const handleViewPatientInfo = (patientId: string) => {
    console.log('View patient info:', patientId);
    // TODO: Implement patient info dialog
  };

  return (
    <>
      <QueueTabsContainer
        waitingQueues={waitingQueues}
        activeQueues={activeQueues}
        completedQueues={completedQueues}
        skippedQueues={skippedQueues}
        patients={patients}
        queueTypes={queueTypes}
        onUpdateStatus={updateQueueStatus}
        onCallQueue={handleCallQueue}
        onRecallQueue={handleRecallQueue}
        onTransferQueue={handleTransferQueue}
        onHoldQueue={handleHoldQueue}
        onReturnToWaiting={handleReturnToWaiting}
        onViewPatientInfo={handleViewPatientInfo}
        selectedServicePoint={selectedServicePoint}
        servicePoints={servicePoints}
        getIntelligentServicePointSuggestion={getIntelligentServicePointSuggestion}
        onTransferQueueClick={handleTransferQueueClick}
        isPharmacyInterface={true}
      />

      <QueueTransferDialogContainer
        queueToTransfer={queueToTransfer}
        transferDialogOpen={transferDialogOpen}
        onOpenChange={closeTransferDialog}
        servicePoints={servicePoints}
        queueTypes={queueTypes}
        onTransfer={handleTransferQueue}
      />
    </>
  );
};

export default PharmacyQueueTabs;
