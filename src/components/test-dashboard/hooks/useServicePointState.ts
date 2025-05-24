
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useServicePoints } from '@/hooks/useServicePoints';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useServicePointState');

export const useServicePointState = (forceRefresh: () => void) => {
  const { servicePoints } = useServicePoints();
  const [selectedServicePoints, setSelectedServicePoints] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoize enabled service points to prevent unnecessary re-renders
  const enabledServicePoints = useMemo(() => {
    return servicePoints.filter(sp => sp.enabled);
  }, [servicePoints]);

  // Initialize service point selections
  useEffect(() => {
    if (enabledServicePoints.length > 0 && !isInitialized) {
      const savedSelections = localStorage.getItem('test-dashboard-service-points');
      let newSelections: string[] = [];

      if (savedSelections) {
        try {
          const parsed = JSON.parse(savedSelections);
          newSelections = parsed.filter((id: string) => 
            enabledServicePoints.some(sp => sp.id === id)
          );
          logger.debug('Loaded saved service point selections:', newSelections);
        } catch (error) {
          logger.warn('Failed to parse saved service points:', error);
        }
      }

      // If we don't have 3 valid selections, auto-assign from available
      while (newSelections.length < 3 && newSelections.length < enabledServicePoints.length) {
        const availableServicePoints = enabledServicePoints.filter(
          sp => !newSelections.includes(sp.id)
        );
        if (availableServicePoints.length > 0) {
          newSelections.push(availableServicePoints[0].id);
        } else {
          break;
        }
      }

      setSelectedServicePoints(newSelections);
      localStorage.setItem('test-dashboard-service-points', JSON.stringify(newSelections));
      setIsInitialized(true);
      logger.debug('Initialized service point selections:', newSelections);
    }
  }, [enabledServicePoints, isInitialized]);

  // Handle service point changes
  const handleServicePointChange = useCallback((index: number, servicePointId: string) => {
    setSelectedServicePoints(prev => {
      const updated = [...prev];
      updated[index] = servicePointId;
      
      localStorage.setItem('test-dashboard-service-points', JSON.stringify(updated));
      logger.debug(`Updated service point ${index} to:`, servicePointId);
      
      return updated;
    });

    setTimeout(() => forceRefresh(), 100);
  }, [forceRefresh]);

  return {
    selectedServicePoints,
    enabledServicePoints,
    handleServicePointChange
  };
};
