
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, SkipForward, PhoneCall, PhoneForwarded, RotateCcw, ArrowRightFromLine, User, X } from 'lucide-react';
import { Queue } from '@/integrations/supabase/schema';

interface QueueCardActionsProps {
  queue: Queue;
  onComplete?: () => Promise<Queue | null> | void;
  onSkip?: () => Promise<Queue | null> | void;
  onCall?: () => Promise<Queue | null> | void;
  onRecall?: () => void;
  onTransfer?: () => void;
  onReturnToWaiting?: () => void;
  onHold?: () => void;
  onViewPatientInfo?: () => void;
  onCancel?: () => void;
  isPharmacyInterface?: boolean;
}

const QueueCardActions: React.FC<QueueCardActionsProps> = ({
  queue,
  onComplete,
  onSkip,
  onCall,
  onRecall,
  onTransfer,
  onReturnToWaiting,
  onHold,
  onViewPatientInfo,
  onCancel,
  isPharmacyInterface = false
}) => {
  return (
    <>
      {/* Patient Info Button - Show for waiting and active queues */}
      {onViewPatientInfo && (queue.status === 'ACTIVE' || queue.status === 'WAITING') && (
        <Button variant="outline" size="sm" onClick={onViewPatientInfo}>
          <User className="h-4 w-4 mr-1" />
          ข้อมูลผู้ป่วย
        </Button>
      )}
      
      {/* Cancel Queue - Show for waiting queues */}
      {onCancel && queue.status === 'WAITING' && (
        <Button variant="outline" size="sm" onClick={onCancel} className="border-red-200 text-red-700 hover:bg-red-50">
          <X className="h-4 w-4 mr-1" />
          ยกเลิก
        </Button>
      )}
      
      {/* Return to Waiting - Show for skipped queues */}
      {onReturnToWaiting && queue.status === 'SKIPPED' && (
        <Button variant="outline" size="sm" onClick={onReturnToWaiting}>
          <RotateCcw className="h-4 w-4 mr-1" />
          กลับรอคิว
        </Button>
      )}
      
      {/* Hold Queue - Show for active queues */}
      {onHold && queue.status === 'ACTIVE' && (
        <Button variant="outline" size="sm" onClick={onHold}>
          <SkipForward className="h-4 w-4 mr-1" />
          พักคิว
        </Button>
      )}
      
      {/* Transfer Queue - Show for active queues */}
      {onTransfer && queue.status === 'ACTIVE' && (
        <Button variant="outline" size="sm" onClick={onTransfer}>
          <ArrowRightFromLine className="h-4 w-4 mr-1" />
          โอนคิว
        </Button>
      )}
      
      {/* Complete Service - Show for active queues */}
      {onComplete && queue.status === 'ACTIVE' && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onComplete}
          className={isPharmacyInterface ? "border-green-200 text-green-700 hover:bg-green-50" : ""}
        >
          <Check className="h-4 w-4 mr-1" />
          เสร็จสิ้น
        </Button>
      )}
      
      {/* Skip Queue - Show for waiting and active queues */}
      {onSkip && (queue.status === 'WAITING' || queue.status === 'ACTIVE') && (
        <Button variant="outline" size="sm" onClick={onSkip}>
          <SkipForward className="h-4 w-4 mr-1" />
          ข้าม
        </Button>
      )}
      
      {/* Call Queue - Primary action for waiting queues */}
      {onCall && queue.status === 'WAITING' && (
        <Button 
          variant="default" 
          size="sm" 
          onClick={onCall}
          className={isPharmacyInterface ? "bg-pharmacy-600 hover:bg-pharmacy-700" : ""}
        >
          <PhoneCall className="h-4 w-4 mr-1" />
          เรียกคิว
        </Button>
      )}
      
      {/* Recall Queue - Show for active queues */}
      {onRecall && queue.status === 'ACTIVE' && (
        <Button variant="outline" size="sm" onClick={onRecall}>
          <PhoneForwarded className="h-4 w-4 mr-1" />
          เรียกซ้ำ
        </Button>
      )}
    </>
  );
};

export default QueueCardActions;
