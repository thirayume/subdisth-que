
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import { Queue, QueueStatus } from '@/integrations/supabase/schema';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import QueueSummaryCards from '@/components/dashboard/QueueSummaryCards';
import DashboardContent from '@/components/dashboard/DashboardContent';

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
