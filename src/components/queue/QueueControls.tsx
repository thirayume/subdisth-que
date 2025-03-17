
import React from 'react';
import { Button } from '@/components/ui/button';
import { Queue, QueueStatus } from '@/lib/mockData';
import { 
  PhoneOutgoing, 
  RefreshCw, 
  Check, 
  SkipForward, 
  AlertTriangle, 
  Pause
} from 'lucide-react';

interface QueueControlsProps {
  queue: Queue;
  onUpdateStatus: (queueId: string, status: QueueStatus) => void;
  onCallQueue: (queueId: string) => void;
  onRecallQueue: (queueId: string) => void;
  className?: string;
}

const QueueControls: React.FC<QueueControlsProps> = ({ 
  queue, 
  onUpdateStatus, 
  onCallQueue, 
  onRecallQueue,
  className 
}) => {
  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {queue.status === QueueStatus.WAITING && (
        <Button 
          onClick={() => onCallQueue(queue.id)} 
          className="bg-pharmacy-600 hover:bg-pharmacy-700 text-white"
          size="sm"
        >
          <PhoneOutgoing className="h-4 w-4 mr-1" />
          เรียกคิว
        </Button>
      )}
      
      {queue.status === QueueStatus.ACTIVE && (
        <>
          <Button 
            onClick={() => onRecallQueue(queue.id)} 
            variant="outline" 
            size="sm"
            className="border-pharmacy-200 text-pharmacy-700 hover:bg-pharmacy-50"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            เรียกซ้ำ
          </Button>
          
          <Button 
            onClick={() => onUpdateStatus(queue.id, QueueStatus.COMPLETED)} 
            variant="outline" 
            size="sm"
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            <Check className="h-4 w-4 mr-1" />
            เสร็จสิ้น
          </Button>
          
          <Button 
            onClick={() => onUpdateStatus(queue.id, QueueStatus.SKIPPED)} 
            variant="outline" 
            size="sm"
            className="border-amber-200 text-amber-700 hover:bg-amber-50"
          >
            <SkipForward className="h-4 w-4 mr-1" />
            ข้ามคิว
          </Button>
          
          <Button 
            onClick={() => onUpdateStatus(queue.id, QueueStatus.WAITING)} 
            variant="outline" 
            size="sm"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Pause className="h-4 w-4 mr-1" />
            พัก
          </Button>
        </>
      )}
      
      {queue.status === QueueStatus.SKIPPED && (
        <Button 
          onClick={() => onCallQueue(queue.id)} 
          variant="outline" 
          size="sm"
          className="border-pharmacy-200 text-pharmacy-700 hover:bg-pharmacy-50"
        >
          <AlertTriangle className="h-4 w-4 mr-1" />
          เรียกอีกครั้ง
        </Button>
      )}
      
      {queue.status === QueueStatus.COMPLETED && (
        <span className="text-sm text-gray-500 italic">เสร็จสิ้นการให้บริการ</span>
      )}
    </div>
  );
};

export default QueueControls;
