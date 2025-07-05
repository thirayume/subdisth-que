
import * as React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from '@/components/ui/chart';

interface WaitTimeChartProps {
  data: Array<{ time: string; waitTime: number }>;
  timeFrame: 'day' | 'week' | 'month';
}

const chartConfig = {
  waitTime: {
    label: "เวลารอ (นาที)",
    color: "hsl(var(--chart-1))",
  },
}

const WaitTimeChart: React.FC<WaitTimeChartProps> = ({ data, timeFrame }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        ไม่มีข้อมูลเวลารอในช่วงเวลานี้
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
          />
          <ChartTooltip 
            content={<ChartTooltipContent 
              labelFormatter={(value) => `เวลา: ${value}`}
              formatter={(value, name) => [
                `${value} นาที`,
                chartConfig.waitTime.label
              ]}
            />} 
          />
          <Line 
            type="monotone" 
            dataKey="waitTime" 
            stroke="var(--color-waitTime)"
            strokeWidth={2}
            dot={{ fill: "var(--color-waitTime)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default WaitTimeChart;
