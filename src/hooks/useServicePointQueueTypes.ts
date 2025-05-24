
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ServicePointQueueType } from '@/integrations/supabase/schema';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useServicePointQueueTypes');

export const useServicePointQueueTypes = (servicePointId?: string) => {
  const [mappings, setMappings] = useState<ServicePointQueueType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMappings = async () => {
    // Don't fetch if no service point is selected
    if (!servicePointId) {
      setMappings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      logger.debug(`Fetching mappings for service point: ${servicePointId}`);

      const { data, error } = await supabase
        .from('service_point_queue_types')
        .select(`
          *,
          queue_type:queue_types(id, name, code),
          service_point:service_points(id, name, code)
        `)
        .eq('service_point_id', servicePointId);

      if (error) {
        logger.error('Supabase error during fetch:', error);
        throw error;
      }

      logger.debug(`Successfully fetched ${data?.length || 0} mappings:`, data);
      setMappings(data || []);
    } catch (err: any) {
      logger.error('Error fetching service point queue type mappings:', err);
      setError(err.message || 'Failed to fetch service point queue type mappings');
      setMappings([]);
    } finally {
      setLoading(false);
    }
  };

  const addMapping = async (servicePointId: string, queueTypeId: string) => {
    try {
      logger.debug(`Adding mapping: servicePointId=${servicePointId}, queueTypeId=${queueTypeId}`);

      const { data, error } = await supabase
        .from('service_point_queue_types')
        .insert({
          service_point_id: servicePointId,
          queue_type_id: queueTypeId
        })
        .select(`
          *,
          queue_type:queue_types(id, name, code),
          service_point:service_points(id, name, code)
        `);

      if (error) {
        logger.error('Supabase error during insert:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned after adding mapping');
      }

      logger.debug('Successfully added mapping:', data[0]);
      setMappings(prev => [...prev, data[0]]);
      toast.success('เพิ่มการเชื่อมโยงประเภทคิวกับจุดบริการเรียบร้อยแล้ว');
      return data[0];
    } catch (err: any) {
      logger.error('Error adding service point queue type mapping:', err);
      toast.error('ไม่สามารถเพิ่มการเชื่อมโยงประเภทคิวกับจุดบริการได้');
      return null;
    }
  };

  const removeMapping = async (id: string) => {
    try {
      setDeletingId(id);
      logger.debug(`Attempting to delete mapping with id: ${id}`);

      // Perform the delete operation with a more direct approach
      const { error, count } = await supabase
        .from('service_point_queue_types')
        .delete({ count: 'exact' })
        .eq('id', id);

      if (error) {
        logger.error('Supabase error during delete:', error);
        throw error;
      }

      logger.debug(`Delete operation completed. Rows affected: ${count}`);

      if (count === 0) {
        logger.warn(`No rows were deleted for mapping id: ${id}`);
        throw new Error('No mapping was deleted - record may not exist');
      }

      // Update local state immediately after successful deletion
      setMappings(prev => {
        const updated = prev.filter(mapping => mapping.id !== id);
        logger.debug(`Updated local state: removed mapping ${id}, remaining mappings: ${updated.length}`);
        return updated;
      });
      
      toast.success('ลบการเชื่อมโยงประเภทคิวกับจุดบริการเรียบร้อยแล้ว');
      logger.debug(`Successfully deleted mapping with id: ${id}`);
      return true;
    } catch (err: any) {
      logger.error('Error removing service point queue type mapping:', err);
      toast.error(`ไม่สามารถลบการเชื่อมโยงประเภทคิวกับจุดบริการได้: ${err.message}`);
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  // Get queue types available for a service point
  const getQueueTypesForServicePoint = async (servicePointId: string) => {
    try {
      const { data, error } = await supabase
        .from('service_point_queue_types')
        .select(`
          queue_type_id,
          queue_type:queue_types(*)
        `)
        .eq('service_point_id', servicePointId);

      if (error) {
        throw error;
      }

      return data?.map(item => item.queue_type) || [];
    } catch (err: any) {
      logger.error('Error fetching queue types for service point:', err);
      toast.error('ไม่สามารถดึงข้อมูลประเภทคิวสำหรับจุดบริการได้');
      return [];
    }
  };

  // Get service points available for a queue type
  const getServicePointsForQueueType = async (queueTypeId: string) => {
    try {
      const { data, error } = await supabase
        .from('service_point_queue_types')
        .select(`
          service_point_id,
          service_point:service_points(*)
        `)
        .eq('queue_type_id', queueTypeId);

      if (error) {
        throw error;
      }

      return data?.map(item => item.service_point) || [];
    } catch (err: any) {
      logger.error('Error fetching service points for queue type:', err);
      toast.error('ไม่สามารถดึงข้อมูลจุดบริการสำหรับประเภทคิวได้');
      return [];
    }
  };

  useEffect(() => {
    fetchMappings();
  }, [servicePointId]);

  return {
    mappings,
    loading,
    error,
    deletingId,
    fetchMappings,
    addMapping,
    removeMapping,
    getQueueTypesForServicePoint,
    getServicePointsForQueueType
  };
};
