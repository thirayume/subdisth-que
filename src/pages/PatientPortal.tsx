
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Patient, Queue, QueueStatus, QueueTypeEnum } from '@/integrations/supabase/schema';
import PatientPortalLoading from '@/components/patient-portal/PatientPortalLoading';
import PatientPortalAuth from '@/components/patient-portal/PatientPortalAuth';
import ActiveQueueView from '@/components/patient-portal/ActiveQueueView';
import PatientSelectionView from '@/components/patient-portal/PatientSelectionView';
import PatientQueueSelector from '@/components/patient-portal/PatientQueueSelector';
import { useIsMobile } from '@/hooks/use-mobile';

const PatientPortal: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeQueue, setActiveQueue] = useState<Queue | null>(null);
  const [availableQueues, setAvailableQueues] = useState<Queue[]>([]);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [isStaffMode, setIsStaffMode] = useState<boolean>(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check for LINE authentication state on component mount
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Check if there's a LINE auth token in localStorage
        const lineToken = localStorage.getItem('lineToken');
        const userPhone = localStorage.getItem('userPhone');
        
        if (lineToken && userPhone) {
          console.log("[DEBUG] Found LINE token and phone number, authenticating...");
          setIsAuthenticated(true);
          setPhoneNumber(userPhone);
          
          // Fetch patients associated with this phone number
          const { data: patientData, error: patientError } = await supabase
            .from('patients')
            .select('*')
            .eq('phone', userPhone);
          
          if (patientError) throw patientError;
          
          if (patientData && patientData.length > 0) {
            console.log("[DEBUG] Found patients:", patientData.length);
            setPatients(patientData);
            
            // Check if there are active queues for any of these patients
            const patientIds = patientData.map(p => p.id);
            const { data: queueData, error: queueError } = await supabase
              .from('queues')
              .select('*')
              .in('patient_id', patientIds)
              .in('status', ['WAITING', 'ACTIVE'])
              .order('created_at', { ascending: false });
            
            if (queueError) throw queueError;
            
            if (queueData && queueData.length > 0) {
              console.log("[DEBUG] Found queues:", queueData.length);
              // Convert string type to QueueType and string status to QueueStatus
              const typedQueues: Queue[] = queueData.map(queue => ({
                ...queue,
                type: queue.type as QueueTypeEnum,
                status: queue.status as QueueStatus
              }));
              
              setAvailableQueues(typedQueues);
              
              // If there's only one queue, auto-select it
              if (typedQueues.length === 1) {
                const singleQueue = typedQueues[0];
                setActiveQueue(singleQueue);
                
                // Find which patient this queue belongs to
                const queuePatient = patientData.find(p => p.id === singleQueue.patient_id);
                if (queuePatient) {
                  setSelectedPatient(queuePatient);
                } else {
                  setSelectedPatient(patientData[0]);
                }
              }
              // If multiple queues, let user select (don't auto-select)
            } else {
              console.log("[DEBUG] No active queues found");
              // No active queues, select first patient for profile view
              setSelectedPatient(patientData[0]);
            }
          } else {
            console.log("[DEBUG] No patients found for phone:", userPhone);
            // No patients found for this phone number
            toast.info('ไม่พบข้อมูลผู้ป่วยที่เชื่อมโยงกับเบอร์โทรศัพท์นี้');
          }
        } else {
          console.log("[DEBUG] No LINE token or phone number found");
          // No LINE token or phone number found
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        toast.error('เกิดข้อผิดพลาดในการตรวจสอบการเข้าสู่ระบบ');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleLineLoginSuccess = async (token: string, userPhone: string) => {
    localStorage.setItem('lineToken', token);
    localStorage.setItem('userPhone', userPhone);
    setIsAuthenticated(true);
    setPhoneNumber(userPhone);
    setIsStaffMode(false);
    
    // Reload the page to fetch patient data
    window.location.reload();
  };

  const handlePatientFound = async (patient: Patient) => {
    setIsAuthenticated(true);
    setIsStaffMode(true);
    setSelectedPatient(patient);
    setPatients([patient]);
    
    // Check if there's an active queue for this patient
    try {
      // Add date filtering to only show recent queues (e.g., last 24 hours)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const { data: queueData, error: queueError } = await supabase
        .from('queues')
        .select('*')
        .eq('patient_id', patient.id)
        .in('status', ['WAITING', 'ACTIVE'])
        .gte('created_at', oneDayAgo.toISOString())
        .order('created_at', { ascending: false });
      
      if (queueError) throw queueError;
      
      if (queueData && queueData.length > 0) {
        // Convert string type to QueueType and string status to QueueStatus
        const typedQueues: Queue[] = queueData.map(queue => ({
          ...queue,
          type: queue.type as QueueTypeEnum,
          status: queue.status as QueueStatus
        }));
        
        setAvailableQueues(typedQueues);
        
        // If single queue, auto-select it
        if (typedQueues.length === 1) {
          setActiveQueue(typedQueues[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching patient queue:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lineToken');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('stepOutData');
    setIsAuthenticated(false);
    setSelectedPatient(null);
    setPatients([]);
    setActiveQueue(null);
    setAvailableQueues([]);
    setPhoneNumber(null);
    setIsStaffMode(false);
  };

  const handleSwitchPatient = () => {
    setActiveQueue(null);
    setAvailableQueues([]);
  };

  const handleSwitchQueue = () => {
    setActiveQueue(null);
  };

  const handleSelectQueue = (queue: Queue) => {
    setActiveQueue(queue);
    // Find which patient this queue belongs to
    const queuePatient = patients.find(p => p.id === queue.patient_id);
    if (queuePatient) {
      setSelectedPatient(queuePatient);
    }
  };

  // Move this function up before it's used
  const handleClearQueueHistory = async () => {
    try {
      if (!selectedPatient) return;
      
      // Mark all WAITING or ACTIVE queues as COMPLETED for this patient
      const { error } = await supabase
        .from('queues')
        .update({ status: 'COMPLETED', completed_at: new Date().toISOString() })
        .in('status', ['WAITING', 'ACTIVE'])
        .eq('patient_id', selectedPatient.id);
      
      if (error) throw error;
      
      toast.success('ล้างประวัติคิวเก่าเรียบร้อยแล้ว');
      setActiveQueue(null);
      setAvailableQueues([]);
    } catch (error) {
      console.error('Error clearing queue history:', error);
      toast.error('เกิดข้อผิดพลาดในการล้างประวัติคิว');
    }
  };

  if (loading) {
    return <PatientPortalLoading />;
  }

  if (!isAuthenticated) {
    return (
      <PatientPortalAuth 
        onLoginSuccess={handleLineLoginSuccess} 
        onPatientSelect={handlePatientFound}
      />
    );
  }

  // Show queue selector when multiple queues are available but none selected
  if (availableQueues.length > 1 && !activeQueue) {
    return (
      <PatientQueueSelector
        queues={availableQueues}
        patients={patients}
        onSelectQueue={handleSelectQueue}
        onLogout={handleLogout}
      />
    );
  }

  // Show active queue view when a queue is selected
  if (activeQueue && selectedPatient) {
    return (
      <ActiveQueueView
        patient={selectedPatient}
        queue={activeQueue}
        patients={patients}
        onLogout={handleLogout}
        onSwitchPatient={handleSwitchPatient}
        onSwitchQueue={availableQueues.length > 1 ? handleSwitchQueue : undefined}
        onClearQueueHistory={handleClearQueueHistory}
      />
    );
  }

  // Show patient selection view when no active queues
  return (
    <PatientSelectionView
      patients={patients}
      selectedPatient={selectedPatient}
      onSelectPatient={handlePatientSelect}
      onLogout={handleLogout}
      onClearQueueHistory={handleClearQueueHistory}
    />
  );
};

export default PatientPortal;
