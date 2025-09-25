export interface SimulationMetrics {
  avgWaitTime: number;
  avgWaitTimeToday: number;
  avgServiceTime: number;
  avgServiceTimeToday: number;
  totalQueues: number;
  completedQueues: number;
  waitingQueues: number;
  activeQueues: number;
  isSimulationMode: boolean;
}

export interface DataComparisonChartProps {
  realData: {
    avgWaitTime: number;
    completedQueues: number;
    throughput: number;
    label: string;
  };
  simulationData: {
    avgWaitTime: number;
    completedQueues: number;
    throughput: number;
    label: string;
  };
  isSimulationMode: boolean;
}