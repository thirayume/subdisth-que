import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { useQueueTypes } from '@/hooks/useQueueTypes';
import { useServicePoints } from '@/hooks/useServicePoints';
import { useAllServicePointQueueTypes } from '@/hooks/useServicePointQueueTypes';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueueSimulation');

export const useQueueSimulation = () => {
  const { fetchQueues } = useQueues();
  const { patients } = usePatients();
  const { queueTypes } = useQueueTypes();
  const { servicePoints } = useServicePoints();
  const { mappings } = useAllServicePointQueueTypes();

  const simulateQueues = useCallback(async (count: number = 15) => {
    try {
      logger.info('Starting queue simulation...');
      toast.info(`กำลังสร้างคิวทดสอบ ${count} คิว...`);

      // Validate required data
      if (!patients || patients.length === 0) {
        toast.error('ไม่พบข้อมูลผู้ป่วยสำหรับการสร้างคิว');
        logger.error('No patients available for queue creation');
        return;
      }

      if (!queueTypes || queueTypes.length === 0) {
        toast.error('ไม่พบประเภทคิวสำหรับการสร้างคิว');
        logger.error('No queue types available for queue creation');
        return;
      }

      // Filter only enabled queue types
      const enabledQueueTypes = queueTypes.filter(qt => qt.enabled);
      if (enabledQueueTypes.length === 0) {
        toast.error('ไม่พบประเภทคิวที่เปิดใช้งานสำหรับการสร้างคิว');
        logger.error('No enabled queue types available');
        return;
      }

      // Filter enabled service points
      const enabledServicePoints = servicePoints.filter(sp => sp.enabled);
      if (enabledServicePoints.length === 0) {
        toast.error('ไม่พบจุดบริการที่เปิดใช้งานสำหรับการสร้างคิว');
        logger.error('No enabled service points available');
        return;
      }

      logger.info(`Using ${enabledQueueTypes.length} enabled queue types:`, enabledQueueTypes.map(qt => qt.code));
      logger.info(`Using ${enabledServicePoints.length} enabled service points:`, enabledServicePoints.map(sp => sp.code));
      logger.info(`Using ${mappings.length} service point mappings`);

      // Get next queue numbers for each queue type
      const queueNumbers: Record<string, number> = {};
      
      for (const queueType of enabledQueueTypes) {
        try {
          const { data: lastQueue } = await supabase
            .from('queues')
            .select('number')
            .eq('type', queueType.code)
            .eq('queue_date', new Date().toISOString().split('T')[0])
            .order('number', { ascending: false })
            .limit(1)
            .maybeSingle();

          queueNumbers[queueType.code] = (lastQueue?.number || 0) + 1;
          logger.debug(`Next queue number for ${queueType.code}: ${queueNumbers[queueType.code]}`);
        } catch (error) {
          logger.warn(`Error getting last queue number for ${queueType.code}:`, error);
          queueNumbers[queueType.code] = 1; // Default to 1 if error
        }
      }

      // Helper function to find service point for queue type
      const findServicePointForQueueType = (queueType: any) => {
        // Find service points that can handle this queue type using mappings
        const compatibleServicePoints = mappings
          .filter(mapping => mapping.queue_type_id === queueType.id)
          .map(mapping => enabledServicePoints.find(sp => sp.id === mapping.service_point_id))
          .filter(Boolean);

        if (compatibleServicePoints.length > 0) {
          // Use simple round-robin assignment
          const index = Math.floor(Math.random() * compatibleServicePoints.length);
          logger.debug(`Found ${compatibleServicePoints.length} compatible service points for ${queueType.code}, selecting:`, compatibleServicePoints[index]?.code);
          return compatibleServicePoints[index];
        }

        // Fallback: assign to first available service point
        logger.warn(`No compatible service points found for queue type ${queueType.code}, using fallback:`, enabledServicePoints[0]?.code);
        return enabledServicePoints[0];
      };

      // Create test queues with service point assignment
      const newQueues = [];
      for (let i = 0; i < count; i++) {
        // Distribute queue types evenly among enabled types
        const queueType = enabledQueueTypes[i % enabledQueueTypes.length];
        // Use random patient selection to avoid duplicates
        const patient = patients[Math.floor(Math.random() * patients.length)];
        const assignedServicePoint = findServicePointForQueueType(queueType);

        const queueData = {
          patient_id: patient.id,
          type: queueType.code,
          number: queueNumbers[queueType.code]++,
          status: 'WAITING',
          queue_date: new Date().toISOString().split('T')[0],
          service_point_id: assignedServicePoint?.id || null,
          notes: `คิวทดสอบ #${i + 1} - สร้างโดยระบบ${assignedServicePoint ? ` (${assignedServicePoint.name})` : ''}`
        };

        newQueues.push(queueData);
        logger.debug(`Created queue data with service point:`, queueData);
      }

      // Insert all queues with better error handling
      const { data, error } = await supabase
        .from('queues')
        .insert(newQueues)
        .select();

      if (error) {
        logger.error('Database error inserting queues:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        logger.warn('No queues were created');
        toast.warning('ไม่มีคิวที่ถูกสร้าง');
        return;
      }

      const assignedCount = data.filter(q => q.service_point_id).length;
      const unassignedCount = data.length - assignedCount;

      logger.info(`Successfully created ${data.length} simulation queues (${assignedCount} assigned, ${unassignedCount} unassigned)`);
      toast.success(`สร้างคิวทดสอบเรียบร้อย ${data.length} คิว (มอบหมายแล้ว ${assignedCount} คิว)`);

      if (unassignedCount > 0) {
        toast.info(`มีคิวที่ยังไม่ได้มอบหมายจุดบริการ ${unassignedCount} คิว - ใช้การคำนวณใหม่เพื่อมอบหมาย`);
      }

      // Refresh queue data
      await fetchQueues();

    } catch (error) {
      logger.error('Error simulating queues:', error);
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      toast.error(`เกิดข้อผิดพลาดในการสร้างคิวทดสอบ: ${errorMessage}`);
    }
  }, [patients, queueTypes, servicePoints, mappings, fetchQueues]);

  const clearTestQueues = useCallback(async () => {
    try {
      logger.info('Clearing test queues...');
      toast.info('กำลังลบคิวทดสอบ...');

      const today = new Date().toISOString().split('T')[0];

      // First, check if there are any test queues to delete
      const { data: testQueues, error: checkError } = await supabase
        .from('queues')
        .select('id')
        .or('notes.like.%คิวทดสอบ%,notes.like.%สร้างโดยระบบ%')
        .eq('queue_date', today);

      if (checkError) {
        logger.error('Error checking for test queues:', checkError);
        throw new Error(`Database error: ${checkError.message}`);
      }

      if (!testQueues || testQueues.length === 0) {
        logger.info('No test queues found to delete');
        toast.info('ไม่พบคิวทดสอบที่จะลบ');
        return;
      }

      logger.info(`Found ${testQueues.length} test queues to delete`);

      // Delete the test queues
      const { error: deleteError } = await supabase
        .from('queues')
        .delete()
        .or('notes.like.%คิวทดสอบ%,notes.like.%สร้างโดยระบบ%')
        .eq('queue_date', today);

      if (deleteError) {
        logger.error('Error deleting test queues:', deleteError);
        throw new Error(`Database error: ${deleteError.message}`);
      }

      logger.info(`Successfully deleted ${testQueues.length} test queues`);
      toast.success(`ลบคิวทดสอบเรียบร้อยแล้ว (${testQueues.length} คิว)`);
      
      await fetchQueues();

    } catch (error) {
      logger.error('Error clearing test queues:', error);
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      toast.error(`เกิดข้อผิดพลาดในการลบคิวทดสอบ: ${errorMessage}`);
    }
  }, [fetchQueues]);

  return {
    simulateQueues,
    clearTestQueues
  };
};
