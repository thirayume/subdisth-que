
import { useEffect, useRef, useCallback } from 'react';
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
  const onQueueChangeRef = useRef(onQueueChange);

  // Update the callback ref when it changes
  useEffect(() => {
    onQueueChangeRef.current = onQueueChange;
  }, [onQueueChange]);

  // Stable callback that doesn't change on every render
  const handleQueueChange = useCallback((payload: any) => {
    logger.debug(`Queue change detected on channel ${channelName}:`, payload);
    if (onQueueChangeRef.current) {
      onQueueChangeRef.current();
    }
  }, [channelName]);

  useEffect(() => {
    if (!enabled) {
      logger.debug(`Real-time subscription disabled for channel: ${channelName}`);
      return;
    }

    // Clean up existing channel
    if (channelRef.current) {
      logger.debug(`Cleaning up existing channel: ${channelName}`);
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
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
        handleQueueChange
      );
      logger.debug(`Subscribed to queue changes for service point: ${servicePointId}`);
    } else {
      // Listen for all queue changes
      channel = channel.on('postgres_changes', 
        { event: '*', schema: 'public', table: 'queues' },
        handleQueueChange
      );
      logger.debug('Subscribed to all queue changes');
    }

    // Subscribe to the channel
    channel.subscribe((status) => {
      logger.debug(`Channel ${channelName} subscription status:`, status);
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        logger.debug(`Cleaning up real-time subscription for channel: ${channelName}`);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [servicePointId, channelName, enabled, handleQueueChange]);

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      logger.debug(`Manual cleanup for channel: ${channelName}`);
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, [channelName]);

  return {
    cleanup
  };
};
