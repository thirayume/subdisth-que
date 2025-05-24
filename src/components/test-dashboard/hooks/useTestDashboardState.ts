
import { useState, useCallback, useMemo } from 'react';
import { useQueues } from '@/hooks/useQueues';
import { useQueueRealtime } from '@/hooks/useQueueRealtime';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useTestDashboardState');

export const useTestDashboardState = () => {
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

  return {
    refreshKey,
    forceRefresh
  };
};
