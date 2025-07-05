
import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from '@/components/ui/chart';

interface ThroughputChartProps {
  data: Array<{ time: string; count: number }>;
  timeFrame: 'day' | 'week' | 'month';
}

const chartConfig = {
  count: {
    label: "จำนวนผู้รับบริการ",
    color: "hsl(var(--chart-2))",
  },
}

const ThroughputChart: React.FC<ThroughputChartProps> = ({ data, timeFrame }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        ไม่มีข้อมูลผู้รับบริการในช่วงเวลานี้
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
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
                `${value} คน`,
                chartConfig.count.label
              ]}
            />} 
          />
          <Bar 
            dataKey="count" 
            fill="var(--color-count)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default ThroughputChart;
