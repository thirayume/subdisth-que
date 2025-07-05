
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
}

export const useAnalyticsSimulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [simulationStats, setSimulationStats] = useState<SimulationStats>({
    prepared: false,
    totalQueues: 0,
    completedQueues: 0,
    avgWaitTime: 0
  });

  const { fetchQueues } = useQueues();
  const { patients } = usePatients();
  const { queueTypes } = useQueueTypes();
  const { servicePoints } = useServicePoints();

  // Realistic hospital timing patterns
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

    // Peak hours adjustment (9-11 AM, 2-4 PM)
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
      logger.info('Preparing realistic hospital simulation...');
      toast.info('กำลังเตรียมข้อมูลจำลองโรงพยาบาล...');

      if (!patients?.length || !queueTypes?.length || !servicePoints?.length) {
        toast.error('ต้องมีข้อมูลผู้ป่วย ประเภทคิว และจุดบริการก่อน');
        return;
      }

      // Clear existing simulation data
      await cleanup();

      // Generate realistic queue distribution
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const enabledQueueTypes = queueTypes.filter(qt => qt.enabled);
      const enabledServicePoints = servicePoints.filter(sp => sp.enabled);

      // Create realistic queue timeline (8 AM to 5 PM)
      const queues = [];
      const totalQueues = 75 + Math.floor(Math.random() * 25); // 75-100 queues

      for (let i = 0; i < totalQueues; i++) {
        // Simulate arrival times throughout the day
        const hour = 8 + Math.floor(Math.random() * 9); // 8 AM to 5 PM
        const minute = Math.floor(Math.random() * 60);
        const createdTime = new Date(today);
        createdTime.setHours(hour, minute, 0, 0);

        // Select queue type with realistic distribution
        const queueTypeDistribution = [
          ...Array(40).fill('GENERAL'),     // 40% general
          ...Array(25).fill('FOLLOW_UP'),   // 25% pharmacy
          ...Array(20).fill('ELDERLY'),     // 20% elderly
          ...Array(15).fill('PRIORITY')     // 15% priority
        ];
        const selectedType = queueTypeDistribution[Math.floor(Math.random() * queueTypeDistribution.length)];
        const queueType = enabledQueueTypes.find(qt => qt.code === selectedType) || enabledQueueTypes[0];

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
          number: i + 1,
          status,
          queue_date: todayStr,
          service_point_id: servicePoint.id,
          created_at: createdTime.toISOString(),
          called_at,
          completed_at,
          notes: `จำลองคิวโรงพยาบาล - ${queueType.name} (รอ: ${timing.waitMinutes}น, ให้บริการ: ${timing.serviceMinutes}น)`
        });
      }

      // Insert queues in batches
      const batchSize = 20;
      for (let i = 0; i < queues.length; i += batchSize) {
        const batch = queues.slice(i, i + batchSize);
        const { error } = await supabase
          .from('queues')
          .insert(batch);

        if (error) {
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
        avgWaitTime: Math.round(avgWait)
      });

      await fetchQueues();
      logger.info(`Created ${queues.length} realistic simulation queues`);
      toast.success(`เตรียมข้อมูลจำลองเรียบร้อย (${queues.length} คิว)`);

    } catch (error) {
      logger.error('Error preparing simulation:', error);
      toast.error('เกิดข้อผิดพลาดในการเตรียมข้อมูล');
    } finally {
      setLoading(false);
    }
  }, [patients, queueTypes, servicePoints, fetchQueues]);

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
          .like('notes', '%จำลองคิวโรงพยาบาล%')
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
          .like('notes', '%จำลองคิวโรงพยาบาล%')
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
      logger.info('Cleaning up simulation data...');
      toast.info('กำลังล้างข้อมูลจำลอง...');

      const { error } = await supabase
        .from('queues')
        .delete()
        .like('notes', '%จำลองคิวโรงพยาบาล%');

      if (error) {
        throw error;
      }

      setSimulationStats({
        prepared: false,
        totalQueues: 0,
        completedQueues: 0,
        avgWaitTime: 0
      });

      await fetchQueues();
      logger.info('Simulation data cleaned up');
      toast.success('ล้างข้อมูลจำลองเรียบร้อยแล้ว');

    } catch (error) {
      logger.error('Error cleaning up simulation:', error);
      toast.error('เกิดข้อผิดพลาดในการล้างข้อมูล');
    } finally {
      setLoading(false);
    }
  }, [fetchQueues]);

  return {
    isRunning,
    simulationStats,
    prepareSimulation,
    startTest,
    cleanup,
    loading
  };
};
