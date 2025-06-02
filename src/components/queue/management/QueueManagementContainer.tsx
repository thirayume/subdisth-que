
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
    <div className="h-full flex flex-col bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <QueueManagementHeader 
              waitingQueuesCount={waitingQueues.length}
              onCancelAllQueues={handleCancelAllQueues}
              isCancellingAll={isCancellingAll}
            />
          </div>
          
          {/* Enhanced Service Point Info */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>แสดงคิวทั้งหมด</span>
            </div>
            <span className="text-gray-400">•</span>
            <span>ระบบจะแนะนำจุดบริการที่เหมาะสมอัตโนมัติ</span>
          </div>
        </div>
      </div>
      
      {/* Enhanced Content Area */}
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
