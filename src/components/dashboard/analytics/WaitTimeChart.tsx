
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WaitTimeChartProps {
  data: Array<{ time: string; waitTime: number }>;
  timeFrame: 'day' | 'week' | 'month';
}

const WaitTimeChart: React.FC<WaitTimeChartProps> = ({ data, timeFrame }) => {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            label={{ value: timeFrame === 'day' ? 'เวลา' : 'วันที่', position: 'insideBottom', offset: -5 }} 
          />
          <YAxis label={{ value: 'เวลารอ (นาที)', angle: -90, position: 'insideLeft' }} />
          <Tooltip labelFormatter={(value) => `เวลา: ${value}`} />
          <Legend />
          <Line type="monotone" dataKey="waitTime" name="เวลารอ (นาที)" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WaitTimeChart;
