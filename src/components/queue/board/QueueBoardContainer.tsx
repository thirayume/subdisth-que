
import React, { useState, useEffect } from 'react';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { QueueStatus, Patient } from '@/integrations/supabase/schema';
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';
import QueueBoardHeader from '@/components/queue/QueueBoardHeader';
import QueueBoardAlgorithmInfo from './QueueBoardAlgorithmInfo';
import QueueBoardContent from './QueueBoardContent';
import HospitalFooter from '@/components/queue/HospitalFooter';

// Define queue status constants to use as values
const QUEUE_STATUS = {
  ACTIVE: 'ACTIVE' as QueueStatus,
  WAITING: 'WAITING' as QueueStatus,
  COMPLETED: 'COMPLETED' as QueueStatus,
  SKIPPED: 'SKIPPED' as QueueStatus
};

const QueueBoardContainer = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentAlgorithm, setCurrentAlgorithm] = useState<QueueAlgorithmType>(QueueAlgorithmType.FIFO);
  
  // Fetch data from Supabase
  const { getQueuesByStatus, sortQueues } = useQueues();
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
  
  // Load algorithm from localStorage
  useEffect(() => {
    const savedAlgorithm = localStorage.getItem('queue_algorithm');
    if (savedAlgorithm) {
      setCurrentAlgorithm(savedAlgorithm as QueueAlgorithmType);
    }
  }, []);
  
  // Fetch queues data
  useEffect(() => {
    const fetchQueues = async () => {
      const active = await getQueuesByStatus(QUEUE_STATUS.ACTIVE);
      setActiveQueues(active);
      
      const waiting = await getQueuesByStatus(QUEUE_STATUS.WAITING);
      // Apply sorting algorithm to waiting queues
      const sortedWaiting = sortQueues(waiting);
      setWaitingQueues(sortedWaiting.slice(0, 5));
      
      const completed = await getQueuesByStatus(QUEUE_STATUS.COMPLETED);
      setCompletedQueues(completed.sort((a, b) => 
        new Date(b.completed_at || b.updated_at).getTime() - 
        new Date(a.completed_at || a.updated_at).getTime()).slice(0, 5));
    };
    
    fetchQueues();
    
    // Refresh data every 30 seconds
    const refreshTimer = setInterval(fetchQueues, 30000);
    return () => clearInterval(refreshTimer);
  }, [getQueuesByStatus, sortQueues]);

  // Find patient by ID
  const findPatient = (patientId: string): Patient | undefined => {
    return patients.find(p => p.id === patientId);
  };
  
  // Get the current algorithm name for display
  const getCurrentAlgorithmName = () => {
    switch (currentAlgorithm) {
      case QueueAlgorithmType.FIFO: return "First In, First Out (FIFO)";
      case QueueAlgorithmType.PRIORITY: return "ลำดับความสำคัญ (Priority Queue)";
      case QueueAlgorithmType.MULTILEVEL: return "หลายระดับ (Multilevel Queue)";
      case QueueAlgorithmType.MULTILEVEL_FEEDBACK: return "ปรับความสำคัญตามเวลารอคอย (Multilevel Feedback)";
      default: return "อัลกอริทึมเรียกคิว";
    }
  };
  
  return (
    <div className="min-h-screen bg-pharmacy-50">
      <QueueBoardHeader 
        currentTime={currentTime}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />
      
      <QueueBoardAlgorithmInfo algorithmName={getCurrentAlgorithmName()} />
      
      <QueueBoardContent 
        activeQueues={activeQueues}
        waitingQueues={waitingQueues}
        completedQueues={completedQueues}
        findPatient={findPatient}
      />
      
      <HospitalFooter />
    </div>
  );
};

export default QueueBoardContainer;
