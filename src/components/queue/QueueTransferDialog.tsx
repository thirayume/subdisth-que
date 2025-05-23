
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServicePoint, Queue } from '@/integrations/supabase/schema';
import { createLogger } from '@/utils/logger';

// Import the proper QueueType from useQueueTypes
import { QueueType } from '@/hooks/useQueueTypes';

interface QueueTransferDialogProps {
  queue: Queue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servicePoints: ServicePoint[];
  queueTypes: QueueType[];
  currentServicePointId?: string;
  onTransfer: (
    queueId: string,
    sourceServicePointId: string,
    targetServicePointId: string,
    notes?: string,
    newQueueType?: string
  ) => Promise<boolean>;
}

const logger = createLogger('QueueTransferDialog');

const QueueTransferDialog: React.FC<QueueTransferDialogProps> = ({
  queue,
  open,
  onOpenChange,
  servicePoints,
  queueTypes,
  currentServicePointId,
  onTransfer,
}) => {
  // State for the form
  const [targetServicePointId, setTargetServicePointId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [newQueueType, setNewQueueType] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState(false);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open && queue) {
      setTargetServicePointId('');
      setNotes('');
      setNewQueueType('');
    }
  }, [open, queue]);

  // Filter out the current service point from the options
  const availableServicePoints = servicePoints.filter(
    sp => sp.id !== currentServicePointId && sp.enabled
  );

  // Function to handle the transfer
  const handleTransfer = async () => {
    if (!queue || !targetServicePointId || !currentServicePointId) return;
    
    setIsTransferring(true);
    
    try {
      const success = await onTransfer(
        queue.id,
        currentServicePointId,
        targetServicePointId,
        notes,
        newQueueType
      );
      
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      logger.error('Error transferring queue:', error);
    } finally {
      setIsTransferring(false);
    }
  };

  // Get the queue type name for display
  const getQueueTypeName = (typeCode: string) => {
    const queueType = queueTypes.find(type => type.code === typeCode);
    return queueType ? queueType.name : typeCode;
  };

  if (!queue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>โอนคิว</DialogTitle>
          <DialogDescription>
            กรุณาเลือกจุดบริการที่ต้องการโอนคิวไป
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="queue-number" className="text-right">
              คิวหมายเลข
            </Label>
            <div className="col-span-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{queue.number}</span>
                <span className="text-sm text-muted-foreground">({getQueueTypeName(queue.type)})</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="target-service-point" className="text-right">
              จุดบริการปลายทาง
            </Label>
            <div className="col-span-3">
              <Select
                value={targetServicePointId}
                onValueChange={setTargetServicePointId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกจุดบริการปลายทาง" />
                </SelectTrigger>
                <SelectContent>
                  {availableServicePoints.map((servicePoint) => (
                    <SelectItem key={servicePoint.id} value={servicePoint.id}>
                      {servicePoint.code} - {servicePoint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-queue-type" className="text-right">
              ประเภทคิว (ไม่ระบุ = คงเดิม)
            </Label>
            <div className="col-span-3">
              <Select
                value={newQueueType}
                onValueChange={setNewQueueType}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="คงประเภทคิวเดิม" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">คงประเภทคิวเดิม</SelectItem>
                  {queueTypes.map((queueType) => (
                    <SelectItem key={queueType.id} value={queueType.code}>
                      {queueType.code} - {queueType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="transfer-notes" className="text-right">
              หมายเหตุ
            </Label>
            <Textarea
              id="transfer-notes"
              className="col-span-3"
              placeholder="ระบุหมายเหตุ (ไม่จำเป็น)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isTransferring}
          >
            ยกเลิก
          </Button>
          <Button 
            onClick={handleTransfer} 
            disabled={!targetServicePointId || isTransferring}
          >
            {isTransferring ? 'กำลังโอน...' : 'โอนคิว'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QueueTransferDialog;
