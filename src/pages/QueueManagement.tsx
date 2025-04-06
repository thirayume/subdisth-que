
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import { Queue, QueueStatus } from '@/integrations/supabase/schema';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import QueueTabs from '@/components/dashboard/QueueTabs';
import ActiveQueueSection from '@/components/queue/ActiveQueueSection';

const QueueManagement = () => {
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

  // Find patient by ID helper function
  const findPatient = (patientId: string) => {
    return patients.find(p => p.id === patientId);
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">การจัดการคิว</h1>
        <p className="text-gray-500">จัดการคิวรอดำเนินการ คิวกำลังให้บริการ และคิวเสร็จสิ้น</p>
      </div>
      
      {/* Active Queue Display */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">กำลังให้บริการ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeQueues.length === 0 ? (
            <p className="text-gray-500 p-6 bg-gray-50 rounded-lg border border-gray-100">
              ไม่มีคิวที่กำลังให้บริการในขณะนี้
            </p>
          ) : (
            activeQueues.map(queue => (
              <ActiveQueueSection
                key={queue.id}
                activeQueues={[queue]}
                findPatient={findPatient}
              />
            ))
          )}
        </div>
      </div>
      
      {/* Queue Tabs for management */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <QueueTabs
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
    </Layout>
  );
};

export default QueueManagement;
