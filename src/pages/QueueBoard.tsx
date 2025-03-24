
import React, { useState, useEffect } from 'react';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { QueueStatus, Patient } from '@/integrations/supabase/schema';
import QueueBoardHeader from '@/components/queue/QueueBoardHeader';
import ActiveQueueSection from '@/components/queue/ActiveQueueSection';
import WaitingQueueSection from '@/components/queue/WaitingQueueSection';
import CompletedQueueSection from '@/components/queue/CompletedQueueSection';
import HospitalFooter from '@/components/queue/HospitalFooter';

// Define queue status constants to use as values
const QUEUE_STATUS = {
  ACTIVE: 'ACTIVE' as QueueStatus,
  WAITING: 'WAITING' as QueueStatus,
  COMPLETED: 'COMPLETED' as QueueStatus,
  SKIPPED: 'SKIPPED' as QueueStatus
};

const QueueBoard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Fetch data from Supabase
  const { getQueuesByStatus } = useQueues();
  const { patients } = usePatients();
  const [activeQueues, setActiveQueues] = useState([]);
  const [waitingQueues, setWaitingQueues] = useState([]);
  const [completedQueues, setCompletedQueues] = useState([]);
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Fetch queues data
  useEffect(() => {
    const fetchQueues = async () => {
      const active = await getQueuesByStatus(QUEUE_STATUS.ACTIVE);
      setActiveQueues(active);
      
      const waiting = await getQueuesByStatus(QUEUE_STATUS.WAITING);
      setWaitingQueues(waiting.sort((a, b) => a.number - b.number).slice(0, 5));
      
      const completed = await getQueuesByStatus(QUEUE_STATUS.COMPLETED);
      setCompletedQueues(completed.sort((a, b) => b.number - a.number).slice(0, 5));
    };
    
    fetchQueues();
    
    // Refresh data every 30 seconds
    const refreshTimer = setInterval(fetchQueues, 30000);
    return () => clearInterval(refreshTimer);
  }, [getQueuesByStatus]);

  // Find patient by ID
  const findPatient = (patientId: string): Patient | undefined => {
    return patients.find(p => p.id === patientId);
  };
  
  return (
    <div className="min-h-screen bg-pharmacy-50">
      <QueueBoardHeader 
        currentTime={currentTime}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />
      
      {/* Main content */}
      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <ActiveQueueSection 
            activeQueues={activeQueues}
            findPatient={findPatient}
          />
          
          <WaitingQueueSection 
            waitingQueues={waitingQueues}
            findPatient={findPatient}
          />
          
          <CompletedQueueSection 
            completedQueues={completedQueues}
            findPatient={findPatient}
          />
        </div>
        
        <HospitalFooter />
      </main>
    </div>
  );
};

export default QueueBoard;
