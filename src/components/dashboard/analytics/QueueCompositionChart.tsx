
import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Queue } from '@/integrations/supabase/schema';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from '@/components/ui/chart';

interface QueueCompositionChartProps {
  waitingQueues: Queue[];
}

const chartConfig = {
  count: {
    label: "จำนวนคิว",
    color: "hsl(var(--chart-3))",
  },
}

const QueueCompositionChart: React.FC<QueueCompositionChartProps> = ({ waitingQueues }) => {
  // Count the queues by type using the actual data
  const generalCount = waitingQueues.filter(q => q.type === 'GENERAL').length;
  const elderlyCount = waitingQueues.filter(q => q.type === 'ELDERLY').length;
  const priorityCount = waitingQueues.filter(q => q.type === 'PRIORITY').length;
  const followUpCount = waitingQueues.filter(q => q.type === 'FOLLOW_UP').length;

  const data = [
    { type: 'ทั่วไป', count: generalCount },
    { type: 'ผู้สูงอายุ', count: elderlyCount },
    { type: 'เร่งด่วน', count: priorityCount },
    { type: 'ยาพิเศษ', count: followUpCount },
  ];

  // Check if all counts are zero
  const hasData = data.some(item => item.count > 0);

  if (!hasData) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        ไม่มีคิวรอในขณะนี้
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            type="number" 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            dataKey="type" 
            type="category" 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
            width={50}
          />
          <ChartTooltip 
            content={<ChartTooltipContent 
              labelFormatter={(value) => `ประเภท: ${value}`}
              formatter={(value, name) => [
                `${value} คิว`,
                chartConfig.count.label
              ]}
            />} 
          />
          <Bar 
            dataKey="count" 
            fill="var(--color-count)"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default QueueCompositionChart;
