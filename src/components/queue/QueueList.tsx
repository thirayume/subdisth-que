
import React from 'react';
import { cn } from '@/lib/utils';
import { Queue, Patient, QueueStatus } from '@/lib/mockData';
import QueueCard from './QueueCard';
import QueueControls from './QueueControls';

interface QueueListProps {
  queues: Queue[];
  patients: Patient[];
  title: string;
  emptyMessage?: string;
  className?: string;
  onUpdateStatus: (queueId: string, status: QueueStatus) => void;
  onCallQueue: (queueId: string) => void;
  onRecallQueue: (queueId: string) => void;
}

const QueueList: React.FC<QueueListProps> = ({
  queues,
  patients,
  title,
  emptyMessage = "ไม่มีคิวในขณะนี้",
  className,
  onUpdateStatus,
  onCallQueue,
  onRecallQueue,
}) => {
  // Function to find patient by ID
  const findPatient = (patientId: string): Patient => {
    return patients.find((p) => p.id === patientId) || patients[0];
  };

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      
      {queues.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queues.map((queue) => (
            <div key={queue.id} className="animate-fade-in">
              <QueueCard
                queue={queue}
                patient={findPatient(queue.patientId)}
              />
              <div className="mt-2 ml-1">
                <QueueControls
                  queue={queue}
                  onUpdateStatus={onUpdateStatus}
                  onCallQueue={onCallQueue}
                  onRecallQueue={onRecallQueue}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QueueList;
