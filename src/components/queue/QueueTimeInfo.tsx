
import React from 'react';
import { calculateWaitingTime, calculateServiceTime } from '@/utils/queueFormatters';
import { Clock } from 'lucide-react';

interface QueueTimeInfoProps {
  createdAt: string;
  calledAt?: string;
  completedAt?: string;
  showWaiting?: boolean;
  showService?: boolean;
  className?: string;
}

const QueueTimeInfo: React.FC<QueueTimeInfoProps> = ({
  createdAt,
  calledAt,
  completedAt,
  showWaiting = true,
  showService = true,
  className,
}) => {
  const waitingTime = showWaiting ? calculateWaitingTime(createdAt, calledAt) : null;
  const serviceTime = showService ? calculateServiceTime(calledAt, completedAt) : null;

  if (!waitingTime && !serviceTime) return null;

  return (
    <div className={`flex items-center gap-3 text-sm text-gray-500 ${className}`}>
      <Clock className="h-3.5 w-3.5" />
      <div className="flex flex-wrap gap-x-4">
        {waitingTime && (
          <span>เวลารอคิว: {waitingTime}</span>
        )}
        {serviceTime && (
          <span>เวลาให้บริการ: {serviceTime}</span>
        )}
      </div>
    </div>
  );
};

export default QueueTimeInfo;
