
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueueRealtime');

interface UseQueueRealtimeOptions {
  onQueueChange?: () => void;
  servicePointId?: string;
  channelName?: string;
  enabled?: boolean;
}

export const useQueueRealtime = (options: UseQueueRealtimeOptions = {}) => {
  const { onQueueChange, servicePointId, channelName = 'queue-realtime', enabled = true } = options;
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    logger.debug(`Setting up real-time subscription for channel: ${channelName}`);
    
    let channel = supabase.channel(channelName);

    // Set up queue change listener
    if (servicePointId) {
      // Listen for changes specific to a service point
      channel = channel.on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'queues',
          filter: `service_point_id=eq.${servicePointId}`
        },
        (payload) => {
          logger.debug(`Queue change for service point ${servicePointId}:`, payload);
          onQueueChange?.();
        }
      );
    } else {
      // Listen for all queue changes
      channel = channel.on('postgres_changes', 
        { event: '*', schema: 'public', table: 'queues' },
        (payload) => {
          logger.debug('Queue change detected:', payload);
          onQueueChange?.();
        }
      );
    }

    channelRef.current = channel.subscribe();

    return () => {
      if (channelRef.current) {
        logger.debug(`Cleaning up real-time subscription for channel: ${channelName}`);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [servicePointId, channelName, onQueueChange, enabled]);

  return {
    cleanup: () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    }
  };
};
