
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QueueTypeEnum } from '@/integrations/supabase/schema';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueueTypes');

// Extend the QueueType with additional properties from queue_types table
export interface QueueType {
  id: string;
  code: string;
  name: string;
  prefix: string;
  purpose?: string;
  format: string;
  enabled: boolean;
  algorithm: string;
  priority: number;
  created_at?: string;
  updated_at?: string;
}

export const useQueueTypes = () => {
  const [queueTypes, setQueueTypes] = useState<QueueType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch queue types from the database
  const fetchQueueTypes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('queue_types')
        .select('*')
        .order('priority', { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        setQueueTypes(data as QueueType[]);
      }
    } catch (err: any) {
      logger.error('Error fetching queue types:', err);
      setError(err.message || 'Error fetching queue types');
      toast.error('Failed to load queue types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueTypes();
  }, []);

  return {
    queueTypes,
    loading,
    error,
    fetchQueueTypes
  };
};

export default useQueueTypes;
