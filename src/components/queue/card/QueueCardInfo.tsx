
import React from 'react';
import { InfoIcon, MapPin } from 'lucide-react';
import { Queue } from '@/integrations/supabase/schema';
import { formatQueueNumber } from '@/utils/queueFormatters';
import QueueTypeLabel from '../QueueTypeLabel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QueueCardInfoProps {
  queue: Queue;
  patientName: string;
  servicePointName?: string;
  suggestedServicePointName?: string;
  showServicePointInfo?: boolean;
}

const QueueCardInfo: React.FC<QueueCardInfoProps> = ({
  queue,
  patientName,
  servicePointName,
  suggestedServicePointName,
  showServicePointInfo = false
}) => {
  const formattedNumber = formatQueueNumber(queue.type, queue.number);
  
  return (
    <div className="space-y-2">
      <div className="text-xl sm:text-2xl font-bold">{formattedNumber}</div>
      <div className="text-gray-600">{patientName}</div>
      <div className="flex items-center flex-wrap gap-2">
        <QueueTypeLabel queueType={queue.type} />
        {queue.notes && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="w-4 h-4 text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{queue.notes}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {showServicePointInfo && (
          <div className="flex items-center gap-2">
            {servicePointName ? (
              <span className="text-xs text-white bg-green-600 px-2 py-1 rounded flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {servicePointName}
              </span>
            ) : suggestedServicePointName ? (
              <span className="text-xs text-gray-700 bg-yellow-100 border border-yellow-300 px-2 py-1 rounded flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                แนะนำ: {suggestedServicePointName}
              </span>
            ) : (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                ยังไม่กำหนดจุดบริการ
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueCardInfo;
