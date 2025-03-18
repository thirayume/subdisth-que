
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import LineQRCode from '@/components/ui/LineQRCode';
import { QrCode, Check } from 'lucide-react';

interface QueueCreatedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queueNumber: number;
}

const QueueCreatedDialog: React.FC<QueueCreatedDialogProps> = ({
  open,
  onOpenChange,
  queueNumber,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            <span>สร้างคิวเรียบร้อยแล้ว</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-4">
          <div className="text-center mb-4">
            <p className="text-lg font-medium text-pharmacy-700">คิวหมายเลข: <span className="text-2xl">{queueNumber}</span></p>
            <p className="text-sm text-gray-500 mt-1">สแกน QR Code เพื่อติดตามคิวบน LINE</p>
          </div>
          
          <LineQRCode queueNumber={queueNumber} className="w-full max-w-[250px] mx-auto" />
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
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
