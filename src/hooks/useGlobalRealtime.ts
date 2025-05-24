
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useGlobalRealtime');

interface QueueChangeListener {
  id: string;
  callback: () => void;
  servicePointId?: string;
}

class GlobalRealtimeManager {
  private static instance: GlobalRealtimeManager;
  private channel: any = null;
  private listeners: QueueChangeListener[] = [];
  private debounceTimeout: NodeJS.Timeout | null = null;

  static getInstance(): GlobalRealtimeManager {
    if (!GlobalRealtimeManager.instance) {
      GlobalRealtimeManager.instance = new GlobalRealtimeManager();
    }
    return GlobalRealtimeManager.instance;
  }

  private debouncedNotify = () => {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    
    this.debounceTimeout = setTimeout(() => {
      logger.debug(`Notifying ${this.listeners.length} listeners of queue changes`);
      this.listeners.forEach(listener => {
        try {
          listener.callback();
        } catch (error) {
          logger.error(`Error in listener ${listener.id}:`, error);
        }
      });
    }, 300);
  };

  private setupChannel() {
    if (this.channel) return;

    logger.debug('Setting up global realtime channel');
    
    this.channel = supabase
      .channel('global-queue-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'queues' },
        (payload) => {
          logger.debug('Global queue change detected:', payload);
          this.debouncedNotify();
        }
      )
      .subscribe((status) => {
        logger.debug('Global channel subscription status:', status);
      });
  }

  private cleanupChannel() {
    if (this.channel) {
      logger.debug('Cleaning up global realtime channel');
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
  }

  addListener(listener: QueueChangeListener) {
    logger.debug(`Adding listener: ${listener.id}`);
    this.listeners.push(listener);
    
    if (this.listeners.length === 1) {
      this.setupChannel();
    }
  }

  removeListener(id: string) {
    logger.debug(`Removing listener: ${id}`);
    this.listeners = this.listeners.filter(l => l.id !== id);
    
    if (this.listeners.length === 0) {
      this.cleanupChannel();
    }
  }
}

export const useGlobalRealtime = (
  id: string,
  callback: () => void,
  servicePointId?: string,
  enabled: boolean = true
) => {
  const callbackRef = useRef(callback);
  const manager = GlobalRealtimeManager.getInstance();

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Stable callback that uses the ref
  const stableCallback = useCallback(() => {
    callbackRef.current();
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const listener: QueueChangeListener = {
      id,
      callback: stableCallback,
      servicePointId
    };

    manager.addListener(listener);

    return () => {
      manager.removeListener(id);
    };
  }, [id, stableCallback, servicePointId, enabled]);
};
