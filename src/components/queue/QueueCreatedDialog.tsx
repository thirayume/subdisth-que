
import React, { useEffect } from 'react';
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
  const formattedQueueNumber = formatQueueNumber(queueType, queueNumber);
  
  // Enhanced debug logging to track dialog state
  useEffect(() => {
    if (open) {
      console.log(`=== QueueCreatedDialog OPENED ===`);
      console.log(`- queueNumber: ${queueNumber}`);
      console.log(`- queueType: ${queueType}`);
      console.log(`- patientName: ${patientName}`);
      console.log(`- formattedQueueNumber: ${formattedQueueNumber}`);
      console.log(`- purpose: ${purpose}`);
      
      toast.success(`คิวถูกสร้างเรียบร้อย: ${formattedQueueNumber}`);
    } else {
      console.log(`=== QueueCreatedDialog CLOSED ===`);
    }
  }, [open, queueNumber, queueType, patientName, formattedQueueNumber, purpose]);
  
  const handlePrint = () => {
    console.log('Printing queue ticket...');
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
      toast.success('กำลังพิมพ์บัตรคิว');
    } catch (error) {
      console.error('Error printing ticket:', error);
      toast.error('เกิดข้อผิดพลาดในการพิมพ์บัตรคิว');
    }
  };

  // Force focus on dialog when it opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        const dialogElement = document.querySelector('[role="dialog"]');
        if (dialogElement) {
          (dialogElement as HTMLElement).focus();
          console.log('Dialog focused');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        console.log(`Dialog onOpenChange called with: ${newOpen}`);
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-[400px] bg-background">
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
          onClose={() => {
            console.log('[QueueCreatedDialog] Close button clicked');
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default QueueCreatedDialog;
