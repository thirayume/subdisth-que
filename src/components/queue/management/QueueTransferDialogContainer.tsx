
import * as React from 'react';
import { Queue, ServicePoint } from '@/integrations/supabase/schema';
import { QueueTransferDialog } from '@/components/queue/transfer';
import { QueueType } from '@/hooks/useQueueTypes';

interface QueueTransferDialogContainerProps {
  queueToTransfer: Queue | null;
  transferDialogOpen: boolean;
  onOpenChange: (open: boolean) => void;
  servicePoints: ServicePoint[];
  queueTypes: QueueType[];
  onTransfer?: (
    queueId: string, 
    sourceServicePointId: string,
    targetServicePointId: string,
    notes?: string,
    newQueueType?: string
  ) => Promise<boolean>;
}

const QueueTransferDialogContainer: React.FC<QueueTransferDialogContainerProps> = ({
  queueToTransfer,
  transferDialogOpen,
  onOpenChange,
  servicePoints,
  queueTypes,
  onTransfer
}) => {
  if (!onTransfer) return null;

  return (
    <QueueTransferDialog
      queue={queueToTransfer}
      open={transferDialogOpen}
      onOpenChange={onOpenChange}
      servicePoints={servicePoints}
      queueTypes={queueTypes}
      currentServicePointId={queueToTransfer?.service_point_id}
      onTransfer={onTransfer}
    />
  );
};

export default QueueTransferDialogContainer;
