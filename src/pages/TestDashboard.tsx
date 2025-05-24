
import React, { useState, useCallback } from 'react';
import { useQueues } from '@/hooks/useQueues';
import { useQueueRealtime } from '@/hooks/useQueueRealtime';
import TestDashboardHeader from '@/components/test-dashboard/TestDashboardHeader';
import TestDashboardLeftPanel from '@/components/test-dashboard/TestDashboardLeftPanel';
import TestDashboardRightPanel from '@/components/test-dashboard/TestDashboardRightPanel';
import { useTestDashboardActions } from '@/components/test-dashboard/hooks/useTestDashboardActions';
import { useServicePointState } from '@/components/test-dashboard/hooks/useServicePointState';
import { createLogger } from '@/utils/logger';

const logger = createLogger('TestDashboard');

const TestDashboard = () => {
  const { fetchQueues } = useQueues();
  const [refreshKey, setRefreshKey] = useState(0);

  // Centralized refresh function
  const forceRefresh = useCallback(() => {
    logger.debug('Forcing refresh of all components');
    setRefreshKey(prev => {
      const newKey = prev + 1;
      logger.debug('New refresh key:', newKey);
      return newKey;
    });
    fetchQueues();
  }, [fetchQueues]);

  // Custom hooks for actions and state management
  const { handleSimulate, handleRecalculate, handleClearQueues } = useTestDashboardActions(forceRefresh);
  const { selectedServicePoints, enabledServicePoints, handleServicePointChange } = useServicePointState(forceRefresh);

  // Set up centralized real-time subscription
  useQueueRealtime({
    channelName: 'test-dashboard-realtime',
    onQueueChange: useCallback(() => {
      logger.debug('Queue change detected, refreshing dashboard');
      forceRefresh();
    }, [forceRefresh])
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <TestDashboardHeader
        onSimulate={handleSimulate}
        onRecalculate={handleRecalculate}
        onClearQueues={handleClearQueues}
        onForceRefresh={forceRefresh}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Queue Management & Board */}
        <TestDashboardLeftPanel refreshKey={refreshKey} />

        {/* Right Side - Service Point Panels */}
        <TestDashboardRightPanel
          selectedServicePoints={selectedServicePoints}
          enabledServicePoints={enabledServicePoints}
          refreshKey={refreshKey}
          onServicePointChange={handleServicePointChange}
        />
      </div>
    </div>
  );
};

export default TestDashboard;
