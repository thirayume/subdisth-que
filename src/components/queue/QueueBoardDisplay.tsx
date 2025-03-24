
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatQueueNumber } from '@/utils/queueFormatters';
import QueueTypeLabel from './QueueTypeLabel';
import { Queue } from '@/integrations/supabase/schema';
import { announceQueue } from '@/utils/textToSpeech';

interface QueueBoardDisplayProps {
  queue: Queue;
  patientName?: string;
  isActive?: boolean;
  className?: string;
  counterName?: string;
  autoAnnounce?: boolean;
}

const QueueBoardDisplay: React.FC<QueueBoardDisplayProps> = ({
  queue,
  patientName,
  isActive = false,
  className,
  counterName = '1',
  autoAnnounce = false
}) => {
  const [hasAnnounced, setHasAnnounced] = useState(false);
  const formattedNumber = formatQueueNumber(queue.type, queue.number);
  
  // Auto announce when a queue becomes active
  useEffect(() => {
    const shouldAnnounce = isActive && autoAnnounce && !hasAnnounced;
    
    if (shouldAnnounce) {
      const announceActiveQueue = async () => {
        try {
          // Get announcement settings from localStorage or use default
          const announcementText = localStorage.getItem('queue_announcement_text') || 
            'ขอเชิญหมายเลข {queueNumber} ที่ช่องบริการ {counter}';
            
          await announceQueue(queue.number, counterName, queue.type, announcementText);
          setHasAnnounced(true);
        } catch (error) {
          console.error('Error auto-announcing queue:', error);
        }
      };
      
      announceActiveQueue();
    }
  }, [isActive, autoAnnounce, hasAnnounced, queue, counterName]);
  
  // Reset announced state when queue changes
  useEffect(() => {
    setHasAnnounced(false);
  }, [queue.id]);
  
  return (
    <Card className={`overflow-hidden ${isActive ? 'border-2 border-green-500' : ''} ${className}`}>
      <CardContent className="p-0">
        <div className="bg-gray-50 py-2 px-4 border-b">
          <div className="flex justify-between items-center">
            <QueueTypeLabel queueType={queue.type} />
            <p className="text-sm text-gray-500">
              {new Date(queue.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-2xl sm:text-3xl font-bold text-center">{formattedNumber}</h3>
          {patientName && (
            <p className="text-sm text-gray-600 text-center mt-2">{patientName}</p>
          )}
          {isActive && (
            <div className="mt-3 text-center">
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                กำลังให้บริการ
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QueueBoardDisplay;
