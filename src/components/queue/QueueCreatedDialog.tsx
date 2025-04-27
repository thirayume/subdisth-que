
import React from 'react';
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
  
  // Add debug logging
  React.useEffect(() => {
    console.log(`[QueueCreatedDialog] Dialog open state: ${open}`);
    console.log(`[QueueCreatedDialog] Queue number: ${queueNumber}`);
    console.log(`[QueueCreatedDialog] Queue type: ${queueType}`);
    
    if (open) {
      toast.success(`คิวถูกสร้างเรียบร้อย: ${formattedQueueNumber}`);
    }
  }, [open, queueNumber, queueType, formattedQueueNumber]);
  
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default QueueCreatedDialog;
