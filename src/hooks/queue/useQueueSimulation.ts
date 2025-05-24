
import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { useQueueTypes } from '@/hooks/useQueueTypes';
import { useServicePoints } from '@/hooks/useServicePoints';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueueSimulation');

export const useQueueSimulation = () => {
  const { fetchQueues } = useQueues();
  const { patients } = usePatients();
  const { queueTypes } = useQueueTypes();
  const { servicePoints } = useServicePoints();

  const simulateQueues = useCallback(async (count: number = 15) => {
    try {
      logger.info('Starting queue simulation...');
      toast.info(`กำลังสร้างคิวทดสอบ ${count} คิว...`);

      if (!patients || patients.length === 0) {
        toast.error('ไม่พบข้อมูลผู้ป่วยสำหรับการสร้างคิว');
        return;
      }

      if (!queueTypes || queueTypes.length === 0) {
        toast.error('ไม่พบประเภทคิวสำหรับการสร้างคิว');
        return;
      }

      // Get next queue numbers for each queue type
      const queueNumbers: Record<string, number> = {};
      
      for (const queueType of queueTypes) {
        const { data: lastQueue } = await supabase
          .from('queues')
          .select('number')
          .eq('type', queueType.code)
          .eq('queue_date', new Date().toISOString().split('T')[0])
          .order('number', { ascending: false })
          .limit(1)
          .single();

        queueNumbers[queueType.code] = (lastQueue?.number || 0) + 1;
      }

      // Create test queues
      const newQueues = [];
      for (let i = 0; i < count; i++) {
        // Distribute queue types evenly
        const queueType = queueTypes[i % queueTypes.length];
        const patient = patients[i % patients.length];

        const queueData = {
          patient_id: patient.id,
          type: queueType.code,
          number: queueNumbers[queueType.code]++,
          status: 'WAITING',
          queue_date: new Date().toISOString().split('T')[0],
          notes: `คิวทดสอบ #${i + 1}`
        };

        newQueues.push(queueData);
      }

      // Insert all queues
      const { data, error } = await supabase
        .from('queues')
        .insert(newQueues)
        .select();

      if (error) {
        throw error;
      }

      logger.info(`Created ${newQueues.length} simulation queues`);
      toast.success(`สร้างคิวทดสอบเรียบร้อย ${newQueues.length} คิว`);

      // Refresh queue data
      await fetchQueues();

    } catch (error) {
      logger.error('Error simulating queues:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างคิวทดสอบ');
    }
  }, [patients, queueTypes, servicePoints, fetchQueues]);

  const clearTestQueues = useCallback(async () => {
    try {
      logger.info('Clearing test queues...');
      toast.info('กำลังลบคิวทดสอบ...');

      const { error } = await supabase
        .from('queues')
        .delete()
        .like('notes', '%คิวทดสอบ%')
        .eq('queue_date', new Date().toISOString().split('T')[0]);

      if (error) {
        throw error;
      }

      toast.success('ลบคิวทดสอบเรียบร้อยแล้ว');
      await fetchQueues();

    } catch (error) {
      logger.error('Error clearing test queues:', error);
      toast.error('เกิดข้อผิดพลาดในการลบคิวทดสอบ');
    }
  }, [fetchQueues]);

  return {
    simulateQueues,
    clearTestQueues
  };
};
