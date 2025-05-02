
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import { Queue, QueueType, QueueStatus } from '@/integrations/supabase/schema';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import QueueManagementHeader from '@/components/queue/management/QueueManagementHeader';
import QueueTabsContainer from '@/components/queue/management/QueueTabsContainer';
import { lineNotificationService } from '@/services/line-notification.service';
import { supabase } from '@/integrations/supabase/client';

const QueueManagement = () => {
  const { 
    queues, 
    updateQueueStatus, 
    callQueue, 
    recallQueue, 
    sortQueues 
  } = useQueues();
  const { patients } = usePatients();
  
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
    <Layout className="overflow-hidden">
      <div className="flex flex-col h-[calc(100vh-2rem)]">
        <QueueManagementHeader />
        
        <div className="flex-1 overflow-hidden">
          <QueueTabsContainer
            waitingQueues={waitingQueues}
            activeQueues={activeQueues}
            completedQueues={completedQueues}
            skippedQueues={skippedQueues}
            patients={patients}
            onUpdateStatus={updateQueueStatus}
            onCallQueue={callQueue}
            onRecallQueue={handleRecallQueue}
          />
        </div>
      </div>
    </Layout>
  );
};

export default QueueManagement;


// Inside the component, add a function to notify patients
const notifyUpcomingQueue = async (queue: Queue) => {
  try {
    // Get the patient associated with this queue
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', queue.patient_id)
      .single();
      
    if (error || !patient) {
      console.error('Error fetching patient for notification:', error);
      return;
    }
    
    // Check if patient has a LINE ID
    if (patient.line_id) {
      // Calculate estimated wait time (this is an example, adjust based on your logic)
      const estimatedWaitTime = 5; // 5 minutes
      
      // Send notification
      const success = await lineNotificationService.sendQueueNotification(
        patient.line_id,
        queue,
        estimatedWaitTime
      );
      
      if (success) {
        toast.success(`แจ้งเตือนคิว ${queue.number} ทาง LINE แล้ว`);
      }
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// When calling the next queue or when a queue is about to be called,
// add logic to notify the upcoming patients
const handleCallNext = async () => {
  // ... existing code ...
  
  // After calling the current queue, notify the next 2-3 patients in line
  const { data: rawQueues } = await supabase
    .from('queues')
    .select('*')
    .eq('status', 'WAITING')
    .order('created_at', { ascending: true })
    .limit(3);
    
  if (rawQueues && rawQueues.length > 0) {
    // Convert the raw data to Queue type
    const upcomingQueues = rawQueues.map(q => ({
      ...q,
      type: q.type as QueueType,
      status: q.status as QueueStatus
    }));
    
    // Notify the next patient immediately
    await notifyUpcomingQueue(upcomingQueues[0]);
    
    // Optionally notify other upcoming patients
    if (upcomingQueues.length > 1) {
      setTimeout(() => {
        notifyUpcomingQueue(upcomingQueues[1]);
      }, 10000); // 10 seconds delay between notifications
    }
  }
  
  // ... rest of existing code ...
};
