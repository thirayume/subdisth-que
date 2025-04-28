
import React from 'react';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, MessageSquare, Calendar } from 'lucide-react';

interface DialogFooterActionsProps {
  onPrint: () => void;
  onClose: () => void;
  onScheduleNotification?: () => void;
  onSendSms?: () => void;
}

const DialogFooterActions: React.FC<DialogFooterActionsProps> = ({
  onPrint,
  onClose,
  onScheduleNotification,
  onSendSms,
}) => {
  return (
    <DialogFooter className="flex flex-col sm:flex-row gap-2">
      <Button 
        variant="outline"
        onClick={() => {
          console.log('[DialogFooterActions] Print button clicked');
          onPrint();
        }} 
        className="w-full sm:w-auto flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        พิมพ์คิว
      </Button>
      
      {onSendSms && (
        <Button 
          variant="outline"
          onClick={onSendSms} 
          className="w-full sm:w-auto flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          ส่ง SMS
        </Button>
      )}
      
      {onScheduleNotification && (
        <Button 
          variant="outline"
          onClick={onScheduleNotification} 
          className="w-full sm:w-auto flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          ตั้งเวลาแจ้งเตือน
        </Button>
      )}
      
      <Button 
        onClick={() => {
          console.log('[DialogFooterActions] Close button clicked');
          onClose();
        }} 
        className="w-full sm:w-auto bg-pharmacy-600 hover:bg-pharmacy-700"
      >
        ตกลง
      </Button>
    </DialogFooter>
  );
};

export default DialogFooterActions;
