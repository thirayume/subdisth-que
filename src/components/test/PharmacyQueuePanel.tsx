
import React from 'react';
import PharmacyQueuePanelHeader from './pharmacy-queue/PharmacyQueuePanelHeader';
import PharmacyQueueTabs from './pharmacy-queue/PharmacyQueueTabs';
import { usePharmacyQueueData } from './pharmacy-queue/usePharmacyQueueData';

interface PharmacyQueuePanelProps {
  servicePointId: string;
  title: string;
  refreshTrigger?: number;
}

const PharmacyQueuePanel: React.FC<PharmacyQueuePanelProps> = React.memo(({
  servicePointId,
  title,
  refreshTrigger = 0
}) => {
  const {
    selectedServicePoint,
    queuesByStatus,
    getPatientName,
    handleCallQueue,
    handleUpdateStatus,
    handleRecallQueue,
    isLoading,
    servicePoints
  } = usePharmacyQueueData({ servicePointId, refreshTrigger });

  if (!selectedServicePoint) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm">ไม่พบจุดบริการ</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <PharmacyQueuePanelHeader
        title={title}
        servicePoint={selectedServicePoint}
        isLoading={isLoading}
        waitingCount={queuesByStatus.waiting.length}
        activeCount={queuesByStatus.active.length}
      />

      <div className="flex-1 overflow-hidden">
        <PharmacyQueueTabs
          waitingQueues={queuesByStatus.waiting}
          activeQueues={queuesByStatus.active}
          completedQueues={queuesByStatus.completed}
          getPatientName={getPatientName}
          onUpdateStatus={handleUpdateStatus}
          onCallQueue={handleCallQueue}
          onRecallQueue={handleRecallQueue}
          selectedServicePoint={selectedServicePoint}
          servicePoints={servicePoints}
        />
      </div>
    </div>
  );
});

PharmacyQueuePanel.displayName = 'PharmacyQueuePanel';

export default PharmacyQueuePanel;
