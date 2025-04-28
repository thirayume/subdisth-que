
import * as React from 'react';
import { QueueType } from '@/integrations/supabase/schema';

export const useQueueDialogState = (onOpenChange: (open: boolean) => void) => {
  const [qrDialogOpen, setQrDialogOpen] = React.useState(false);
  const [createdQueueNumber, setCreatedQueueNumber] = React.useState<number | null>(null);
  const [createdQueueType, setCreatedQueueType] = React.useState<QueueType>('GENERAL');
  const [createdPurpose, setCreatedPurpose] = React.useState('');

  // Reset all state
  const resetQueueDialog = React.useCallback(() => {
    console.log('🔄 [useQueueDialogState] Resetting dialog state');
    setQrDialogOpen(false);
    setCreatedQueueNumber(null);
    setCreatedQueueType('GENERAL');
    setCreatedPurpose('');
  }, []);

  return {
    qrDialogOpen,
    setQrDialogOpen,
    createdQueueNumber,
    setCreatedQueueNumber,
    createdQueueType,
    setCreatedQueueType,
    createdPurpose,
    setCreatedPurpose,
    resetQueueDialog
  };
};
