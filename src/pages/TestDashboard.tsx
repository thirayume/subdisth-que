
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PlayCircle, Trash2, Settings, RefreshCw } from 'lucide-react';
import { useServicePoints } from '@/hooks/useServicePoints';
import { useQueueSimulation } from '@/hooks/queue/useQueueSimulation';
import { useQueueRecalculation } from '@/hooks/queue/useQueueRecalculation';
import { useQueues } from '@/hooks/useQueues';
import { useQueueRealtime } from '@/hooks/useQueueRealtime';
import QueueManagementContainer from '@/components/queue/management/QueueManagementContainer';
import QueueBoardContainer from '@/components/queue/board/QueueBoardContainer';
import PharmacyQueuePanel from '@/components/test/PharmacyQueuePanel';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';

const logger = createLogger('TestDashboard');

const TestDashboard = () => {
  const { servicePoints } = useServicePoints();
  const { simulateQueues, clearTestQueues } = useQueueSimulation();
  const { recalculateAllQueues } = useQueueRecalculation();
  const { fetchQueues } = useQueues();
  
  // State management with better persistence
  const [selectedServicePoints, setSelectedServicePoints] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoize enabled service points to prevent unnecessary re-renders
  const enabledServicePoints = useMemo(() => {
    return servicePoints.filter(sp => sp.enabled);
  }, [servicePoints]);

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

  // Set up centralized real-time subscription
  useQueueRealtime({
    channelName: 'test-dashboard-realtime',
    onQueueChange: useCallback(() => {
      logger.debug('Queue change detected, refreshing dashboard');
      forceRefresh();
    }, [forceRefresh])
  });

  // Initialize service point selections
  useEffect(() => {
    if (enabledServicePoints.length > 0 && !isInitialized) {
      const savedSelections = localStorage.getItem('test-dashboard-service-points');
      let newSelections: string[] = [];

      if (savedSelections) {
        try {
          const parsed = JSON.parse(savedSelections);
          // Validate that saved service points still exist and are enabled
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
      
      // Save to localStorage
      localStorage.setItem('test-dashboard-service-points', JSON.stringify(updated));
      logger.debug(`Updated service point ${index} to:`, servicePointId);
      
      return updated;
    });

    // Force refresh after service point change
    setTimeout(() => forceRefresh(), 100);
  }, [forceRefresh]);

  // Action handlers with proper error handling and refresh
  const handleSimulate = useCallback(async () => {
    try {
      logger.info('Starting queue simulation');
      toast.loading('กำลังสร้างคิวทดสอบ...', { id: 'simulate' });
      await simulateQueues(15);
      toast.success('สร้างคิวทดสอบเรียบร้อยแล้ว', { id: 'simulate' });
      // Force refresh after simulation
      setTimeout(() => forceRefresh(), 500);
      logger.info('Queue simulation completed');
    } catch (error) {
      logger.error('Error during simulation:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างคิวทดสอบ', { id: 'simulate' });
    }
  }, [simulateQueues, forceRefresh]);

  const handleRecalculate = useCallback(async () => {
    try {
      logger.info('Starting queue recalculation');
      toast.loading('กำลังคำนวณการมอบหมายใหม่...', { id: 'recalculate' });
      await recalculateAllQueues();
      toast.success('คำนวณการมอบหมายใหม่เรียบร้อยแล้ว', { id: 'recalculate' });
      // Force refresh after recalculation
      setTimeout(() => forceRefresh(), 500);
      logger.info('Queue recalculation completed');
    } catch (error) {
      logger.error('Error during recalculation:', error);
      toast.error('เกิดข้อผิดพลาดในการคำนวณการมอบหมายใหม่', { id: 'recalculate' });
    }
  }, [recalculateAllQueues, forceRefresh]);

  const handleClearQueues = useCallback(async () => {
    try {
      logger.info('Starting queue clearing');
      toast.loading('กำลังลบคิวทดสอบ...', { id: 'clear' });
      await clearTestQueues();
      toast.success('ลบคิวทดสอบเรียบร้อยแล้ว', { id: 'clear' });
      // Force refresh after clearing
      setTimeout(() => forceRefresh(), 500);
      logger.info('Test queues cleared');
    } catch (error) {
      logger.error('Error clearing test queues:', error);
      toast.error('เกิดข้อผิดพลาดในการลบคิวทดสอบ', { id: 'clear' });
    }
  }, [clearTestQueues, forceRefresh]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">ระบบทดสอบการจัดการคิว</h1>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleSimulate}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <PlayCircle className="w-4 h-4" />
              สร้างคิวทดสอบ (15 คิว)
            </Button>
            
            <Button 
              onClick={handleRecalculate}
              variant="outline"
              className="flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
            >
              <RefreshCw className="w-4 h-4" />
              คำนวณการมอบหมายใหม่
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleClearQueues}
              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              ลบคิวทดสอบ
            </Button>

            <Button 
              variant="outline"
              onClick={forceRefresh}
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-3 h-3" />
              รีเฟรช
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Queue Management & Board */}
        <div className="w-1/2 flex flex-col border-r bg-white">
          {/* Queue Management */}
          <div className="h-1/2 border-b overflow-hidden">
            <div className="h-full overflow-auto">
              <QueueManagementContainer key={`mgmt-${refreshKey}`} />
            </div>
          </div>
          
          {/* Queue Board */}
          <div className="h-1/2 overflow-hidden">
            <div className="h-full overflow-auto">
              <QueueBoardContainer key={`board-${refreshKey}`} />
            </div>
          </div>
        </div>

        {/* Right Side - Service Point Panels */}
        <div className="w-1/2 flex flex-col">
          {/* Panel Controls */}
          <div className="bg-gray-100 p-4 border-b flex-shrink-0">
            <h3 className="font-medium text-gray-900 mb-3">จุดบริการ</h3>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">
                    จุดบริการ {index + 1}
                  </label>
                  <Select
                    value={selectedServicePoints[index] || ''}
                    onValueChange={(value) => handleServicePointChange(index, value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={`เลือก SP${index + 1}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {enabledServicePoints.map(sp => (
                        <SelectItem key={sp.id} value={sp.id} className="text-xs">
                          {sp.code} - {sp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          {/* Service Point Panels */}
          <div className="flex-1 flex flex-col">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-1/3 border-b last:border-b-0 overflow-hidden">
                {selectedServicePoints[index] ? (
                  <PharmacyQueuePanel 
                    key={`panel-${index}-${selectedServicePoints[index]}-${refreshKey}`}
                    servicePointId={selectedServicePoints[index]}
                    title={`จุดบริการ ${index + 1}`}
                    refreshTrigger={refreshKey}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50">
                    <div className="text-center text-gray-500">
                      <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">เลือกจุดบริการ</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;
