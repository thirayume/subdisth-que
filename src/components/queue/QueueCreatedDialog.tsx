
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
  
  // Enhanced debug logging
  useEffect(() => {
    console.log(`=== QueueCreatedDialog Component State ===`);
    console.log(`- open: ${open}`);
    console.log(`- queueNumber: ${queueNumber}`);
    console.log(`- queueType: ${queueType}`);
    console.log(`- patientName: ${patientName}`);
    console.log(`- formattedQueueNumber: ${formattedQueueNumber}`);
    console.log(`- purpose: ${purpose}`);
    
    if (open) {
      console.log(`[QueueCreatedDialog] Dialog should be visible now`);
      toast.success(`คิวถูกสร้างเรียบร้อย: ${formattedQueueNumber}`);
    }
  }, [open, queueNumber, queueType, patientName, formattedQueueNumber, purpose]);
  
  const handlePrint = () => {
    console.log('Printing queue ticket...');
    printQueueTicket({
      queueNumber,
      queueType,
      patientName,
      patientPhone,
      patientLineId,
      purpose
    });
  };

  return (
    <>
      <Dialog 
        open={open} 
        onOpenChange={(newOpenState) => {
          console.log(`[QueueCreatedDialog] Dialog onOpenChange called with: ${newOpenState}`);
          onOpenChange(newOpenState);
        }}
      >
        <DialogContent className="sm:max-w-[400px] bg-background">
          {/* Hidden debugging info - using comments instead of console.log in JSX */}
          
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
    </>
  );
};

export default QueueCreatedDialog;
