import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import { Queue, QueueStatus } from '@/integrations/supabase/schema';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { useServicePointContext } from '@/contexts/ServicePointContext';
import QueueManagementHeader from '@/components/queue/management/QueueManagementHeader';
import QueueTabsContainer from '@/components/queue/management/QueueTabsContainer';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ServicePointCapability } from '@/utils/queueAlgorithms';
import { useServicePointQueueTypes } from '@/hooks/useServicePointQueueTypes';
import useQueueTypes from '@/hooks/useQueueTypes';

const QueueManagement = () => {
  const { 
    queues, 
    updateQueueStatus, 
    callQueue, 
    recallQueue, 
    sortQueues,
    transferQueueToServicePoint,
    putQueueOnHold,
    returnSkippedQueueToWaiting
  } = useQueues();
  const { patients } = usePatients();
  const { mappings } = useServicePointQueueTypes();
  const { queueTypes } = useQueueTypes();
  const { 
    selectedServicePoint,
    setSelectedServicePoint,
    servicePoints
  } = useServicePointContext();
  
  const [waitingQueues, setWaitingQueues] = useState<Queue[]>([]);
  const [activeQueues, setActiveQueues] = useState<Queue[]>([]);
  const [completedQueues, setCompletedQueues] = useState<Queue[]>([]);
  const [skippedQueues, setSkippedQueues] = useState<Queue[]>([]);

  // Extract service point capabilities for queue algorithm
  const [servicePointCapabilities, setServicePointCapabilities] = useState<ServicePointCapability[]>([]);
  
  useEffect(() => {
    if (mappings.length > 0) {
      // Group mappings by service point ID
      const capabilities: Record<string, string[]> = {};
      
      mappings.forEach(mapping => {
        if (!capabilities[mapping.service_point_id]) {
          capabilities[mapping.service_point_id] = [];
        }
        capabilities[mapping.service_point_id].push(mapping.queue_type_id);
      });
      
      // Convert to array format
      const capabilitiesArray = Object.entries(capabilities).map(([servicePointId, queueTypeIds]) => ({
        servicePointId,
        queueTypeIds
      }));
      
      setServicePointCapabilities(capabilitiesArray);
    }
  }, [mappings]);

  // Update filtered queues when the main queues array changes
  useEffect(() => {
    if (queues) {
      const waiting = queues.filter(q => q.status === 'WAITING');
      const active = queues.filter(q => q.status === 'ACTIVE');
      const completed = queues.filter(q => q.status === 'COMPLETED');
      const skipped = queues.filter(q => q.status === 'SKIPPED');
      
      // Apply sorting algorithm to waiting queues based on service point selection
      if (sortQueues) {
        const sortedQueues = sortQueues(waiting, servicePointCapabilities, selectedServicePoint?.id);
        setWaitingQueues(sortedQueues);
      } else {
        setWaitingQueues(waiting);
      }
      
      setActiveQueues(active);
      setCompletedQueues(completed);
      setSkippedQueues(skipped);
    }
  }, [queues, sortQueues, servicePointCapabilities, selectedServicePoint]);
  
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
  
  // Handler for calling queue with service point ID
  const handleCallQueue = async (queueId: string) => {
    if (!selectedServicePoint) {
      toast.warning('กรุณาเลือกจุดบริการก่อนเรียกคิว');
      return null;
    }
    
    // Add service point ID to the queue call
    return await callQueue(queueId, selectedServicePoint.id);
  };
  
  // Handler for transferring queue
  const handleTransferQueue = async (
    queueId: string, 
    sourceServicePointId: string,
    targetServicePointId: string,
    notes?: string,
    newQueueType?: string
  ) => {
    return await transferQueueToServicePoint(
      queueId, 
      sourceServicePointId,
      targetServicePointId,
      notes,
      newQueueType
    );
  };
  
  // Handler for holding queue
  const handleHoldQueue = async (queueId: string, servicePointId: string, reason?: string) => {
    return await putQueueOnHold(queueId, servicePointId, reason);
  };
  
  // Handler for returning skipped queue to waiting
  const handleReturnToWaiting = async (queueId: string) => {
    return await returnSkippedQueueToWaiting(queueId);
  };
  
  // Handler for service point change
  const handleServicePointChange = (value: string) => {
    const servicePoint = servicePoints.find(sp => sp.id === value);
    if (servicePoint) {
      setSelectedServicePoint(servicePoint);
    }
  };

  return (
    <Layout className="overflow-hidden">
      <div className="flex flex-col h-[calc(100vh-2rem)]">
        <div className="flex items-center justify-between mb-4">
          <QueueManagementHeader />
          
          <div className="flex items-center">
            <span className="text-sm mr-2">จุดบริการ:</span>
            <Select 
              value={selectedServicePoint?.id || ''} 
              onValueChange={handleServicePointChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="เลือกจุดบริการ" />
              </SelectTrigger>
              <SelectContent>
                {servicePoints
                  .filter(sp => sp.enabled)
                  .map(sp => (
                    <SelectItem key={sp.id} value={sp.id}>
                      {sp.code} - {sp.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <QueueTabsContainer
            waitingQueues={waitingQueues}
            activeQueues={activeQueues}
            completedQueues={completedQueues}
            skippedQueues={skippedQueues}
            patients={patients}
            queueTypes={queueTypes}
            onUpdateStatus={updateQueueStatus}
            onCallQueue={handleCallQueue}
            onRecallQueue={handleRecallQueue}
            onTransferQueue={handleTransferQueue}
            onHoldQueue={handleHoldQueue}
            onReturnToWaiting={handleReturnToWaiting}
            selectedServicePoint={selectedServicePoint}
            servicePoints={servicePoints}
          />
        </div>
      </div>
    </Layout>
  );
};

export default QueueManagement;
