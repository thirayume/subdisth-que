
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Queue, QueueStatus, QueueType, Patient } from '@/lib/mockData';
import { Clock, AlertCircle, CheckCircle, ArrowRightCircle } from 'lucide-react';

interface QueueCardProps {
  queue: Queue;
  patient: Patient;
  className?: string;
}

const QueueCard: React.FC<QueueCardProps> = ({ queue, patient, className }) => {
  const getStatusIcon = () => {
    switch (queue.status) {
      case QueueStatus.WAITING:
        return <Clock className="text-blue-500 h-5 w-5" />;
      case QueueStatus.ACTIVE:
        return <AlertCircle className="text-green-500 h-5 w-5 animate-pulse-gentle" />;
      case QueueStatus.COMPLETED:
        return <CheckCircle className="text-gray-500 h-5 w-5" />;
      case QueueStatus.SKIPPED:
        return <ArrowRightCircle className="text-amber-500 h-5 w-5" />;
      default:
        return <Clock className="text-blue-500 h-5 w-5" />;
    }
  };

  const getStatusClass = () => {
    switch (queue.status) {
      case QueueStatus.WAITING:
        return 'border-blue-200 bg-blue-50/50';
      case QueueStatus.ACTIVE:
        return 'border-green-200 bg-green-50/50 shadow-md';
      case QueueStatus.COMPLETED:
        return 'border-gray-200 bg-gray-50/50';
      case QueueStatus.SKIPPED:
        return 'border-amber-200 bg-amber-50/50';
      default:
        return 'border-blue-200 bg-blue-50/50';
    }
  };

  const getTypeLabel = () => {
    switch (queue.type) {
      case QueueType.GENERAL:
        return 'ทั่วไป';
      case QueueType.PRIORITY:
        return 'ด่วน';
      case QueueType.FOLLOW_UP:
        return 'ติดตามอาการ';
      case QueueType.ELDERLY:
        return 'ผู้สูงอายุ';
      default:
        return 'ทั่วไป';
    }
  };

  const getTypeClass = () => {
    switch (queue.type) {
      case QueueType.GENERAL:
        return 'bg-blue-100 text-blue-800';
      case QueueType.PRIORITY:
        return 'bg-red-100 text-red-800';
      case QueueType.FOLLOW_UP:
        return 'bg-purple-100 text-purple-800';
      case QueueType.ELDERLY:
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusLabel = () => {
    switch (queue.status) {
      case QueueStatus.WAITING:
        return 'รอเรียก';
      case QueueStatus.ACTIVE:
        return 'กำลังให้บริการ';
      case QueueStatus.COMPLETED:
        return 'เสร็จสิ้น';
      case QueueStatus.SKIPPED:
        return 'ข้าม';
      default:
        return 'รอเรียก';
    }
  };

  // Calculate waiting time
  const getWaitingTime = () => {
    const now = new Date();
    const created = new Date(queue.createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} นาที`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours} ชั่วโมง ${mins} นาที`;
    }
  };

  return (
    <Card 
      className={cn(
        'transition-all duration-300 overflow-hidden border-2',
        getStatusClass(),
        queue.status === QueueStatus.ACTIVE && 'scale-in',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className={cn("queue-badge", getTypeClass())}>{getTypeLabel()}</span>
              <span className={cn(
                "queue-badge",
                queue.status === QueueStatus.WAITING && "queue-badge-waiting",
                queue.status === QueueStatus.ACTIVE && "queue-badge-active",
                queue.status === QueueStatus.COMPLETED && "queue-badge-completed",
                queue.status === QueueStatus.SKIPPED && "queue-badge-skipped",
              )}>
                {getStatusLabel()}
              </span>
            </div>
            <div className="queue-number text-4xl font-bold mb-2 text-pharmacy-700">{queue.number}</div>
            <div className="font-medium text-gray-900">{patient.name}</div>
            <div className="text-sm text-gray-500">{patient.phone}</div>
          </div>

          <div className="flex flex-col items-end">
            {getStatusIcon()}
            <div className="text-xs text-gray-500 mt-2 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {getWaitingTime()}
            </div>
          </div>
        </div>
        
        {queue.notes && (
          <div className="mt-3 p-2 bg-amber-50 border border-amber-100 rounded-md text-sm text-amber-800">
            <span className="font-medium">หมายเหตุ:</span> {queue.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QueueCard;
