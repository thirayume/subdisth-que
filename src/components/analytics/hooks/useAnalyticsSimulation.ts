import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { useQueueTypes } from '@/hooks/useQueueTypes';
import { useServicePoints } from '@/hooks/useServicePoints';
import { useQueryClient } from '@tanstack/react-query';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AnalyticsSimulation');

export type SimulationPhase = 'IDLE' | 'PREPARING' | 'PREPARED' | 'RUNNING_30' | 'PAUSE_30' | 'RUNNING_70' | 'PAUSE_70' | 'RUNNING_100' | 'COMPLETED';

interface AlgorithmMetrics {
  algorithm: string;
  avgWaitTime: number;
  throughput: number;
  completedQueues: number;
  timestamp: string;
}

interface SimulationStats {
  prepared: boolean;
  totalQueues: number;
  completedQueues: number;
  avgWaitTime: number;
  isSimulationMode: boolean;
  queueTypeDistribution: Record<string, number>;
  phase: SimulationPhase;
  progress: number;
  algorithmMetrics: AlgorithmMetrics[];
  currentAlgorithm: string;
}

export const useAnalyticsSimulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [simulationStats, setSimulationStats] = useState<SimulationStats>({
    prepared: false,
    totalQueues: 0,
    completedQueues: 0,
    avgWaitTime: 0,
    isSimulationMode: false,
    queueTypeDistribution: {},
    phase: 'IDLE',
    progress: 0,
    algorithmMetrics: [],
    currentAlgorithm: 'FIFO'
  });

  const queryClient = useQueryClient();
  const { fetchQueues } = useQueues();
  const { patients } = usePatients();
  const { queueTypes } = useQueueTypes();
  const { servicePoints } = useServicePoints();

  // Enhanced cleanup with comprehensive logging and date-agnostic filtering
  const completeCleanup = useCallback(async () => {
    const startTime = Date.now();
    logger.info('🧹 CLEANUP STARTED - User clicked cleanup button', { timestamp: new Date().toISOString() });
    
    try {
      // Step 1: Show loading and log start
      toast.info('🔍 กำลังค้นหาข้อมูลจำลอง...');
      logger.info('Step 1: Searching for simulation queues');

      // First, try to find simulation queues by notes pattern (regardless of date)
      const { data: simulationQueues, error: simCheckError } = await supabase
        .from('queues')
        .select('id, notes, queue_date, created_at', { count: 'exact' })
        .like('notes', '%ข้อมูลจำลองโรงพยาบาล%');

      if (simCheckError) {
        logger.error('❌ Error checking simulation queues:', simCheckError);
        throw simCheckError;
      }

      logger.info(`🔍 Found ${simulationQueues?.length || 0} simulation queues:`, 
        simulationQueues?.map(q => ({ id: q.id, date: q.queue_date, created: q.created_at })));

      let deletedCount = 0;
      let deletionStrategy = '';

      if (simulationQueues && simulationQueues.length > 0) {
        // Delete simulation queues
        toast.info(`🗑️ กำลังลบคิวจำลอง ${simulationQueues.length} คิว...`);
        logger.info('Step 2: Deleting simulation queues by pattern matching');
        
        const { error: deleteSimError } = await supabase
          .from('queues')
          .delete()
          .like('notes', '%ข้อมูลจำลองโรงพยาบาล%');

        if (deleteSimError) {
          logger.error('❌ Error deleting simulation queues:', deleteSimError);
          throw deleteSimError;
        }
        
        deletedCount = simulationQueues.length;
        deletionStrategy = 'simulation-only';
      } else {
        // No simulation queues found, delete all today's queues as fallback
        const today = new Date().toISOString().split('T')[0];
        logger.info('Step 2: No simulation queues found, checking today\'s queues as fallback');
        toast.info('⚠️ ไม่พบคิวจำลอง กำลังตรวจสอบคิววันนี้...');

        const { data: todayQueues, error: todayCheckError } = await supabase
          .from('queues')
          .select('id, notes', { count: 'exact' })
          .eq('queue_date', today);

        if (todayCheckError) {
          logger.error('❌ Error checking today queues:', todayCheckError);
          throw todayCheckError;
        }

        logger.info(`📅 Found ${todayQueues?.length || 0} queues for today (${today})`);

        if (todayQueues && todayQueues.length > 0) {
          toast.info(`🗑️ กำลังลบคิววันนี้ ${todayQueues.length} คิว...`);
          
          const { error: deleteTodayError } = await supabase
            .from('queues')
            .delete()
            .eq('queue_date', today);

          if (deleteTodayError) {
            logger.error('❌ Error deleting today queues:', deleteTodayError);
            throw deleteTodayError;
          }
          
          deletedCount = todayQueues.length;
          deletionStrategy = 'today-fallback';
        }
      }

      // Step 3: Verify deletion
      toast.info('✅ กำลังตรวจสอบการลบข้อมูล...');
      logger.info('Step 3: Verifying deletion');

      const { data: remainingSimQueues } = await supabase
        .from('queues')
        .select('id', { count: 'exact' })
        .like('notes', '%ข้อมูลจำลองโรงพยาบาล%');

      const remainingSimCount = remainingSimQueues?.length || 0;
      logger.info(`✅ Verification: ${remainingSimCount} simulation queues remaining after cleanup`);

      // Step 4: Force complete state and cache reset
      toast.info('🔄 กำลังรีเซ็ตระบบ...');
      logger.info('Step 4: Resetting all states and cache');

      // Clear localStorage simulation data
      try {
        localStorage.removeItem('queueAlgorithm');
        localStorage.removeItem('simulationMode');
        localStorage.removeItem('algorithmMetrics');
      } catch (e) {
        logger.warn('LocalStorage clear failed:', e);
      }

      // Force complete React Query cache refresh
      await queryClient.clear(); // Clear ALL cached data first
      await queryClient.invalidateQueries(); // Invalidate all queries
      await queryClient.refetchQueries({ queryKey: ['queues'] }); // Force refetch

      const duration = Date.now() - startTime;
      logger.info(`🎉 CLEANUP COMPLETED successfully`, {
        deletedCount,
        deletionStrategy,
        remainingSimCount,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });

      if (deletedCount > 0) {
        toast.success(`🎉 ล้างข้อมูลเรียบร้อยแล้ว (ลบ ${deletedCount} คิว, เหลือจำลอง ${remainingSimCount} คิว) - กลับสู่โหมดข้อมูลจริง`);
      } else {
        toast.success('✨ ระบบสะอาดแล้ว - ไม่พบข้อมูลที่ต้องลบ - กลับสู่โหมดข้อมูลจริง');
      }

      return deletedCount;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('💥 CLEANUP FAILED:', {
        error: error instanceof Error ? error.message : error,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }, [queryClient]);

  const getRealisticTiming = (queueType: string, hour: number) => {
    const baseWaitTimes = {
      'GENERAL': { min: 10, max: 30 },
      'ELDERLY': { min: 5, max: 20 }, // Priority
      'PRIORITY': { min: 2, max: 10 }, // Emergency
      'APPOINTMENT': { min: 15, max: 45 }, // Scheduled appointments
      'FOLLOW_UP': { min: 12, max: 35 } // Follow-up visits
    };

    const baseServiceTimes = {
      'GENERAL': { min: 8, max: 15 },
      'ELDERLY': { min: 10, max: 20 },  
      'PRIORITY': { min: 5, max: 12 },
      'APPOINTMENT': { min: 3, max: 8 }, // Appointments faster
      'FOLLOW_UP': { min: 5, max: 10 } // Follow-up visits
    };

    const isPeakHour = (hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16);
    const peakMultiplier = isPeakHour ? 1.5 : 1;

    const waitTime = baseWaitTimes[queueType as keyof typeof baseWaitTimes] || baseWaitTimes.GENERAL;
    const serviceTime = baseServiceTimes[queueType as keyof typeof baseServiceTimes] || baseServiceTimes.GENERAL;

    return {
      waitMinutes: Math.floor((waitTime.min + Math.random() * (waitTime.max - waitTime.min)) * peakMultiplier),
      serviceMinutes: Math.floor(serviceTime.min + Math.random() * (serviceTime.max - serviceTime.min))
    };
  };

  const prepareSimulation = useCallback(async () => {
    setLoading(true);
    try {
      logger.info('Preparing comprehensive simulation with complete cleanup...');
      toast.info('กำลังเตรียมข้อมูลจำลองแบบครอบคลุม...');

      if (!patients?.length || !queueTypes?.length || !servicePoints?.length) {
        toast.error('ต้องมีข้อมูลผู้ป่วย ประเภทคิว และจุดบริการก่อน');
        return;
      }

      // Step 1: Complete cleanup of all today's data
      const deletedCount = await completeCleanup();
      
      // Step 2: Generate fresh realistic simulation data using ALL available queue types
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const enabledQueueTypes = queueTypes.filter(qt => qt.enabled);
      const enabledServicePoints = servicePoints.filter(sp => sp.enabled);

      if (enabledQueueTypes.length === 0) {
        toast.error('ไม่พบประเภทคิวที่เปิดใช้งาน');
        return;
      }

      logger.info(`Using ${enabledQueueTypes.length} queue types:`, enabledQueueTypes.map(qt => qt.code));

      // Create realistic queue timeline (8 AM to 5 PM) with better distribution
      const queues = [];
      const totalQueues = 75 + Math.floor(Math.random() * 25); // 75-100 queues
      const typeDistribution: Record<string, number> = {};

      // Initialize distribution counter
      enabledQueueTypes.forEach(qt => {
        typeDistribution[qt.code] = 0;
      });

      for (let i = 0; i < totalQueues; i++) {
        // Simulate arrival times throughout the day
        const hour = 8 + Math.floor(Math.random() * 9); // 8 AM to 5 PM
        const minute = Math.floor(Math.random() * 60);
        const createdTime = new Date(today);
        createdTime.setHours(hour, minute, 0, 0);

        // Use ALL available queue types with even distribution
        const queueType = enabledQueueTypes[i % enabledQueueTypes.length];
        typeDistribution[queueType.code]++;

        // Assign service point based on queue type
        const servicePoint = enabledServicePoints[Math.floor(Math.random() * enabledServicePoints.length)];
        const patient = patients[Math.floor(Math.random() * patients.length)];

        // Get realistic timing
        const timing = getRealisticTiming(queueType.code, hour);
        
        // Calculate timeline
        const calledTime = new Date(createdTime.getTime() + timing.waitMinutes * 60000);
        const completedTime = new Date(calledTime.getTime() + timing.serviceMinutes * 60000);

        // Determine status based on current time
        const now = new Date();
        let status = 'WAITING';
        let called_at = null;
        let completed_at = null;

        if (calledTime <= now) {
          status = 'ACTIVE';
          called_at = calledTime.toISOString();
          
          if (completedTime <= now) {
            status = 'COMPLETED';
            completed_at = completedTime.toISOString();
          }
        }

        queues.push({
          patient_id: patient.id,
          type: queueType.code,
          number: typeDistribution[queueType.code],
          status,
          queue_date: todayStr,
          service_point_id: servicePoint.id,
          created_at: createdTime.toISOString(),
          called_at,
          completed_at,
          notes: `🔬 ข้อมูลจำลองโรงพยาบาล - ${queueType.name} (รอ: ${timing.waitMinutes}น, ให้บริการ: ${timing.serviceMinutes}น)`
        });
      }

      logger.info('Queue type distribution:', typeDistribution);

      // Insert queues in batches
      const batchSize = 20;
      for (let i = 0; i < queues.length; i += batchSize) {
        const batch = queues.slice(i, i + batchSize);
        const { error } = await supabase
          .from('queues')
          .insert(batch);

        if (error) {
          logger.error('Error inserting batch:', error);
          throw error;
        }
      }

      // Update stats
      const completedCount = queues.filter(q => q.status === 'COMPLETED').length;
      const avgWait = queues
        .filter(q => q.called_at)
        .reduce((sum, q) => {
          const wait = (new Date(q.called_at!).getTime() - new Date(q.created_at).getTime()) / 60000;
          return sum + wait;
        }, 0) / Math.max(queues.filter(q => q.called_at).length, 1);

      setSimulationStats({
        prepared: true,
        totalQueues: queues.length,
        completedQueues: completedCount,
        avgWaitTime: Math.round(avgWait),
        isSimulationMode: true,
        queueTypeDistribution: typeDistribution,
        phase: 'PREPARED',
        progress: 0,
        algorithmMetrics: [],
        currentAlgorithm: 'FIFO'
      });

      // Force refresh the queue data with cache invalidation
      await queryClient.invalidateQueries({ queryKey: ['queues'] });
      await fetchQueues(true);
      
      logger.info(`Created ${queues.length} realistic simulation queues with distribution:`, typeDistribution);
      toast.success(`🔬 เตรียมข้อมูลจำลองเรียบร้อย (${queues.length} คิว) | ครอบคลุมทุกประเภท: ${Object.keys(typeDistribution).join(', ')}`);

    } catch (error) {
      logger.error('Error preparing simulation:', error);
      toast.error(`เกิดข้อผิดพลาดในการเตรียมข้อมูล: ${error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ'}`);
    } finally {
      setLoading(false);
    }
  }, [patients, queueTypes, servicePoints, fetchQueues, completeCleanup]);

  // Progressive simulation with algorithm decision points
  const startProgressiveTest = useCallback(async () => {
    if (!simulationStats.prepared) {
      toast.error('กรุณาเตรียมข้อมูลก่อนทดสอบ');
      return;
    }

    setIsRunning(true);
    setSimulationStats(prev => ({ ...prev, phase: 'RUNNING_30', progress: 0 }));
    toast.info('เริ่มจำลองแบบก้าวหน้า - เฟส 1 (0-30%)');

    try {
      let progress = 0;
      const totalDuration = 60000; // 60 seconds total
      const updateInterval = 2000; // Update every 2 seconds
      const maxProgress30 = 30;
      
      const interval = setInterval(async () => {
        progress += (maxProgress30 / (totalDuration * 0.3 / updateInterval));
        
        // Apply algorithm-based queue processing
        await applyAlgorithmToSimulation(simulationStats.currentAlgorithm);

        setSimulationStats(prev => ({ ...prev, progress: Math.min(progress, maxProgress30) }));
        await fetchQueues(true);

        // Pause at 30% for algorithm decision
        if (progress >= maxProgress30) {
          clearInterval(interval);
          setIsRunning(false);
          setSimulationStats(prev => ({ 
            ...prev, 
            phase: 'PAUSE_30', 
            progress: 30 
          }));
          
          // Capture current metrics
          const metrics = await captureCurrentMetrics(simulationStats.currentAlgorithm);
          setSimulationStats(prev => ({ 
            ...prev, 
            algorithmMetrics: [...prev.algorithmMetrics, metrics] 
          }));
          
          toast.success('🎯 เฟส 1 เสร็จสิ้น (30%) - พร้อมตัดสินใจเปลี่ยนอัลกอริธึม');
        }
      }, updateInterval);

    } catch (error) {
      logger.error('Error during progressive simulation:', error);
      toast.error('เกิดข้อผิดพลาดในการทดสอบ');
      setIsRunning(false);
    }
  }, [simulationStats.prepared, fetchQueues]);

  // Capture performance metrics at decision points
  const captureCurrentMetrics = useCallback(async (algorithm: string): Promise<AlgorithmMetrics> => {
    const { data: completedQueues } = await supabase
      .from('queues')
      .select('*')
      .eq('status', 'COMPLETED')
      .like('notes', '%ข้อมูลจำลองโรงพยาบาล%');

    const { data: allQueues } = await supabase
      .from('queues')
      .select('*')
      .like('notes', '%ข้อมูลจำลองโรงพยาบาล%');

    const avgWaitTime = completedQueues?.reduce((sum, queue) => {
      if (queue.called_at && queue.created_at) {
        const wait = (new Date(queue.called_at).getTime() - new Date(queue.created_at).getTime()) / 60000;
        return sum + wait;
      }
      return sum;
    }, 0) / Math.max(completedQueues?.length || 1, 1);

    return {
      algorithm,
      avgWaitTime: Math.round(avgWaitTime || 0),
      throughput: completedQueues?.length || 0,
      completedQueues: completedQueues?.length || 0,
      timestamp: new Date().toISOString()
    };
  }, []);

  // Apply algorithm-specific queue processing during simulation
  const applyAlgorithmToSimulation = useCallback(async (algorithm: string) => {
    const { data: waitingQueues } = await supabase
      .from('queues')
      .select('*')
      .eq('status', 'WAITING')
      .like('notes', '%ข้อมูลจำลองโรงพยาบาล%')
      .order('created_at', { ascending: true });

    if (!waitingQueues || waitingQueues.length === 0) return;

    // Apply different processing logic based on algorithm
    let queuesToProcess = [...waitingQueues];
    
    switch (algorithm) {
      case 'FIFO':
        // Process in order of arrival (already sorted by created_at)
        queuesToProcess = queuesToProcess.slice(0, Math.floor(Math.random() * 3) + 1);
        break;
        
      case 'PRIORITY':
        // Prioritize PRIORITY and ELDERLY queues first
        queuesToProcess.sort((a, b) => {
          const aPriority = ['PRIORITY', 'ELDERLY'].includes(a.type) ? 0 : 1;
          const bPriority = ['PRIORITY', 'ELDERLY'].includes(b.type) ? 0 : 1;
          return aPriority - bPriority;
        });
        queuesToProcess = queuesToProcess.slice(0, Math.floor(Math.random() * 4) + 2); // Process more
        break;
        
      case 'MULTILEVEL':
        // Process by queue type levels
        const typeOrder = ['PRIORITY', 'ELDERLY', 'GENERAL', 'APPOINTMENT'];
        queuesToProcess.sort((a, b) => {
          const aIndex = typeOrder.indexOf(a.type);
          const bIndex = typeOrder.indexOf(b.type);
          return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
        });
        queuesToProcess = queuesToProcess.slice(0, Math.floor(Math.random() * 3) + 2);
        break;
        
      default:
        queuesToProcess = queuesToProcess.slice(0, Math.floor(Math.random() * 2) + 1);
    }

    // Update selected queues to ACTIVE
    if (queuesToProcess.length > 0) {
      const updatePromises = queuesToProcess.map(queue => 
        supabase
          .from('queues')
          .update({
            status: 'ACTIVE',
            called_at: new Date().toISOString()
          })
          .eq('id', queue.id)
      );
      await Promise.all(updatePromises);
    }

    // Complete some active queues (algorithm affects completion rate)
    const { data: activeQueues } = await supabase
      .from('queues')
      .select('*')
      .eq('status', 'ACTIVE')
      .like('notes', '%ข้อมูลจำลองโรงพยาบาล%')
      .limit(algorithm === 'PRIORITY' ? 3 : 2); // Priority algorithm completes faster

    if (activeQueues && activeQueues.length > 0) {
      const completePromises = activeQueues.map(queue =>
        supabase
          .from('queues')
          .update({
            status: 'COMPLETED',
            completed_at: new Date().toISOString()
          })
          .eq('id', queue.id)
      );
      await Promise.all(completePromises);
    }
  }, []);

  // Continue to phase 2 (70%)
  const continueToPhase2 = useCallback(async (newAlgorithm?: string) => {
    setIsRunning(true);
    setSimulationStats(prev => ({ 
      ...prev, 
      phase: 'RUNNING_70', 
      currentAlgorithm: newAlgorithm || prev.currentAlgorithm 
    }));
    
    if (newAlgorithm) {
      toast.info(`🔄 เปลี่ยนอัลกอริธึมเป็น ${newAlgorithm} - เริ่มเฟส 2 (30-70%)`);
    } else {
      toast.info('▶️ ดำเนินต่อเฟส 2 (30-70%) ด้วยอัลกอริธึมเดิม');
    }

    // Continue simulation for phase 2
    let progress = 30;
    const interval = setInterval(async () => {
      progress += 2;
      
      // Apply algorithm-based queue processing
      await applyAlgorithmToSimulation(simulationStats.currentAlgorithm);

      setSimulationStats(prev => ({ ...prev, progress: Math.min(progress, 70) }));
      await fetchQueues(true);

      if (progress >= 70) {
        clearInterval(interval);
        setIsRunning(false);
        setSimulationStats(prev => ({ ...prev, phase: 'PAUSE_70', progress: 70 }));
        
        const metrics = await captureCurrentMetrics(simulationStats.currentAlgorithm);
        setSimulationStats(prev => ({ 
          ...prev, 
          algorithmMetrics: [...prev.algorithmMetrics, metrics] 
        }));
        
        toast.success('🎯 เฟส 2 เสร็จสิ้น (70%) - พร้อมตัดสินใจครั้งสุดท้าย');
      }
    }, 2000);
  }, [simulationStats.currentAlgorithm, fetchQueues, captureCurrentMetrics]);

  // Complete final phase
  const completeSimulation = useCallback(async (finalAlgorithm?: string) => {
    setIsRunning(true);
    setSimulationStats(prev => ({ 
      ...prev, 
      phase: 'RUNNING_100', 
      currentAlgorithm: finalAlgorithm || prev.currentAlgorithm 
    }));
    
    toast.info('🏁 เฟสสุดท้าย (70-100%) - จบการจำลอง');

    let progress = 70;
    const interval = setInterval(async () => {
      progress += 3;
      
      setSimulationStats(prev => ({ ...prev, progress: Math.min(progress, 100) }));
      await fetchQueues(true);

      if (progress >= 100) {
        clearInterval(interval);
        setIsRunning(false);
        
        const finalMetrics = await captureCurrentMetrics(simulationStats.currentAlgorithm);
        setSimulationStats(prev => ({ 
          ...prev, 
          phase: 'COMPLETED', 
          progress: 100,
          algorithmMetrics: [...prev.algorithmMetrics, finalMetrics]
        }));
        
        toast.success('🎉 การจำลองเสร็จสมบูรณ์ - ดูผลเปรียบเทียบอัลกอริธึม');
      }
    }, 1500);
  }, [simulationStats.currentAlgorithm, fetchQueues, captureCurrentMetrics]);

  // Legacy simple test for backward compatibility
  const startTest = startProgressiveTest;

  const cleanup = useCallback(async () => {
    setLoading(true);
    logger.info('🧹 MANUAL CLEANUP BUTTON CLICKED - Starting comprehensive cleanup...');
    
    try {
      // Use complete cleanup function with all enhancements
      const deletedCount = await completeCleanup();

      // Reset simulation stats completely to initial state
      logger.info('📊 Resetting simulation state to initial values');
      setSimulationStats({
        prepared: false,
        totalQueues: 0,
        completedQueues: 0,
        avgWaitTime: 0,
        isSimulationMode: false,
        queueTypeDistribution: {},
        phase: 'IDLE',
        progress: 0,
        algorithmMetrics: [],
        currentAlgorithm: 'FIFO'
      });

      // Force complete data refresh with multiple methods
      logger.info('🔄 Forcing data refresh and cache reset');
      await queryClient.clear(); // Clear all cache first
      await queryClient.invalidateQueries(); // Invalidate all queries
      await fetchQueues(true); // Force fetch with fresh data
      
      // Set additional timeouts to ensure UI updates
      setTimeout(async () => {
        await queryClient.refetchQueries({ queryKey: ['queues'], stale: true });
        await fetchQueues(true);
      }, 500);

      setTimeout(async () => {
        await fetchQueues(true);
      }, 1500);

      logger.info('✅ Manual cleanup completed successfully');

    } catch (error) {
      logger.error('💥 Manual cleanup failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ';
      toast.error(`เกิดข้อผิดพลาดในการล้างข้อมูล: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [completeCleanup, fetchQueues, queryClient]);

  return {
    isRunning,
    simulationStats,
    prepareSimulation,
    startTest,
    startProgressiveTest,
    continueToPhase2,
    completeSimulation,
    cleanup,
    loading,
    captureCurrentMetrics
  };
};
