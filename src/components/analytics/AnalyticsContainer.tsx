
import * as React from 'react';
import { Queue } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';
import QueueAnalytics from '@/components/dashboard/QueueAnalytics';
import QueueSummaryCards from '@/components/dashboard/QueueSummaryCards';
import OverallStats from '@/components/dashboard/OverallStats';
import AnalyticsSimulation from './AnalyticsSimulation';
import DataComparisonChart from './charts/DataComparisonChart';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { useSimulationDataIsolation } from './hooks/useSimulationDataIsolation';
import { useDataComparison } from '@/hooks/analytics/useDataComparison';

interface AnalyticsContainerProps {
  queues: Queue[];
  sortQueues: (queues: Queue[]) => Queue[];
}

const AnalyticsContainer: React.FC<AnalyticsContainerProps> = ({ queues, sortQueues }) => {
  const [waitingQueues, setWaitingQueues] = React.useState<Queue[]>([]);
  const [activeQueues, setActiveQueues] = React.useState<Queue[]>([]);
  const [completedQueues, setCompletedQueues] = React.useState<Queue[]>([]);
  const [skippedQueues, setSkippedQueues] = React.useState<Queue[]>([]);
  
  // Use isolated simulation data hook
  const { simulationMetrics } = useSimulationDataIsolation();
  const { realData, simulationData, hasSimulationData, hasRealData } = useDataComparison();
  
  // Determine if we're using simulation or real data
  const isSimulationMode = simulationMetrics.isSimulationMode;
  const displayStats = isSimulationMode ? {
    avgWaitTime: simulationMetrics.avgWaitTime,
    avgServiceTime: simulationMetrics.avgServiceTime,
    totalCompletedQueues: simulationMetrics.completedQueues
  } : {
    avgWaitTime: 0,
    avgServiceTime: 0,
    totalCompletedQueues: 0
  };

  // Update filtered queues when the main queues array changes
  React.useEffect(() => {
    if (queues) {
      const waiting = queues.filter(q => q.status === 'WAITING');
      const active = queues.filter(q => q.status === 'ACTIVE');
      const completed = queues.filter(q => q.status === 'COMPLETED');
      const skipped = queues.filter(q => q.status === 'SKIPPED');
      
      setWaitingQueues(sortQueues(waiting));
      setActiveQueues(active);
      setCompletedQueues(completed);
      setSkippedQueues(skipped);

      // Simulation mode is handled by the hook
    }
  }, [queues, sortQueues]);
  
  // Set up export event listener
  React.useEffect(() => {
    // Component initialization
  }, []);

  return (
    <>
      <AnalyticsSimulation />
      
      {/* Data Comparison Chart - Show when both real and simulation data exist */}
      {hasRealData && hasSimulationData && (
        <DataComparisonChart
          realData={realData}
          simulationData={simulationData}
          isSimulationMode={isSimulationMode}
        />
      )}
      
      {isSimulationMode && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800">โหมดข้อมูลจำลอง</CardTitle>
              <Badge variant="outline" className="border-orange-300 text-orange-700">
                🔬 Simulation Mode
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700">
              ข้อมูลที่แสดงอยู่เป็นข้อมูลจำลองเพื่อการทดสอบ ไม่ใช่ข้อมูลจริงของผู้ป่วย
              <br />
              กดปุ่ม "ล้างข้อมูล (Cleanup)" เพื่อกลับสู่โหมดข้อมูลจริง
            </p>
          </CardContent>
        </Card>
      )}
      
      <QueueSummaryCards 
        waitingQueues={waitingQueues}
        activeQueues={activeQueues}
        completedQueues={completedQueues}
        queues={queues}
        avgWaitTime={displayStats.avgWaitTime}
        avgServiceTime={displayStats.avgServiceTime}
        isSimulationMode={isSimulationMode}
      />

      {/* Statistics Section - Show appropriate data based on mode */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {isSimulationMode ? 'สถิติการจำลอง' : 'สถิติโดยรวม'}
            {isSimulationMode && (
              <Badge variant="outline" className="ml-2 border-orange-300 text-orange-700">
                🔬 Simulation Data
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isSimulationMode 
              ? 'ข้อมูลจากการจำลองระบบคิวโรงพยาบาล'
              : 'ข้อมูลสะสมทั้งหมดตั้งแต่เริ่มใช้ระบบ'
            }
          </p>
        </CardHeader>
        <CardContent>
          <OverallStats
            avgWaitTime={displayStats.avgWaitTime}
            avgServiceTime={displayStats.avgServiceTime}
            totalCompletedQueues={displayStats.totalCompletedQueues}
          />
        </CardContent>
      </Card>
      
      <QueueAnalytics 
        completedQueues={completedQueues}
        waitingQueues={waitingQueues}
        activeQueues={activeQueues}
        skippedQueues={skippedQueues}
        className="mb-6"
      />
    </>
  );
};

export default AnalyticsContainer;
