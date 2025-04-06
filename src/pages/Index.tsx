
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import { Queue, QueueStatus } from '@/integrations/supabase/schema';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import QueueSummaryCards from '@/components/dashboard/QueueSummaryCards';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { supabase } from '@/integrations/supabase/client'; 

const Dashboard = () => {
  const { 
    queues, 
    loading: loadingQueues, 
    updateQueueStatus, 
    callQueue, 
    recallQueue, 
    sortQueues 
  } = useQueues();
  const { patients, loading: loadingPatients } = usePatients();
  
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
      
      // Apply sorting algorithm to waiting queues
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
  
  // Handler for recalling queue
  const handleRecallQueue = (queueId: string) => {
    // We now call recallQueue with the queue ID
    recallQueue(queueId);
    
    // Find the queue for the toast notification
    const queue = queues.find(q => q.id === queueId);
    if (queue) {
      // Find the patient for this queue
      const patient = patients.find(p => p.id === queue.patient_id);
      if (patient) {
        toast.info(`เรียกซ้ำคิวหมายเลข ${queue.number} - ${patient.name}`);
      } else {
        toast.info(`เรียกซ้ำคิวหมายเลข ${queue.number}`);
      }
    }
  };

  return (
    <Layout>
      <DashboardHeader />
      
      <QueueSummaryCards 
        waitingQueues={waitingQueues}
        activeQueues={activeQueues}
        completedQueues={completedQueues}
        queues={queues}
        avgWaitTime={todayStats.avgWaitTime}
        avgServiceTime={todayStats.avgServiceTime}
      />
      
      <DashboardContent
        waitingQueues={waitingQueues}
        activeQueues={activeQueues}
        completedQueues={completedQueues}
        skippedQueues={skippedQueues}
        patients={patients}
        onUpdateStatus={updateQueueStatus}
        onCallQueue={callQueue}
        onRecallQueue={handleRecallQueue}
      />
    </Layout>
  );
};

export default Dashboard;
