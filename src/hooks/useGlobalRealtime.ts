
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
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;

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
    }, 500); // Increased debounce to 500ms to prevent rapid fire
  };

  private setupChannel() {
    if (this.channel || this.isConnecting) return;

    this.isConnecting = true;
    logger.debug('Setting up global realtime channel');
    
    try {
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
          
          if (status === 'SUBSCRIBED') {
            this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
            this.isConnecting = false;
          } else if (status === 'CHANNEL_ERROR') {
            logger.error('Global channel error detected');
            this.handleConnectionError();
          } else if (status === 'CLOSED') {
            logger.warn('Global channel closed');
            this.isConnecting = false;
            this.scheduleReconnect();
          }
        });
    } catch (error) {
      logger.error('Failed to setup channel:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private handleConnectionError() {
    this.isConnecting = false;
    this.cleanupChannel();
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    } else {
      logger.error('Max reconnection attempts reached. Real-time updates disabled.');
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff, max 30s
    this.reconnectAttempts++;
    
    logger.debug(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.listeners.length > 0) {
        this.setupChannel();
      }
    }, delay);
  }

  private cleanupChannel() {
    if (this.channel) {
      logger.debug('Cleaning up global realtime channel');
      try {
        supabase.removeChannel(this.channel);
      } catch (error) {
        logger.error('Error removing channel:', error);
      }
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
    
    if (this.listeners.length === 1 && !this.isConnecting) {
      this.setupChannel();
    }
  }

  removeListener(id: string) {
    logger.debug(`Removing listener: ${id}`);
    this.listeners = this.listeners.filter(l => l.id !== id);
    
    if (this.listeners.length === 0) {
      this.cleanupChannel();
      this.reconnectAttempts = 0; // Reset reconnect attempts when no listeners
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
