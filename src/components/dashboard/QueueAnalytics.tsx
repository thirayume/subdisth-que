import * as React from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import { Queue } from "@/integrations/supabase/schema";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalyticsData } from "./analytics/useAnalyticsData";
import SummaryCards from "./analytics/SummaryCards";
import AlgorithmRecommendation from "./analytics/AlgorithmRecommendation";
import TabSelector from "./analytics/TabSelector";
import WaitTimeChart from "./analytics/WaitTimeChart";
import ThroughputChart from "./analytics/ThroughputChart";
import QueueCompositionChart from "./analytics/QueueCompositionChart";
import { SettingsProvider } from "@/contexts/SettingsContext";

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
  className,
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
    handleChangeAlgorithm,
  } = useAnalyticsData(completedQueues, waitingQueues);

  console.log("averageWaitTime", averageWaitTime);

  return (
    <DirectionProvider dir="ltr">
      <div className={cn("space-y-6", className)}>
        <SummaryCards
          waitingQueueCount={waitingQueues.length}
          averageWaitTime={averageWaitTime}
          averageServiceTime={averageServiceTime}
          completedQueueCount={completedQueues.length}
        />

        {shouldChangeAlgorithm && (
          <SettingsProvider>
            <AlgorithmRecommendation
              shouldChangeAlgorithm={shouldChangeAlgorithm}
              currentAlgorithm={currentAlgorithm}
              recommendedAlgorithm={recommendedAlgorithm}
              urgentCount={urgentCount}
              elderlyCount={elderlyCount}
              waitingQueueCount={waitingQueues.length}
              handleChangeAlgorithm={handleChangeAlgorithm}
            />
          </SettingsProvider>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="w-full">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg">เวลารอเฉลี่ย</CardTitle>
                <TabSelector
                  timeFrame={timeFrame}
                  setTimeFrame={setTimeFrame}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <WaitTimeChart data={waitTimeData} timeFrame={timeFrame} />
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg">ปริมาณผู้มารับบริการ</CardTitle>
                <TabSelector
                  timeFrame={timeFrame}
                  setTimeFrame={setTimeFrame}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ThroughputChart data={throughputData} timeFrame={timeFrame} />
            </CardContent>
          </Card>
        </div>

        <Card className="w-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">ลักษณะของคิว</CardTitle>
            <p className="text-sm text-muted-foreground">
              การกระจายตัวของประเภทคิวที่รออยู่ในปัจจุบัน
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs defaultValue="composition" className="w-full">
              <TabsContent value="composition" className="mt-0">
                <QueueCompositionChart waitingQueues={waitingQueues} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DirectionProvider>
  );
};

export default QueueAnalytics;
