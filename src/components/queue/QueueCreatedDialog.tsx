
import React, { useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { QueueType } from '@/integrations/supabase/schema';
import { formatQueueNumber } from '@/utils/queueFormatters';
import { printQueueTicket } from '@/utils/printUtils';
import { toast } from 'sonner';

import QueueCreatedHeader from './dialog-parts/QueueCreatedHeader';
import QueueCreatedContent from './dialog-parts/QueueCreatedContent';
import DialogFooterActions from './dialog-parts/DialogFooterActions';

interface QueueCreatedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queueNumber: number;
  queueType: QueueType;
  patientName?: string;
  patientPhone?: string;
  patientLineId?: string;
  purpose?: string;
}

const QueueCreatedDialog: React.FC<QueueCreatedDialogProps> = ({
  open,
  onOpenChange,
  queueNumber,
  queueType = 'GENERAL',
  patientName = '',
  patientPhone = '',
  patientLineId = '',
  purpose = '',
}) => {
  console.log(`🎟️ [QueueCreatedDialog] Rendering with open=${open}, queueNumber=${queueNumber}, queueType=${queueType}`);
  const dialogRef = useRef<HTMLDivElement>(null);
  const formattedQueueNumber = formatQueueNumber(queueType, queueNumber);
  
  // Track when dialog is opened/closed
  useEffect(() => {
    if (open) {
      console.log(`🎉 QUEUE CREATED DIALOG OPENED`);
      console.log(`- queueNumber: ${queueNumber}`);
      console.log(`- queueType: ${queueType}`);
      console.log(`- patientName: ${patientName || 'none'}`);
      console.log(`- formattedQueueNumber: ${formattedQueueNumber}`);
    } else {
      console.log(`🎟️ [QueueCreatedDialog] DIALOG CLOSED`);
    }
  }, [open, queueNumber, queueType, patientName, formattedQueueNumber]);
  
  const handlePrint = () => {
    console.log('🖨️ [QueueCreatedDialog] PRINT BUTTON CLICKED');
    try {
      printQueueTicket({
        queueNumber,
        queueType,
        patientName,
        patientPhone,
        patientLineId,
        purpose
      });
      
      // Show print success message
      toast.success('กำลังพิมพ์บัตรคิว', { id: "print-ticket" });
    } catch (error) {
      console.error('[QueueCreatedDialog] Error printing ticket:', error);
      toast.error('เกิดข้อผิดพลาดในการพิมพ์บัตรคิว', { id: "print-ticket" });
    }
  };

  // Force focus on dialog when it opens
  useEffect(() => {
    if (open && dialogRef.current) {
      const timer = setTimeout(() => {
        const dialogElement = dialogRef.current?.querySelector('[role="dialog"]');
        if (dialogElement) {
          (dialogElement as HTMLElement).focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <DialogContent 
        ref={dialogRef} 
        className="sm:max-w-[400px] bg-background"
      >
        <QueueCreatedHeader purpose={purpose} />
        
        <QueueCreatedContent 
          formattedQueueNumber={formattedQueueNumber}
          queueNumber={queueNumber}
          queueType={queueType}
          patientName={patientName}
          patientPhone={patientPhone}
          patientLineId={patientLineId}
        />
        
        <DialogFooterActions 
          onPrint={handlePrint}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default QueueCreatedDialog;
