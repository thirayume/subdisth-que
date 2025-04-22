
import { useState } from 'react';

export type TimeFrame = 'day' | 'week' | 'month';

export const useTimeFrameState = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('day');
  
  return {
    timeFrame,
    setTimeFrame
  };
};
