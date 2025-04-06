
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useQueues } from '@/hooks/useQueues';
import QueueAnalytics from '@/components/dashboard/QueueAnalytics';
import QueueSummaryCards from '@/components/dashboard/QueueSummaryCards';
import { Queue } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';

const Analytics = () => {
  const { queues, sortQueues } = useQueues();
  const [waitingQueues, setWaitingQueues] = useState<Queue[]>([]);
  const [activeQueues, setActiveQueues] = useState<Queue[]>([]);
  const [completedQueues, setCompletedQueues] = useState<Queue[]>([]);
  const [skippedQueues, setSkippedQueues] = useState<Queue[]>([]);
  const [todayStats, setTodayStats] = useState({
    avgWaitTime: 0,
    avgServiceTime: 0
  });

  // Update filtered queues when the main queues array changes
  useEffect(() => {
    if (queues) {
      const waiting = queues.filter(q => q.status === 'WAITING');
      const active = queues.filter(q => q.status === 'ACTIVE');
      const completed = queues.filter(q => q.status === 'COMPLETED');
      const skipped = queues.filter(q => q.status === 'SKIPPED');
      
      setWaitingQueues(sortQueues(waiting));
      setActiveQueues(active);
      setCompletedQueues(completed);
      setSkippedQueues(skipped);
    }
  }, [queues, sortQueues]);
  
  // Fetch today's statistics
  useEffect(() => {
    const fetchTodayStats = async () => {
      try {
        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Fetch completed queues for today
        const { data, error } = await supabase
          .from('queues')
          .select('*')
          .eq('status', 'COMPLETED')
          .gte('created_at', today.toISOString())
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Calculate average wait time (from created to called)
          const totalWaitTime = data.reduce((sum, queue) => {
            if (queue.called_at && queue.created_at) {
              const waitMs = new Date(queue.called_at).getTime() - new Date(queue.created_at).getTime();
              return sum + (waitMs / 60000); // Convert to minutes
            }
            return sum;
          }, 0);
          
          // Calculate average service time (from called to completed)
          const totalServiceTime = data.reduce((sum, queue) => {
            if (queue.completed_at && queue.called_at) {
              const serviceMs = new Date(queue.completed_at).getTime() - new Date(queue.called_at).getTime();
              return sum + (serviceMs / 60000); // Convert to minutes
            }
            return sum;
          }, 0);
          
          setTodayStats({
            avgWaitTime: data.length > 0 ? totalWaitTime / data.length : 0,
            avgServiceTime: data.length > 0 ? totalServiceTime / data.length : 0
          });
        }
      } catch (err) {
        console.error('Error fetching today stats:', err);
      }
    };
    
    fetchTodayStats();
  }, []);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">การวิเคราะห์คิว</h1>
        <p className="text-gray-500">ข้อมูลวิเคราะห์และสถิติของระบบคิว</p>
      </div>
      
      <QueueSummaryCards 
        waitingQueues={waitingQueues}
        activeQueues={activeQueues}
        completedQueues={completedQueues}
        queues={queues}
        avgWaitTime={todayStats.avgWaitTime}
        avgServiceTime={todayStats.avgServiceTime}
      />
      
      <QueueAnalytics 
        completedQueues={completedQueues}
        waitingQueues={waitingQueues}
        activeQueues={activeQueues}
        skippedQueues={skippedQueues}
        className="mb-6"
      />
    </Layout>
  );
};

export default Analytics;
