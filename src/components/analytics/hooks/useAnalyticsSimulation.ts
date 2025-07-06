import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { useQueueTypes } from '@/hooks/useQueueTypes';
import { useServicePoints } from '@/hooks/useServicePoints';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AnalyticsSimulation');

interface SimulationStats {
  prepared: boolean;
  totalQueues: number;
  completedQueues: number;
  avgWaitTime: number;
  isSimulationMode: boolean;
  queueTypeDistribution: Record<string, number>;
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
    queueTypeDistribution: {}
  });

  const { fetchQueues } = useQueues();
  const { patients } = usePatients();
  const { queueTypes } = useQueueTypes();
  const { servicePoints } = useServicePoints();

  // Enhanced cleanup - clears ALL queues from today
  const completeCleanup = useCallback(async () => {
    try {
      logger.info('Starting complete cleanup of all today\'s queues...');
      toast.info('กำลังล้างข้อมูลคิววันนี้ทั้งหมด...');

      const today = new Date().toISOString().split('T')[0];

      // Get count of queues to be deleted first
      const { data: queueCount, error: countError } = await supabase
        .from('queues')
        .select('id', { count: 'exact' })
        .eq('queue_date', today);

      if (countError) {
        logger.error('Error counting queues:', countError);
        throw countError;
      }

      if (!queueCount || queueCount.length === 0) {
        logger.info('No queues found for today');
        toast.info('ไม่พบข้อมูลคิววันนี้ที่จะลบ');
        return 0;
      }

      logger.info(`Found ${queueCount.length} queues to delete for today`);

      // Delete all queues from today
      const { error: deleteError } = await supabase
        .from('queues')
        .delete()
        .eq('queue_date', today);

      if (deleteError) {
        logger.error('Error deleting queues:', deleteError);
        throw deleteError;
      }

      logger.info(`Successfully deleted ${queueCount.length} queues from today`);
      toast.success(`ล้างข้อมูลคิววันนี้เรียบร้อยแล้ว (${queueCount.length} คิว)`);

      return queueCount.length;
    } catch (error) {
      logger.error('Error in complete cleanup:', error);
      throw error;
    }
  }, []);

  const getRealisticTiming = (queueType: string, hour: number) => {
    const baseWaitTimes = {
      'GENERAL': { min: 10, max: 30 },
      'ELDERLY': { min: 5, max: 20 }, // Priority
      'PRIORITY': { min: 2, max: 10 }, // Emergency
      'FOLLOW_UP': { min: 15, max: 45 } // Pharmacy
    };

    const baseServiceTimes = {
      'GENERAL': { min: 8, max: 15 },
      'ELDERLY': { min: 10, max: 20 },  
      'PRIORITY': { min: 5, max: 12 },
      'FOLLOW_UP': { min: 3, max: 8 } // Pharmacy faster
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
        queueTypeDistribution: typeDistribution
      });

      // Force refresh the queue data
      await fetchQueues();
      
      logger.info(`Created ${queues.length} realistic simulation queues with distribution:`, typeDistribution);
      toast.success(`🔬 เตรียมข้อมูลจำลองเรียบร้อย (${queues.length} คิว) | ครอบคลุมทุกประเภท: ${Object.keys(typeDistribution).join(', ')}`);

    } catch (error) {
      logger.error('Error preparing simulation:', error);
      toast.error(`เกิดข้อผิดพลาดในการเตรียมข้อมูล: ${error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ'}`);
    } finally {
      setLoading(false);
    }
  }, [patients, queueTypes, servicePoints, fetchQueues, completeCleanup]);

  const startTest = useCallback(async () => {
    if (!simulationStats.prepared) {
      toast.error('กรุณาเตรียมข้อมูลก่อนทดสอบ');
      return;
    }

    setIsRunning(true);
    toast.info('เริ่มจำลองการทำงานของระบบคิว...');

    try {
      // Simulate real-time queue progression
      const interval = setInterval(async () => {
        // Update some waiting queues to active
        const { data: waitingQueues } = await supabase
          .from('queues')
          .select('*')
          .eq('status', 'WAITING')
          .like('notes', '%ข้อมูลจำลองโรงพยาบาล%')
          .limit(2);

        if (waitingQueues && waitingQueues.length > 0) {
          const updatePromises = waitingQueues.map(queue => 
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

        // Complete some active queues
        const { data: activeQueues } = await supabase
          .from('queues')
          .select('*')
          .eq('status', 'ACTIVE')
          .like('notes', '%ข้อมูลจำลองโรงพยาบาล%')
          .limit(1);

        if (activeQueues && activeQueues.length > 0) {
          await supabase
            .from('queues')
            .update({
              status: 'COMPLETED',
              completed_at: new Date().toISOString()
            })
            .eq('id', activeQueues[0].id);
        }

        await fetchQueues();
      }, 3000); // Update every 3 seconds

      // Stop after 30 seconds
      setTimeout(() => {
        clearInterval(interval);
        setIsRunning(false);
        toast.success('การจำลองเสร็จสิ้น - ตรวจสอบผลลัพธ์ในกราฟด้านล่าง');
      }, 30000);

    } catch (error) {
      logger.error('Error during test simulation:', error);
      toast.error('เกิดข้อผิดพลาดในการทดสอบ');
      setIsRunning(false);
    }
  }, [simulationStats.prepared, fetchQueues]);

  const cleanup = useCallback(async () => {
    setLoading(true);
    try {
      logger.info('Starting comprehensive cleanup...');
      toast.info('กำลังล้างข้อมูลทั้งหมด...');

      // Use complete cleanup function
      const deletedCount = await completeCleanup();

      // Reset simulation stats
      setSimulationStats({
        prepared: false,
        totalQueues: 0,
        completedQueues: 0,
        avgWaitTime: 0,
        isSimulationMode: false,
        queueTypeDistribution: {}
      });

      // Force refresh the queue data multiple times to ensure UI updates
      await fetchQueues();
      
      // Add a small delay and refresh again to ensure the data is updated
      setTimeout(async () => {
        await fetchQueues();
      }, 1000);

      logger.info('Comprehensive cleanup completed');
      toast.success(`ล้างข้อมูลทั้งหมดเรียบร้อยแล้ว (ลบ ${deletedCount} คิว) - กลับสู่โหมดข้อมูลจริง`);

    } catch (error) {
      logger.error('Error in comprehensive cleanup:', error);
      const errorMessage = error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ';
      toast.error(`เกิดข้อผิดพลาดในการล้างข้อมูล: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [completeCleanup, fetchQueues]);

  return {
    isRunning,
    simulationStats,
    prepareSimulation,
    startTest,
    cleanup,
    loading
  };
};
