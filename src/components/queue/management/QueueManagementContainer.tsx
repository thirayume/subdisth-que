
import React from 'react';
import QueueManagementHeader from './QueueManagementHeader';
import QueueTabsContainer from './QueueTabsContainer';
import { useQueueManagement } from '@/hooks/queue/useQueueManagement';
import { useQueueRealtime } from '@/hooks/useQueueRealtime';

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
    isCancellingAll,
    handleRecallQueue,
    handleCallQueue,
    handleTransferQueue,
    handleHoldQueue,
    handleReturnToWaiting,
    handleServicePointChange,
    handleCancelAllQueues,
    updateQueueStatus,
    getIntelligentServicePointSuggestion
  } = useQueueManagement();

  // Add dedicated real-time updates for queue management
  useQueueRealtime({
    onQueueChange: React.useCallback(() => {
      // Force refresh of queue data when changes are detected
      window.location.reload();
    }, []),
    channelName: 'queue-management-realtime',
    enabled: true,
    debounceMs: 200
  });

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      <div className="flex items-center justify-between mb-4">
        <QueueManagementHeader 
          waitingQueuesCount={waitingQueues.length}
          onCancelAllQueues={handleCancelAllQueues}
          isCancellingAll={isCancellingAll}
        />
        
        {/* Remove service point selector from main management - now shows ALL queues */}
        <div className="text-sm text-gray-500">
          แสดงคิวทั้งหมด - ระบบจะแนะนำจุดบริการที่เหมาะสมอัตโนมัติ
        </div>
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
          getIntelligentServicePointSuggestion={getIntelligentServicePointSuggestion}
        />
      </div>
    </div>
  );
};

export default QueueManagementContainer;
