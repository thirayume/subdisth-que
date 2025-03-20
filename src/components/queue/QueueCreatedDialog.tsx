
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import LineQRCode from '@/components/ui/LineQRCode';
import { Check, Printer } from 'lucide-react';
import { QueueType } from '@/integrations/supabase/schema';
import { formatQueueNumber } from '@/utils/queueFormatters';
import { printQueueTicket } from '@/utils/printUtils';
import PatientInfoDisplay from './PatientInfoDisplay';

interface QueueCreatedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queueNumber: number;
  queueType: QueueType;
  patientName?: string;
  patientPhone?: string;
  purpose?: string;
}

const QueueCreatedDialog: React.FC<QueueCreatedDialogProps> = ({
  open,
  onOpenChange,
  queueNumber,
  queueType = 'GENERAL',
  patientName = '',
  patientPhone = '',
  purpose = '',
}) => {
  const formattedQueueNumber = formatQueueNumber(queueType, queueNumber);
  
  const handlePrint = () => {
    printQueueTicket({
      queueNumber,
      queueType,
      patientName,
      patientPhone,
      purpose
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            <span>สร้างคิวเรียบร้อยแล้ว</span>
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            {purpose}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-4">
          <PatientInfoDisplay 
            patientName={patientName}
            patientPhone={patientPhone}
            formattedQueueNumber={formattedQueueNumber}
          />
          
          <LineQRCode queueNumber={queueNumber} queueType={queueType} className="w-full max-w-[250px] mx-auto" />
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline"
            onClick={handlePrint} 
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            พิมพ์คิว
          </Button>
          <Button 
            onClick={() => onOpenChange(false)} 
            className="w-full sm:w-auto bg-pharmacy-600 hover:bg-pharmacy-700"
          >
            ตกลง
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QueueCreatedDialog;
