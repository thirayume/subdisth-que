
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ServicePointQueueType } from '@/integrations/supabase/schema';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useServicePointQueueTypes');

export const useServicePointQueueTypes = (servicePointId?: string) => {
  const [mappings, setMappings] = useState<ServicePointQueueType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMappings = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('service_point_queue_types')
        .select(`
          *,
          queue_type:queue_types(id, name, code),
          service_point:service_points(id, name, code)
        `);

      if (servicePointId) {
        query = query.eq('service_point_id', servicePointId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setMappings(data || []);
      logger.debug(`Fetched ${data?.length || 0} service point queue type mappings`);
    } catch (err: any) {
      logger.error('Error fetching service point queue type mappings:', err);
      setError(err.message || 'Failed to fetch service point queue type mappings');
    } finally {
      setLoading(false);
    }
  };

  const addMapping = async (servicePointId: string, queueTypeId: string) => {
    try {
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
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned after adding mapping');
      }

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
      const { error } = await supabase
        .from('service_point_queue_types')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setMappings(prev => prev.filter(mapping => mapping.id !== id));
      toast.success('ลบการเชื่อมโยงประเภทคิวกับจุดบริการเรียบร้อยแล้ว');
      return true;
    } catch (err: any) {
      logger.error('Error removing service point queue type mapping:', err);
      toast.error('ไม่สามารถลบการเชื่อมโยงประเภทคิวกับจุดบริการได้');
      return false;
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
    fetchMappings,
    addMapping,
    removeMapping,
    getQueueTypesForServicePoint,
    getServicePointsForQueueType
  };
};
