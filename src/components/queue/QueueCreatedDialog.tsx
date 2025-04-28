
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
      console.log(`----------------------------------------`);
      console.log(`🎉 QUEUE CREATED DIALOG OPENED 🎉`);
      console.log(`----------------------------------------`);
      console.log(`- queueNumber: ${queueNumber}`);
      console.log(`- queueType: ${queueType}`);
      console.log(`- patientName: ${patientName || 'none'}`);
      console.log(`- formattedQueueNumber: ${formattedQueueNumber}`);
      console.log(`- purpose: ${purpose || 'none'}`);
      console.log(`- patientPhone: ${patientPhone || 'none'}`);
      console.log(`- patientLineId: ${patientLineId || 'none'}`);
      
      toast.success(`คิวถูกสร้างเรียบร้อย: ${formattedQueueNumber}`);
    } else {
      console.log(`----------------------------------------`);
      console.log(`🎟️ [QueueCreatedDialog] DIALOG CLOSED`);
      console.log(`----------------------------------------`);
    }
  }, [open, queueNumber, queueType, patientName, formattedQueueNumber, purpose, patientPhone, patientLineId]);
  
  const handlePrint = () => {
    console.log(`----------------------------------------`);
    console.log('🖨️ [QueueCreatedDialog] PRINT BUTTON CLICKED');
    console.log(`----------------------------------------`);
    try {
      console.log('[QueueCreatedDialog] Calling printQueueTicket with:', {
        queueNumber,
        queueType,
        patientName,
        patientPhone,
        patientLineId,
        purpose
      });
      
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
      console.log('[QueueCreatedDialog] Print initiated successfully');
    } catch (error) {
      console.error('[QueueCreatedDialog] Error printing ticket:', error);
      toast.error('เกิดข้อผิดพลาดในการพิมพ์บัตรคิว');
    }
  };

  // Force focus on dialog when it opens
  useEffect(() => {
    if (open && dialogRef.current) {
      console.log('[QueueCreatedDialog] Dialog opened, attempting to focus');
      const timer = setTimeout(() => {
        const dialogElement = dialogRef.current?.querySelector('[role="dialog"]');
        if (dialogElement) {
          (dialogElement as HTMLElement).focus();
          console.log('[QueueCreatedDialog] Dialog focused successfully');
        } else {
          console.log('[QueueCreatedDialog] Could not find dialog element to focus');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        console.log(`🎟️ [QueueCreatedDialog] Dialog onOpenChange called with: ${newOpen}`);
        onOpenChange(newOpen);
      }}
    >
      <DialogContent 
        ref={dialogRef} 
        className="sm:max-w-[400px] bg-background"
        onOpenAutoFocus={(e) => {
          console.log('[QueueCreatedDialog] onOpenAutoFocus event triggered');
          // Don't prevent default to allow auto-focusing
        }}
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
