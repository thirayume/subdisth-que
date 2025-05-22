
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, SkipForward, PhoneCall, PhoneForwarded, InfoIcon, RotateCcw, ArrowRightFromLine } from 'lucide-react';
import { Queue } from '@/integrations/supabase/schema';
import { formatQueueNumber } from '@/utils/queueFormatters';
import QueueTypeLabel from './QueueTypeLabel';
import QueueTimeInfo from './QueueTimeInfo';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QueueCardProps {
  queue: Queue;
  patientName: string;
  onComplete?: () => Promise<Queue | null> | void;
  onSkip?: () => Promise<Queue | null> | void;
  onCall?: () => Promise<Queue | null> | void;
  onRecall?: () => void;
  onTransfer?: () => void;
  onReturnToWaiting?: () => void;
  onHold?: () => void;
  servicePointId?: string;
  servicePointName?: string;
}

const QueueCard: React.FC<QueueCardProps> = ({
  queue,
  patientName,
  onComplete,
  onSkip,
  onCall,
  onRecall,
  onTransfer,
  onReturnToWaiting,
  onHold,
  servicePointName
}) => {
  const formattedNumber = formatQueueNumber(queue.type, queue.number);
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="text-xl sm:text-2xl font-bold">{formattedNumber}</div>
            <div className="text-gray-600">{patientName}</div>
            <div className="flex items-center">
              <QueueTypeLabel queueType={queue.type} />
              {queue.notes && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="w-4 h-4 ml-2 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{queue.notes}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {servicePointName && (
                <span className="ml-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                  {servicePointName}
                </span>
              )}
            </div>
          </div>
          
          <QueueTimeInfo queue={queue} />
        </div>
      </CardContent>
      
      {/* Only show actions if any of the handlers are provided */}
      {(onComplete || onSkip || onCall || onRecall || onTransfer || onReturnToWaiting || onHold) && (
        <CardFooter className="px-4 py-3 bg-gray-50 flex justify-end gap-2 flex-wrap">
          {onReturnToWaiting && queue.status === 'SKIPPED' && (
            <Button variant="outline" size="sm" onClick={onReturnToWaiting}>
              <RotateCcw className="h-4 w-4 mr-1" />
              กลับรอคิว
            </Button>
          )}
          
          {onHold && queue.status === 'ACTIVE' && (
            <Button variant="outline" size="sm" onClick={onHold}>
              <SkipForward className="h-4 w-4 mr-1" />
              พักคิว
            </Button>
          )}
          
          {onTransfer && queue.status === 'ACTIVE' && (
            <Button variant="outline" size="sm" onClick={onTransfer}>
              <ArrowRightFromLine className="h-4 w-4 mr-1" />
              โอนคิว
            </Button>
          )}
          
          {onComplete && (
            <Button variant="outline" size="sm" onClick={onComplete}>
              <Check className="h-4 w-4 mr-1" />
              เสร็จสิ้น
            </Button>
          )}
          
          {onSkip && (
            <Button variant="outline" size="sm" onClick={onSkip}>
              <SkipForward className="h-4 w-4 mr-1" />
              ข้าม
            </Button>
          )}
          
          {onCall && (
            <Button variant="default" size="sm" onClick={onCall}>
              <PhoneCall className="h-4 w-4 mr-1" />
              เรียกคิว
            </Button>
          )}
          
          {onRecall && (
            <Button variant="outline" size="sm" onClick={onRecall}>
              <PhoneForwarded className="h-4 w-4 mr-1" />
              เรียกซ้ำ
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default QueueCard;
