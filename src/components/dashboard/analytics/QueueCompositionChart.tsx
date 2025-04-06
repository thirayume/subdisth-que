
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Queue } from '@/integrations/supabase/schema';

interface QueueCompositionChartProps {
  waitingQueues: Queue[];
}

const QueueCompositionChart: React.FC<QueueCompositionChartProps> = ({ waitingQueues }) => {
  const data = [
    { type: 'ทั่วไป', count: waitingQueues.filter(q => q.type === 'GENERAL').length },
    { type: 'ผู้สูงอายุ', count: waitingQueues.filter(q => q.type === 'ELDERLY').length },
    { type: 'เร่งด่วน', count: waitingQueues.filter(q => q.type === 'PRIORITY').length },
    { type: 'ยาพิเศษ', count: waitingQueues.filter(q => q.type === 'FOLLOW_UP').length },
  ];

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="type" type="category" />
          <Tooltip labelFormatter={(value) => `ประเภท: ${value}`} />
          <Legend />
          <Bar dataKey="count" name="จำนวนคิว" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default QueueCompositionChart;
