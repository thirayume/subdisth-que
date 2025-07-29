
import * as React from 'react';
import { Queue } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';
import QueueAnalytics from '@/components/dashboard/QueueAnalytics';
import QueueSummaryCards from '@/components/dashboard/QueueSummaryCards';
import OverallStats from '@/components/dashboard/OverallStats';
import AnalyticsSimulation from './AnalyticsSimulation';
import DataComparisonChart from './charts/DataComparisonChart';
import ExportAnalytics from './ExportAnalytics';
import PerformanceMonitor from './PerformanceMonitor';
import { AnalyticsLoadingSkeleton } from './LoadingStates';
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
      {/* Prominent Mode Indicator - Always visible at top */}
      <div className={`sticky top-0 z-10 mb-6 rounded-lg border-2 ${
        isSimulationMode 
          ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-orange-100 shadow-lg shadow-orange-200/50' 
          : 'border-green-400 bg-gradient-to-r from-green-50 to-green-100 shadow-lg shadow-green-200/50'
      }`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              isSimulationMode ? 'bg-orange-200' : 'bg-green-200'
            }`}>
              {isSimulationMode ? (
                <AlertTriangle className="h-6 w-6 text-orange-700" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-green-500 animate-pulse" />
              )}
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${
                isSimulationMode ? 'text-orange-800' : 'text-green-800'
              }`}>
                {isSimulationMode ? '🔬 โหมดข้อมูลจำลอง (Simulation Mode)' : '📊 โหมดข้อมูลจริง (Real-time Data)'}
              </h2>
              <p className={`text-sm ${
                isSimulationMode ? 'text-orange-700' : 'text-green-700'
              }`}>
                {isSimulationMode 
                  ? 'ข้อมูลจำลองสำหรับการทดสอบอัลกอริทึม - ไม่ใช่ข้อมูลจริงของผู้ป่วย'
                  : 'ข้อมูลจริงจากระบบคิวโรงพยาบาล - อัปเดตแบบเรียลไทม์'
                }
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`text-sm font-medium px-3 py-1 ${
              isSimulationMode 
                ? 'border-orange-400 text-orange-800 bg-orange-200/50' 
                : 'border-green-400 text-green-800 bg-green-200/50'
            }`}
          >
            {isSimulationMode ? 'SIMULATION' : 'LIVE DATA'}
          </Badge>
        </div>
      </div>

      <AnalyticsSimulation />
      
      {/* Data Comparison Chart - Show when simulation data exists (with fallback for real data) */}
      {(hasRealData || hasSimulationData) && (
        <DataComparisonChart
          realData={realData}
          simulationData={simulationData}
          isSimulationMode={isSimulationMode}
        />
      )}

      {/* Export Analytics - Show when we have data to export */}
      {(hasRealData || hasSimulationData) && (
        <ExportAnalytics
          realData={realData}
          simulationData={simulationData}
          queueStats={{ 
            waiting: waitingQueues.length, 
            active: activeQueues.length, 
            completed: completedQueues.length, 
            skipped: skippedQueues.length 
          }}
        />
      )}

      <PerformanceMonitor />
      
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
