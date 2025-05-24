
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Calculator } from 'lucide-react';
import { useQueueRecalculation } from '@/hooks/queue/useQueueRecalculation';

const QueueManagementHeader: React.FC = () => {
  const { recalculateAllQueues } = useQueueRecalculation();

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold tracking-tight">การจัดการคิว</h1>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={recalculateAllQueues}
          className="flex items-center gap-2"
        >
          <Calculator className="w-4 h-4" />
          คำนวณการมอบหมายคิวใหม่
        </Button>
      </div>
    </div>
  );
};

export default QueueManagementHeader;
