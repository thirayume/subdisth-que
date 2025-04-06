
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TabSelectorProps {
  timeFrame: 'day' | 'week' | 'month';
  setTimeFrame: (value: 'day' | 'week' | 'month') => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({ timeFrame, setTimeFrame }) => {
  return (
    <div className="flex justify-end mb-2">
      <TabsList>
        <TabsTrigger 
          value="day" 
          className={timeFrame === 'day' ? 'bg-blue-100' : ''}
          onClick={() => setTimeFrame('day')}
        >
          วันนี้
        </TabsTrigger>
        <TabsTrigger 
          value="week" 
          className={timeFrame === 'week' ? 'bg-blue-100' : ''}
          onClick={() => setTimeFrame('week')}
        >
          7 วัน
        </TabsTrigger>
        <TabsTrigger 
          value="month" 
          className={timeFrame === 'month' ? 'bg-blue-100' : ''}
          onClick={() => setTimeFrame('month')}
        >
          30 วัน
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default TabSelector;
