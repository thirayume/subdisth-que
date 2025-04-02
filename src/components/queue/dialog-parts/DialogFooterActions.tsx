
import React from 'react';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface DialogFooterActionsProps {
  onPrint: () => void;
  onClose: () => void;
}

const DialogFooterActions: React.FC<DialogFooterActionsProps> = ({
  onPrint,
  onClose,
}) => {
  return (
    <DialogFooter className="flex flex-col sm:flex-row gap-2">
      <Button 
        variant="outline"
        onClick={onPrint} 
        className="w-full sm:w-auto flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        พิมพ์คิว
      </Button>
      <Button 
        onClick={onClose} 
        className="w-full sm:w-auto bg-pharmacy-600 hover:bg-pharmacy-700"
      >
        ตกลง
      </Button>
    </DialogFooter>
  );
};

export default DialogFooterActions;
