
import React from 'react';
import { Queue, QueueStatus, ServicePoint, QueueType } from '@/integrations/supabase/schema';
import QueueCard from './QueueCard';

interface QueueListProps {
  queues: Queue[];
  getPatientName: (patientId: string) => string;
  status: QueueStatus;
  onUpdateStatus?: (queueId: string, status: QueueStatus) => Promise<Queue | null>;
  onCallQueue?: (queueId: string) => Promise<Queue | null>;
  onRecallQueue?: (queueId: string) => void;
  onTransferQueue?: (queueId: string) => void;
  onHoldQueue?: (queueId: string) => void;
  onReturnToWaiting?: (queueId: string) => void;
  selectedServicePoint?: ServicePoint | null;
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
  selectedServicePoint
}) => {
  // Show empty state if no queues
  if (queues.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <p className="text-gray-500 mb-2">ไม่มีคิวในสถานะนี้</p>
          {status === 'WAITING' && selectedServicePoint && (
            <p className="text-sm text-gray-400">
              ไม่พบคิวที่รอดำเนินการสำหรับจุดบริการ {selectedServicePoint.name}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {queues.map(queue => (
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
              ? () => onCallQueue(queue.id)
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
          servicePointName={
            queue.service_point_id && selectedServicePoint?.id === queue.service_point_id
              ? selectedServicePoint.name
              : undefined
          }
        />
      ))}
    </div>
  );
};

export default QueueList;
