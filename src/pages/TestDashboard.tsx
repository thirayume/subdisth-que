
import React, { useState, useCallback, useMemo } from 'react';
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
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

  // Optimized refresh function with debouncing
  const forceRefresh = useCallback(() => {
    const now = Date.now();
    
    // Prevent rapid successive refreshes (debounce 300ms)
    if (now - lastRefreshTime < 300) {
      logger.debug('Skipping refresh due to debouncing');
      return;
    }
    
    logger.debug('Forcing refresh of all components');
    setLastRefreshTime(now);
    setRefreshKey(prev => {
      const newKey = prev + 1;
      logger.debug('New refresh key:', newKey);
      return newKey;
    });
    
    // Fetch queues with a small delay to ensure state updates are processed
    setTimeout(() => {
      fetchQueues();
    }, 100);
  }, [fetchQueues, lastRefreshTime]);

  // Custom hooks for actions and state management
  const { handleSimulate, handleRecalculate, handleClearQueues } = useTestDashboardActions(forceRefresh);
  const { 
    selectedServicePoints, 
    enabledServicePoints, 
    handleServicePointChange,
    loading: servicePointLoading,
    isInitialized
  } = useServicePointState(forceRefresh);

  // Optimized real-time subscription with proper debouncing
  const realtimeCallback = useCallback(() => {
    logger.debug('Queue change detected via realtime, refreshing dashboard');
    forceRefresh();
  }, [forceRefresh]);

  useQueueRealtime({
    channelName: 'test-dashboard-realtime',
    onQueueChange: realtimeCallback,
    enabled: true,
    debounceMs: 500
  });

  // Memoize props to prevent unnecessary re-renders
  const rightPanelProps = useMemo(() => ({
    selectedServicePoints,
    enabledServicePoints,
    refreshKey,
    onServicePointChange: handleServicePointChange,
    loading: servicePointLoading
  }), [selectedServicePoints, enabledServicePoints, refreshKey, handleServicePointChange, servicePointLoading]);

  const headerProps = useMemo(() => ({
    onSimulate: handleSimulate,
    onRecalculate: handleRecalculate,
    onClearQueues: handleClearQueues,
    onForceRefresh: forceRefresh
  }), [handleSimulate, handleRecalculate, handleClearQueues, forceRefresh]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <TestDashboardHeader {...headerProps} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Side - Queue Management & Board */}
        <TestDashboardLeftPanel refreshKey={refreshKey} />

        {/* Right Side - Service Point Panels */}
        <TestDashboardRightPanel {...rightPanelProps} />
      </div>
    </div>
  );
};

export default TestDashboard;
