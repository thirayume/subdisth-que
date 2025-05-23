
import React from 'react';
import QueueManagementHeader from './QueueManagementHeader';
import QueueTabsContainer from './QueueTabsContainer';
import ServicePointSelector from './ServicePointSelector';
import { useQueueManagement } from '@/hooks/queue/useQueueManagement';

const QueueManagementContainer: React.FC = () => {
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
    handleServicePointChange,
    updateQueueStatus
  } = useQueueManagement();

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      <div className="flex items-center justify-between mb-4">
        <QueueManagementHeader />
        
        <ServicePointSelector
          selectedServicePoint={selectedServicePoint}
          servicePoints={servicePoints}
          onServicePointChange={handleServicePointChange}
        />
      </div>
      
      <div className="flex-1 overflow-hidden">
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
          selectedServicePoint={selectedServicePoint}
          servicePoints={servicePoints}
        />
      </div>
    </div>
  );
};

export default QueueManagementContainer;
