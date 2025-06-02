
import React, { useState } from 'react';
import { Queue, QueueStatus, ServicePoint } from '@/integrations/supabase/schema';
import QueueCard from './QueueCard';
import ServicePointQueueSelector from './ServicePointQueueSelector';

interface QueueListProps {
  queues: Queue[];
  getPatientName: (patientId: string) => string;
  status: QueueStatus;
  onUpdateStatus?: (queueId: string, status: QueueStatus) => Promise<Queue | null>;
  onCallQueue?: (queueId: string, manualServicePointId?: string) => Promise<Queue | null>;
  onRecallQueue?: (queueId: string) => void;
  onTransferQueue?: (queueId: string) => void;
  onHoldQueue?: (queueId: string) => void;
  onReturnToWaiting?: (queueId: string) => void;
  selectedServicePoint?: ServicePoint | null;
  servicePoints?: ServicePoint[];
  getIntelligentServicePointSuggestion?: (queue: Queue) => ServicePoint | null;
  showServicePointInfo?: boolean;
}

const QueueList: React.FC<QueueListProps> = ({
  queues,
  getPatientName,
  status,
  onUpdateStatus,
  onCallQueue,
  onRecallQueue,
  onTransferQueue,
  onHoldQueue,
  onReturnToWaiting,
  selectedServicePoint,
  servicePoints = [],
  getIntelligentServicePointSuggestion,
  showServicePointInfo = true
}) => {
  const [selectorQueue, setSelectorQueue] = useState<Queue | null>(null);
  const [suggestedServicePoint, setSuggestedServicePoint] = useState<ServicePoint | null>(null);

  // Show empty state if no queues
  if (queues.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-300 rounded opacity-50"></div>
          </div>
          <p className="text-gray-500 mb-2 font-medium">ไม่มีคิวในสถานะนี้</p>
          {status === 'WAITING' && (
            <p className="text-sm text-gray-400">
              ไม่พบคิวที่รอดำเนินการ
            </p>
          )}
          {status === 'ACTIVE' && (
            <p className="text-sm text-gray-400">
              ไม่มีคิวที่กำลังให้บริการ
            </p>
          )}
          {status === 'COMPLETED' && (
            <p className="text-sm text-gray-400">
              ไม่มีคิวที่เสร็จสิ้นแล้ว
            </p>
          )}
          {status === 'SKIPPED' && (
            <p className="text-sm text-gray-400">
              ไม่มีคิวที่ถูกข้าม
            </p>
          )}
        </div>
      </div>
    );
  }

  const handleCallQueue = async (queue: Queue) => {
    // If queue already has service point or if we're in a service point view, call directly
    if (queue.service_point_id || selectedServicePoint) {
      return onCallQueue?.(queue.id);
    }

    // If we're in global management and queue has no service point, show selector
    if (getIntelligentServicePointSuggestion && servicePoints.length > 0) {
      const suggestion = getIntelligentServicePointSuggestion(queue);
      setSuggestedServicePoint(suggestion);
      setSelectorQueue(queue);
    } else {
      // Fallback to direct call
      return onCallQueue?.(queue.id);
    }
  };

  const handleServicePointConfirm = async (servicePointId: string) => {
    if (selectorQueue && onCallQueue) {
      await onCallQueue(selectorQueue.id, servicePointId);
      setSelectorQueue(null);
      setSuggestedServicePoint(null);
    }
  };

  const handleSelectorClose = () => {
    setSelectorQueue(null);
    setSuggestedServicePoint(null);
  };

  return (
    <>
      <div className="h-full overflow-auto">
        <div className="space-y-3 p-6">
          {queues.map(queue => {
            // Get current service point for this queue
            const currentServicePoint = queue.service_point_id 
              ? servicePoints.find(sp => sp.id === queue.service_point_id)
              : null;
              
            // Get intelligent suggestion for unassigned queues
            const suggestedServicePoint = !currentServicePoint && getIntelligentServicePointSuggestion
              ? getIntelligentServicePointSuggestion(queue)
              : null;

            return (
              <QueueCard
                key={queue.id}
                queue={queue}
                patientName={getPatientName(queue.patient_id)}
                onComplete={
                  onUpdateStatus && status !== 'COMPLETED'
                    ? () => onUpdateStatus(queue.id, 'COMPLETED')
                    : undefined
                }
                onSkip={
                  onUpdateStatus && status === 'WAITING'
                    ? () => onUpdateStatus(queue.id, 'SKIPPED')
                    : undefined
                }
                onCall={
                  onCallQueue && status === 'WAITING'
                    ? () => handleCallQueue(queue)
                    : undefined
                }
                onRecall={
                  onRecallQueue && status === 'ACTIVE'
                    ? () => onRecallQueue(queue.id)
                    : undefined
                }
                onTransfer={
                  onTransferQueue && status === 'ACTIVE'
                    ? () => onTransferQueue(queue.id)
                    : undefined
                }
                onHold={
                  onHoldQueue && status === 'ACTIVE'
                    ? () => onHoldQueue(queue.id)
                    : undefined
                }
                onReturnToWaiting={
                  onReturnToWaiting && status === 'SKIPPED'
                    ? () => onReturnToWaiting(queue.id)
                    : undefined
                }
                servicePointId={queue.service_point_id}
                servicePointName={currentServicePoint?.name}
                suggestedServicePointName={suggestedServicePoint?.name}
                showServicePointInfo={showServicePointInfo}
              />
            );
          })}
        </div>
      </div>

      {/* Service Point Selector Dialog */}
      {selectorQueue && (
        <ServicePointQueueSelector
          isOpen={true}
          onClose={handleSelectorClose}
          onConfirm={handleServicePointConfirm}
          queue={selectorQueue}
          servicePoints={servicePoints}
          suggestedServicePoint={suggestedServicePoint}
        />
      )}
    </>
  );
};

export default QueueList;
