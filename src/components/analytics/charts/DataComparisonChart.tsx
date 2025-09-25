import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from "@/components/ui/chart";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  Users,
  Activity,
} from "lucide-react";

interface DataComparisonChartProps {
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

const DataComparisonChart: React.FC<DataComparisonChartProps> = ({
  realData,
  simulationData,
  isSimulationMode,
}) => {
  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="text-sm text-muted-foreground">
        Comparison chart temporarily disabled
      </div>
    </div>
  );
};

export default DataComparisonChart;
