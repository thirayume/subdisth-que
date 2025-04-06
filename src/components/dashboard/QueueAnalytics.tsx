
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TrendingUp } from 'lucide-react';
import { Queue } from '@/integrations/supabase/schema';
import SummaryCards from './analytics/SummaryCards';
import AlgorithmRecommendation from './analytics/AlgorithmRecommendation';
import WaitTimeChart from './analytics/WaitTimeChart';
import ThroughputChart from './analytics/ThroughputChart';
import QueueCompositionChart from './analytics/QueueCompositionChart';
import TabSelector from './analytics/TabSelector';
import { useAnalyticsData } from './analytics/useAnalyticsData';

interface QueueAnalyticsProps {
  completedQueues: Queue[];
  waitingQueues: Queue[];
  activeQueues: Queue[];
  skippedQueues: Queue[];
  className?: string;
}

const QueueAnalytics: React.FC<QueueAnalyticsProps> = ({
  completedQueues,
  waitingQueues,
  activeQueues,
  skippedQueues,
  className
}) => {
  const {
    timeFrame,
    setTimeFrame,
    waitTimeData,
    throughputData,
    averageWaitTime,
    averageServiceTime,
    currentAlgorithm,
    recommendedAlgorithm,
    shouldChangeAlgorithm,
    urgentCount,
    elderlyCount,
    handleChangeAlgorithm
  } = useAnalyticsData(completedQueues, waitingQueues);
  
  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-muted-foreground" />
            การวิเคราะห์คิว
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SummaryCards 
            waitingQueueCount={waitingQueues.length}
            averageWaitTime={averageWaitTime}
            averageServiceTime={averageServiceTime}
            completedQueueCount={completedQueues.length}
          />
          
          <AlgorithmRecommendation 
            shouldChangeAlgorithm={shouldChangeAlgorithm}
            currentAlgorithm={currentAlgorithm}
            recommendedAlgorithm={recommendedAlgorithm}
            urgentCount={urgentCount}
            elderlyCount={elderlyCount}
            waitingQueueCount={waitingQueues.length}
            handleChangeAlgorithm={handleChangeAlgorithm}
          />
          
          <Tabs defaultValue="wait-time" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="wait-time">เวลารอคิว</TabsTrigger>
              <TabsTrigger value="throughput">ปริมาณผู้รับบริการ</TabsTrigger>
              <TabsTrigger value="queue-composition">สัดส่วนประเภทคิว</TabsTrigger>
            </TabsList>
            
            <TabsContent value="wait-time">
              <TabSelector timeFrame={timeFrame} setTimeFrame={setTimeFrame} />
              <WaitTimeChart data={waitTimeData} timeFrame={timeFrame} />
            </TabsContent>
            
            <TabsContent value="throughput">
              <TabSelector timeFrame={timeFrame} setTimeFrame={setTimeFrame} />
              <ThroughputChart data={throughputData} timeFrame={timeFrame} />
            </TabsContent>
            
            <TabsContent value="queue-composition">
              <QueueCompositionChart waitingQueues={waitingQueues} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueueAnalytics;
